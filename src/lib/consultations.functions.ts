import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const consultInput = z.object({
  patient_id: z.string().uuid().nullable().optional(),
  patient_name: z.string().trim().min(1).max(120),
  language: z.string().max(40).default("English"),
  chief_complaint: z.string().max(2000).nullable().optional(),
  diagnosis: z.string().max(400).nullable().optional(),
  transcript: z.string().max(200_000).nullable().optional(),
  duration_seconds: z.number().int().min(0).max(60 * 60 * 12).optional(),
  status: z.enum(["Draft", "Completed", "Review", "Alert"]).default("Draft"),
  audio_path: z.string().max(500).nullable().optional(),
});

export const listConsultations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("consultations")
      .select("id, patient_id, patient_name, language, diagnosis, chief_complaint, status, duration_seconds, audio_path, pdf_path, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getConsultation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("consultations").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const createConsultation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => consultInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("consultations")
      .insert({ ...data, doctor_id: context.userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    await context.supabase.from("activity_logs").insert({
      doctor_id: context.userId, action: "consultation.created", entity: "consultation", entity_id: row.id,
    });
    return row;
  });

export const updateConsultation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => consultInput.partial().extend({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const { data: row, error } = await context.supabase
      .from("consultations").update(rest).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteConsultation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("consultations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
