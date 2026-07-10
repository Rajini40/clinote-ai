import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listConsultations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("consultations")
      .select("id, patient_name, language, diagnosis, status, duration_seconds, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getConsultationStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [pt, cs] = await Promise.all([
      context.supabase.from("patients").select("id", { count: "exact", head: true }),
      context.supabase.from("consultations").select("id, status, language, created_at"),
    ]);
    const consults = cs.data ?? [];
    return {
      totalPatients: pt.count ?? 0,
      totalConsultations: consults.length,
      completed: consults.filter((c) => c.status === "Completed").length,
      alerts: consults.filter((c) => c.status === "Alert").length,
    };
  });
