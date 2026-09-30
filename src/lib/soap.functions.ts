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

/**
 * Full AI pipeline for a consultation. AI calls live in `ai-provider.server.ts`
 * (to be swapped for the FastAPI backend); this function only orchestrates
 * storage, database writes, status updates and notifications.
 */
export const generateSoapFromConsultation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ consultation_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const setStatus = (status: string) =>
      context.supabase.from("consultations").update({ status }).eq("id", data.consultation_id);

    try {
      const { transcribeAudio, generateSoapNote } = await import("./ai-provider.server");

      // 1. Load consultation
      const { data: consult, error: cErr } = await context.supabase
        .from("consultations")
        .select("id, audio_path, language, chief_complaint, patient_name, transcript, status")
        .eq("id", data.consultation_id)
        .single();
      if (cErr || !consult) throw new Error(cErr?.message ?? "Consultation not found");

      // 2. Get transcript — reuse existing one if present, else transcribe audio
      let transcript = consult.transcript ?? "";

      if (!transcript) {
        if (!consult.audio_path) {
          throw new Error("No audio uploaded for this consultation.");
        }
        await setStatus("Transcribing");

        const { data: audioBlob, error: dlErr } = await context.supabase.storage
          .from("consultation-audio")
          .download(consult.audio_path);
        if (dlErr || !audioBlob) throw new Error(`Audio download failed: ${dlErr?.message ?? "unknown"}`);

        const filename = consult.audio_path.split("/").pop() ?? "audio.webm";
        transcript = await transcribeAudio(audioBlob, filename);

        // 3. Store transcript + snapshot v1 in transcript_versions
        const { error: upErr } = await context.supabase
          .from("consultations")
          .update({ transcript })
          .eq("id", consult.id);
        if (upErr) throw new Error(upErr.message);

        await context.supabase.from("transcript_versions").insert({
          consultation_id: consult.id,
          doctor_id: context.userId,
          edited_by: context.userId,
          version: 1,
          transcript,
          note: "AI transcription",
        });
      }

      // 4. Generate structured SOAP
      await setStatus("Generating SOAP");
      const parsed = await generateSoapNote({
        patientName: consult.patient_name,
        language: consult.language,
        chiefComplaint: consult.chief_complaint,
        transcript,
      });

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

      await context.supabase.from("notifications").insert([
        {
          user_id: context.userId,
          type: "soap_generated",
          title: "SOAP note ready",
          message: `SOAP note generated for ${consult.patient_name}.`,
          entity: "consultation",
          entity_id: consult.id,
        },
        {
          user_id: context.userId,
          type: "consultation_completed",
          title: "Consultation completed",
          message: `Consultation with ${consult.patient_name} marked completed.`,
          entity: "consultation",
          entity_id: consult.id,
        },
      ]);

      return { ok: true, soap_id: soapRow.id, consultation_id: consult.id };
    } catch (err) {
      await setStatus("Failed");
      const errMsg = err instanceof Error ? err.message : String(err);
      await context.supabase.from("activity_logs").insert({
        doctor_id: context.userId,
        action: "soap.failed",
        entity: "consultation",
        entity_id: data.consultation_id,
        metadata: { error: errMsg } as unknown as import("@/integrations/supabase/types").Json,
      });
      await context.supabase.from("notifications").insert({
        user_id: context.userId,
        type: "ai_failed",
        title: "AI processing failed",
        message: errMsg.slice(0, 500),
        entity: "consultation",
        entity_id: data.consultation_id,
      });
      throw err;
    }
  });
