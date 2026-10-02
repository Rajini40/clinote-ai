-- Ownership FKs (cascade on account deletion)
ALTER TABLE public.soap_notes ADD CONSTRAINT soap_notes_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.alerts ADD CONSTRAINT alerts_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.reports ADD CONSTRAINT reports_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.activity_logs ADD CONSTRAINT activity_logs_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- edited_by previously blocked user deletion
ALTER TABLE public.transcript_versions DROP CONSTRAINT transcript_versions_edited_by_fkey;
ALTER TABLE public.transcript_versions ADD CONSTRAINT transcript_versions_edited_by_fkey FOREIGN KEY (edited_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- One SOAP note per consultation (app already treats it that way)
ALTER TABLE public.soap_notes ADD CONSTRAINT soap_notes_consultation_id_key UNIQUE (consultation_id);

-- Missing FK-side indexes
CREATE INDEX IF NOT EXISTS alerts_consultation_idx ON public.alerts (consultation_id);
CREATE INDEX IF NOT EXISTS alerts_patient_idx ON public.alerts (patient_id);
CREATE INDEX IF NOT EXISTS reports_consultation_idx ON public.reports (consultation_id);
CREATE INDEX IF NOT EXISTS notifications_unread_idx ON public.notifications (user_id) WHERE read = false;

-- Prevent linking rows to another doctor's consultation/patient.
-- SECURITY INVOKER: lookups go through RLS, so rows the caller can't see fail.
CREATE OR REPLACE FUNCTION public.enforce_consultation_owner()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.consultation_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.consultations c WHERE c.id = NEW.consultation_id AND c.doctor_id = NEW.doctor_id
  ) THEN
    RAISE EXCEPTION 'consultation does not belong to this doctor';
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.enforce_patient_owner()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.patient_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.patients p WHERE p.id = NEW.patient_id AND p.doctor_id = NEW.doctor_id
  ) THEN
    RAISE EXCEPTION 'patient does not belong to this doctor';
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER soap_notes_owner_chk BEFORE INSERT OR UPDATE OF consultation_id, doctor_id ON public.soap_notes FOR EACH ROW EXECUTE FUNCTION public.enforce_consultation_owner();
CREATE TRIGGER transcript_versions_owner_chk BEFORE INSERT ON public.transcript_versions FOR EACH ROW EXECUTE FUNCTION public.enforce_consultation_owner();
CREATE TRIGGER reports_owner_chk BEFORE INSERT OR UPDATE OF consultation_id, doctor_id ON public.reports FOR EACH ROW EXECUTE FUNCTION public.enforce_consultation_owner();
CREATE TRIGGER alerts_consult_owner_chk BEFORE INSERT OR UPDATE OF consultation_id, doctor_id ON public.alerts FOR EACH ROW EXECUTE FUNCTION public.enforce_consultation_owner();
CREATE TRIGGER alerts_patient_owner_chk BEFORE INSERT OR UPDATE OF patient_id, doctor_id ON public.alerts FOR EACH ROW EXECUTE FUNCTION public.enforce_patient_owner();
CREATE TRIGGER consultations_patient_owner_chk BEFORE INSERT OR UPDATE OF patient_id, doctor_id ON public.consultations FOR EACH ROW EXECUTE FUNCTION public.enforce_patient_owner();