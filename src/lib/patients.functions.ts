import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listPatients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("patients")
      .select("id, full_name, age, gender, contact, medical_history, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const patientInput = z.object({
  full_name: z.string().trim().min(1).max(120),
  age: z.number().int().min(0).max(150).nullable().optional(),
  gender: z.string().max(20).nullable().optional(),
  contact: z.string().max(60).nullable().optional(),
  medical_history: z.string().max(4000).nullable().optional(),
});

export const createPatient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => patientInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("patients")
      .insert({ ...data, doctor_id: context.userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deletePatient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("patients").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
