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
 * Placeholder for FastAPI integration.
 * Wire this to your FastAPI backend that runs Whisper + Gemini + PDF generation.
 * Set FASTAPI_URL and FASTAPI_TOKEN as secrets when ready.
 */
export const generateSoapFromConsultation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ consultation_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const apiUrl = process.env.FASTAPI_URL;
    if (!apiUrl) {
      throw new Error("SOAP generation service is not configured yet. FASTAPI backend pending.");
    }
    const res = await fetch(`${apiUrl.replace(/\/$/, "")}/generate-soap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.FASTAPI_TOKEN ? { Authorization: `Bearer ${process.env.FASTAPI_TOKEN}` } : {}),
      },
      body: JSON.stringify({ consultation_id: data.consultation_id, doctor_id: context.userId }),
    });
    if (!res.ok) throw new Error(`SOAP service error: ${res.status}`);
    return await res.json();
  });
