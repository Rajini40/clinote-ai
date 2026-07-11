import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listAlerts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const acknowledgeAlert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("alerts")
      .update({ acknowledged: true }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const createAlert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      consultation_id: z.string().uuid().nullable().optional(),
      patient_id: z.string().uuid().nullable().optional(),
      severity: z.enum(["info", "warning", "high", "critical"]).default("info"),
      title: z.string().min(1).max(200),
      message: z.string().max(2000).nullable().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("alerts")
      .insert({ ...data, doctor_id: context.userId }).select().single();
    if (error) throw new Error(error.message);
    return row;
  });
