
CREATE TABLE public.transcript_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  transcript TEXT NOT NULL DEFAULT '',
  edited_by UUID REFERENCES auth.users(id),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (consultation_id, version)
);
CREATE INDEX transcript_versions_consultation_idx ON public.transcript_versions(consultation_id, version DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.transcript_versions TO authenticated;
GRANT ALL ON public.transcript_versions TO service_role;

ALTER TABLE public.transcript_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view own transcript versions"
  ON public.transcript_versions FOR SELECT TO authenticated
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can insert own transcript versions"
  ON public.transcript_versions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can delete own transcript versions"
  ON public.transcript_versions FOR DELETE TO authenticated
  USING (auth.uid() = doctor_id);
