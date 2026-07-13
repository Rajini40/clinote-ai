import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [{ count: patientsCount }, consultsRes, alertsRes, { count: soapCount }] = await Promise.all([
      context.supabase.from("patients").select("id", { count: "exact", head: true }),
      context.supabase.from("consultations")
        .select("id, status, language, duration_seconds, diagnosis, patient_name, created_at")
        .order("created_at", { ascending: false }).limit(500),
      context.supabase.from("alerts")
        .select("id, severity, acknowledged, created_at")
        .eq("acknowledged", false),
      context.supabase.from("soap_notes").select("id", { count: "exact", head: true }),
    ]);
    const consults = consultsRes.data ?? [];
    const alerts = alertsRes.data ?? [];

    const todaysConsults = consults.filter((c) => new Date(c.created_at) >= today);
    const durations = consults.map((c) => c.duration_seconds ?? 0).filter((d) => d > 0);
    const avgDuration = durations.length
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;

    const langCounts: Record<string, number> = {};
    for (const c of consults) langCounts[c.language] = (langCounts[c.language] ?? 0) + 1;

    const completed = consults.filter((c) => (c.status ?? "").toLowerCase() === "completed").length;
    const pending = consults.filter((c) => {
      const s = (c.status ?? "").toLowerCase();
      return s === "pending" || s === "processing" || s === "in_progress" || s === "draft";
    }).length;

    return {
      totalPatients: patientsCount ?? 0,
      todaysConsultations: todaysConsults.length,
      totalConsultations: consults.length,
      completedConsultations: completed,
      pendingConsultations: pending,
      soapNotesGenerated: soapCount ?? 0,
      criticalAlerts: alerts.filter((a) => a.severity === "critical" || a.severity === "high").length,
      avgDurationSeconds: avgDuration,
      languagesUsed: Object.keys(langCounts).length,
      languageBreakdown: langCounts,
      recent: consults.slice(0, 10),
    };
  });

export const getAnalyticsData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const [consultsRes, alertsRes, patientsRes, { count: soapCount }] = await Promise.all([
      context.supabase.from("consultations")
        .select("id, language, diagnosis, duration_seconds, status, created_at")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: true }),
      context.supabase.from("alerts").select("id, severity, created_at")
        .gte("created_at", since.toISOString()),
      context.supabase.from("patients").select("id", { count: "exact", head: true }),
      context.supabase.from("soap_notes").select("id", { count: "exact", head: true })
        .gte("created_at", since.toISOString()),
    ]);

    const consults = consultsRes.data ?? [];
    const alerts = alertsRes.data ?? [];

    // Weekly buckets (last 7 days)
    const days: { d: string; v: number }[] = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(); dt.setHours(0, 0, 0, 0); dt.setDate(dt.getDate() - i);
      const next = new Date(dt); next.setDate(next.getDate() + 1);
      const v = consults.filter((c) => {
        const t = new Date(c.created_at);
        return t >= dt && t < next;
      }).length;
      days.push({ d: dayNames[dt.getDay()], v });
    }

    const langCounts: Record<string, number> = {};
    for (const c of consults) langCounts[c.language] = (langCounts[c.language] ?? 0) + 1;
    const langTotal = Object.values(langCounts).reduce((a, b) => a + b, 0) || 1;
    const languages = Object.entries(langCounts).map(([name, count]) => ({
      name, value: Math.round((count / langTotal) * 100), count,
    }));

    const dxCounts: Record<string, number> = {};
    for (const c of consults) {
      const dx = (c.diagnosis ?? "").trim();
      if (!dx) continue;
      dxCounts[dx] = (dxCounts[dx] ?? 0) + 1;
    }
    const topDiseases = Object.entries(dxCounts)
      .map(([d, v]) => ({ d, v }))
      .sort((a, b) => b.v - a.v)
      .slice(0, 6);

    const alertBySeverity: Record<string, number> = {};
    for (const a of alerts) alertBySeverity[a.severity] = (alertBySeverity[a.severity] ?? 0) + 1;

    const durations = consults.map((c) => c.duration_seconds ?? 0).filter((d) => d > 0);
    const avgDuration = durations.length
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;

    const completed = consults.filter((c) => (c.status ?? "").toLowerCase() === "completed").length;
    const pending = consults.filter((c) => {
      const s = (c.status ?? "").toLowerCase();
      return s === "pending" || s === "processing" || s === "in_progress" || s === "draft";
    }).length;

    return {
      totalPatients: patientsRes.count ?? 0,
      totalConsultations: consults.length,
      completedConsultations: completed,
      pendingConsultations: pending,
      soapNotesGenerated: soapCount ?? 0,
      avgDurationSeconds: avgDuration,
      criticalAlerts: alerts.filter((a) => a.severity === "critical" || a.severity === "high").length,
      weekly: days,
      languages,
      topDiseases,
      alertBySeverity,
    };
  });
