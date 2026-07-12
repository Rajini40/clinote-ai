import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const soapInput = z.object({
  consultation_id: z.string().uuid(),
  subjective: z.string().max(20_000).nullable().optional(),
  objective: z.string().max(20_000).nullable().optional(),
  assessment: z.string().max(20_000).nullable().optional(),
  plan: z.string().max(20_000).nullable().optional(),
  medication: z.string().max(20_000).nullable().optional(),
  summary: z.string().max(20_000).nullable().optional(),
  payload: z.any().nullable().optional(),
});

export const getSoapByConsultation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ consultation_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("soap_notes").select("*").eq("consultation_id", data.consultation_id)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const saveSoap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => soapInput.parse(d))
  .handler(async ({ data, context }) => {
    const existing = await context.supabase
      .from("soap_notes").select("id").eq("consultation_id", data.consultation_id)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();

    let row;
    if (existing.data?.id) {
      const { data: r, error } = await context.supabase
        .from("soap_notes").update(data).eq("id", existing.data.id).select().single();
      if (error) throw new Error(error.message);
      row = r;
    } else {
      const { data: r, error } = await context.supabase
        .from("soap_notes")
        .insert({ ...data, doctor_id: context.userId })
        .select().single();
      if (error) throw new Error(error.message);
      row = r;
    }

    await context.supabase.from("activity_logs").insert({
      doctor_id: context.userId, action: "soap.saved", entity: "soap_note", entity_id: row.id,
    });
    return row;
  });

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";

/**
 * Full AI pipeline for a consultation:
 * 1. Download the uploaded audio from Supabase Storage.
 * 2. Transcribe it via Lovable AI (openai/gpt-4o-transcribe).
 * 3. Persist the transcript on the consultation row.
 * 4. Generate a structured SOAP note (openai/gpt-5.5, JSON output).
 * 5. Upsert the note into `soap_notes`.
 * 6. Mark the consultation Completed.
 */
export const generateSoapFromConsultation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ consultation_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI backend is not configured (missing LOVABLE_API_KEY).");

    // 1. Load consultation
    const { data: consult, error: cErr } = await context.supabase
      .from("consultations")
      .select("id, audio_path, language, chief_complaint, patient_name, transcript")
      .eq("id", data.consultation_id)
      .single();
    if (cErr || !consult) throw new Error(cErr?.message ?? "Consultation not found");

    // 2. Get transcript — reuse existing one if present, else transcribe audio
    let transcript = consult.transcript ?? "";

    if (!transcript) {
      if (!consult.audio_path) {
        throw new Error("No audio uploaded for this consultation.");
      }
      const { data: audioBlob, error: dlErr } = await context.supabase.storage
        .from("consultation-audio")
        .download(consult.audio_path);
      if (dlErr || !audioBlob) throw new Error(`Audio download failed: ${dlErr?.message ?? "unknown"}`);

      const form = new FormData();
      const filename = consult.audio_path.split("/").pop() ?? "audio.webm";
      form.append("file", audioBlob, filename);
      form.append("model", "openai/gpt-4o-transcribe");

      const tRes = await fetch(`${GATEWAY_URL}/audio/transcriptions`, {
        method: "POST",
        headers: { "Lovable-API-Key": apiKey },
        body: form,
      });
      if (!tRes.ok) {
        const body = await tRes.text().catch(() => "");
        throw new Error(`Transcription failed (${tRes.status}): ${body.slice(0, 300)}`);
      }
      const tJson = (await tRes.json()) as { text?: string };
      transcript = (tJson.text ?? "").trim();
      if (!transcript) throw new Error("Transcription returned empty text.");

      // 3. Store transcript
      const { error: upErr } = await context.supabase
        .from("consultations")
        .update({ transcript })
        .eq("id", consult.id);
      if (upErr) throw new Error(upErr.message);
    }

    // 4. Generate structured SOAP
    const systemPrompt = `You are a senior clinical documentation assistant. Given a raw doctor-patient consultation transcript (which may be multilingual), produce a concise, accurate SOAP note in English. Never invent findings, medications, or diagnoses that are not supported by the transcript. If a section has no information, return an empty string.`;
    const userPrompt = `Patient: ${consult.patient_name}
Consultation language: ${consult.language}
Chief complaint (doctor-entered): ${consult.chief_complaint ?? "(none)"}

Transcript:
"""
${transcript}
"""

Return a JSON object with these string fields:
- subjective: patient-reported history, symptoms, context.
- objective: exam findings, vitals, observed signs.
- assessment: clinical impression / differential / diagnosis.
- plan: investigations, procedures, follow-up.
- medication: prescribed drugs with dose, route, frequency, duration (one per line).
- summary: 2-4 sentence lay summary the patient can understand.`;

    const soapRes = await fetch(`${GATEWAY_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "openai/gpt-5.5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "soap_note",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["subjective", "objective", "assessment", "plan", "medication", "summary"],
              properties: {
                subjective: { type: "string" },
                objective: { type: "string" },
                assessment: { type: "string" },
                plan: { type: "string" },
                medication: { type: "string" },
                summary: { type: "string" },
              },
            },
          },
        },
      }),
    });

    if (!soapRes.ok) {
      const body = await soapRes.text().catch(() => "");
      if (soapRes.status === 429) throw new Error("AI rate limit reached. Please retry shortly.");
      if (soapRes.status === 402) throw new Error("AI credits exhausted. Add credits to continue.");
      throw new Error(`SOAP generation failed (${soapRes.status}): ${body.slice(0, 300)}`);
    }

    const soapJson = (await soapRes.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = soapJson.choices?.[0]?.message?.content ?? "";
    let parsed: {
      subjective: string; objective: string; assessment: string;
      plan: string; medication: string; summary: string;
    };
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("AI returned malformed SOAP JSON.");
    }

    // 5. Upsert soap_notes
    const existing = await context.supabase
      .from("soap_notes").select("id")
      .eq("consultation_id", consult.id)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();

    const noteRow = {
      consultation_id: consult.id,
      subjective: parsed.subjective ?? "",
      objective: parsed.objective ?? "",
      assessment: parsed.assessment ?? "",
      plan: parsed.plan ?? "",
      medication: parsed.medication ?? "",
      summary: parsed.summary ?? "",
      payload: parsed as unknown as import("@/integrations/supabase/types").Json,
    };

    let soapRow;
    if (existing.data?.id) {
      const { data: r, error } = await context.supabase
        .from("soap_notes").update(noteRow).eq("id", existing.data.id).select().single();
      if (error) throw new Error(error.message);
      soapRow = r;
    } else {
      const { data: r, error } = await context.supabase
        .from("soap_notes")
        .insert({ ...noteRow, doctor_id: context.userId })
        .select().single();
      if (error) throw new Error(error.message);
      soapRow = r;
    }

    // 6. Mark consultation Completed + mirror short fields
    await context.supabase
      .from("consultations")
      .update({
        status: "Completed",
        soap_subjective: parsed.subjective ?? null,
        soap_objective: parsed.objective ?? null,
        soap_assessment: parsed.assessment ?? null,
        soap_plan: parsed.plan ?? null,
      })
      .eq("id", consult.id);

    await context.supabase.from("activity_logs").insert({
      doctor_id: context.userId,
      action: "soap.generated",
      entity: "consultation",
      entity_id: consult.id,
    });

    return { ok: true, soap_id: soapRow.id, consultation_id: consult.id };
  });
