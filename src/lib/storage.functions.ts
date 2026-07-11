import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BUCKETS = ["consultation-audio", "generated-pdfs", "patient-documents", "profile-images"] as const;
const bucketSchema = z.enum(BUCKETS);

/**
 * Returns a short-lived signed URL for a private object.
 * Path must live in the caller's own top-level folder (enforced by RLS).
 */
export const getSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      bucket: bucketSchema,
      path: z.string().min(1).max(500),
      expiresIn: z.number().int().min(30).max(60 * 60 * 24).default(3600),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: signed, error } = await context.supabase.storage
      .from(data.bucket)
      .createSignedUrl(data.path, data.expiresIn);
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl };
  });

/** Signed upload URL — clients PUT the file directly. */
export const getUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      bucket: bucketSchema,
      filename: z.string().min(1).max(200),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${context.userId}/${Date.now()}-${safe}`;
    const { data: signed, error } = await context.supabase.storage
      .from(data.bucket)
      .createSignedUploadUrl(path);
    if (error) throw new Error(error.message);
    return { path, token: signed.token, signedUrl: signed.signedUrl, bucket: data.bucket };
  });
