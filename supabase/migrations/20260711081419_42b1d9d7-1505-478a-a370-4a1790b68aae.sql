
-- Extend role enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'admin';
  END IF;
END $$;

-- Extend existing tables
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS blood_group text,
  ADD COLUMN IF NOT EXISTS allergies text;

ALTER TABLE public.consultations
  ADD COLUMN IF NOT EXISTS chief_complaint text,
  ADD COLUMN IF NOT EXISTS audio_path text,
  ADD COLUMN IF NOT EXISTS pdf_path text,
  ADD COLUMN IF NOT EXISTS tags text[];

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS hospital text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS theme text DEFAULT 'dark',
  ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'English',
  ADD COLUMN IF NOT EXISTS notify_email boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_alerts boolean DEFAULT true;

-- Indexes
CREATE INDEX IF NOT EXISTS patients_doctor_idx ON public.patients(doctor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS consultations_doctor_idx ON public.consultations(doctor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS consultations_patient_idx ON public.consultations(patient_id);
CREATE INDEX IF NOT EXISTS consultations_status_idx ON public.consultations(status);
CREATE INDEX IF NOT EXISTS consultations_language_idx ON public.consultations(language);

-- soap_notes
CREATE TABLE IF NOT EXISTS public.soap_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL,
  subjective text,
  objective text,
  assessment text,
  plan text,
  medication text,
  summary text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.soap_notes TO authenticated;
GRANT ALL ON public.soap_notes TO service_role;
ALTER TABLE public.soap_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "SOAP: own or admin" ON public.soap_notes FOR ALL TO authenticated
  USING (auth.uid() = doctor_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = doctor_id);
CREATE INDEX IF NOT EXISTS soap_notes_consult_idx ON public.soap_notes(consultation_id);
CREATE INDEX IF NOT EXISTS soap_notes_doctor_idx ON public.soap_notes(doctor_id, created_at DESC);

-- alerts
CREATE TABLE IF NOT EXISTS public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid REFERENCES public.consultations(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL,
  patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  severity text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  message text,
  acknowledged boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alerts TO authenticated;
GRANT ALL ON public.alerts TO service_role;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Alerts: own or admin" ON public.alerts FOR ALL TO authenticated
  USING (auth.uid() = doctor_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = doctor_id);
CREATE INDEX IF NOT EXISTS alerts_doctor_idx ON public.alerts(doctor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS alerts_severity_idx ON public.alerts(severity);

-- activity_logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL,
  action text NOT NULL,
  entity text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Activity: own read" ON public.activity_logs FOR SELECT TO authenticated
  USING (auth.uid() = doctor_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Activity: own insert" ON public.activity_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = doctor_id);
CREATE INDEX IF NOT EXISTS activity_logs_doctor_idx ON public.activity_logs(doctor_id, created_at DESC);

-- reports
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL,
  consultation_id uuid REFERENCES public.consultations(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'soap_pdf',
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reports: own or admin" ON public.reports FOR ALL TO authenticated
  USING (auth.uid() = doctor_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = doctor_id);
CREATE INDEX IF NOT EXISTS reports_doctor_idx ON public.reports(doctor_id, created_at DESC);

-- languages
CREATE TABLE IF NOT EXISTS public.languages (
  code text PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.languages TO authenticated;
GRANT ALL ON public.languages TO service_role;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Languages: read all" ON public.languages FOR SELECT TO authenticated USING (true);

INSERT INTO public.languages(code, name) VALUES
  ('en','English'),('te','Telugu'),('hi','Hindi'),('ta','Tamil'),
  ('kn','Kannada'),('bn','Bengali'),('mr','Marathi'),('gu','Gujarati'),
  ('ml','Malayalam'),('ur','Urdu')
ON CONFLICT (code) DO NOTHING;

-- Updated_at triggers
DROP TRIGGER IF EXISTS soap_notes_touch ON public.soap_notes;
CREATE TRIGGER soap_notes_touch BEFORE UPDATE ON public.soap_notes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS alerts_touch ON public.alerts;
CREATE TRIGGER alerts_touch BEFORE UPDATE ON public.alerts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS reports_touch ON public.reports;
CREATE TRIGGER reports_touch BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS patients_touch ON public.patients;
CREATE TRIGGER patients_touch BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS consultations_touch ON public.consultations;
CREATE TRIGGER consultations_touch BEFORE UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS profiles_touch ON public.profiles;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
