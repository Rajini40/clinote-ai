import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function snapshot(
  supabase: any,
  userId: string,
  consultationId: string,
  transcript: string,
  note?: string,
) {
  const { data: last } = await supabase
    .from("transcript_versions")
    .select("version")
    .eq("consultation_id", consultationId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextVersion = (last?.version ?? 0) + 1;
  await supabase.from("transcript_versions").insert({
    consultation_id: consultationId,
    doctor_id: userId,
    edited_by: userId,
    version: nextVersion,
    transcript,
    note: note ?? null,
  });
  return nextVersion;
}

export const getTranscript = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ consultation_id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("consultations")
      .select("id, transcript, updated_at")
      .eq("id", data.consultation_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const listTranscriptVersions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ consultation_id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("transcript_versions")
      .select("id, version, transcript, note, created_at, edited_by")
      .eq("consultation_id", data.consultation_id)
      .order("version", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const saveInput = z.object({
  consultation_id: z.string().uuid(),
  transcript: z.string().max(200_000),
  note: z.string().max(200).optional(),
});

export const saveTranscript = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => saveInput.parse(d))
  .handler(async ({ data, context }) => {
    // Ensure the consultation belongs to this doctor (RLS also enforces).
    const { data: consult, error: cErr } = await context.supabase
      .from("consultations")
      .select("id, transcript, doctor_id")
      .eq("id", data.consultation_id)
      .maybeSingle();
    if (cErr) throw new Error(cErr.message);
    if (!consult) throw new Error("Consultation not found.");

    const previous = consult.transcript ?? "";
    if (previous === data.transcript) {
      return { ok: true, unchanged: true, version: null as number | null };
    }

    // If there is no version yet, seed the current transcript as v1 before saving the edit.
    const { count } = await context.supabase
      .from("transcript_versions")
      .select("id", { count: "exact", head: true })
      .eq("consultation_id", data.consultation_id);

    if ((count ?? 0) === 0 && previous) {
      await snapshot(context.supabase, context.userId, data.consultation_id, previous, "Original transcript");
    }

    const version = await snapshot(
      context.supabase,
      context.userId,
      data.consultation_id,
      data.transcript,
      data.note,
    );

    const { error: uErr } = await context.supabase
      .from("consultations")
      .update({ transcript: data.transcript })
      .eq("id", data.consultation_id);
    if (uErr) throw new Error(uErr.message);

    await context.supabase.from("activity_logs").insert({
      doctor_id: context.userId,
      action: "transcript.edited",
      entity: "consultation",
      entity_id: data.consultation_id,
      metadata: { version },
    });

    return { ok: true, unchanged: false, version };
  });

export const restoreTranscriptVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      consultation_id: z.string().uuid(),
      version_id: z.string().uuid(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: v, error } = await context.supabase
      .from("transcript_versions")
      .select("id, version, transcript")
      .eq("id", data.version_id)
      .eq("consultation_id", data.consultation_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!v) throw new Error("Version not found.");

    const { data: consult } = await context.supabase
      .from("consultations")
      .select("transcript")
      .eq("id", data.consultation_id)
      .maybeSingle();
    const current = consult?.transcript ?? "";

    if (current !== v.transcript) {
      const newVersion = await snapshot(
        context.supabase,
        context.userId,
        data.consultation_id,
        v.transcript,
        `Restored from v${v.version}`,
      );
      const { error: uErr } = await context.supabase
        .from("consultations")
        .update({ transcript: v.transcript })
        .eq("id", data.consultation_id);
      if (uErr) throw new Error(uErr.message);
      await context.supabase.from("activity_logs").insert({
        doctor_id: context.userId,
        action: "transcript.restored",
        entity: "consultation",
        entity_id: data.consultation_id,
        metadata: { restored_from: v.version, new_version: newVersion },
      });
      return { ok: true, version: newVersion };
    }
    return { ok: true, version: v.version, unchanged: true };
  });
