-- Conservar el snapshot original de Gemini junto a la versión profesional.
-- Ejecutar en Supabase: SQL Editor → New query → pegar este archivo → Run.
-- No modifica migraciones anteriores.
-- Informes existentes: generated_report = report actual (todavía no editados).

ALTER TABLE public.natal_chart_reports
  ADD COLUMN generated_report jsonb;

UPDATE public.natal_chart_reports
SET generated_report = report
WHERE generated_report IS NULL;

ALTER TABLE public.natal_chart_reports
  ALTER COLUMN generated_report SET NOT NULL;

ALTER TABLE public.natal_chart_reports
  ADD CONSTRAINT natal_chart_reports_generated_report_object_check
  CHECK (jsonb_typeof(generated_report) = 'object');

CREATE OR REPLACE FUNCTION public.protect_natal_chart_report_generation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.generated_report IS DISTINCT FROM OLD.generated_report
     OR NEW.report_version IS DISTINCT FROM OLD.report_version
     OR NEW.paula_lens_version IS DISTINCT FROM OLD.paula_lens_version
     OR NEW.gemini_model IS DISTINCT FROM OLD.gemini_model
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
     OR NEW.client_id IS DISTINCT FROM OLD.client_id
     OR NEW.natal_chart_id IS DISTINCT FROM OLD.natal_chart_id
     OR NEW.generation_duration_ms IS DISTINCT FROM OLD.generation_duration_ms
  THEN
    RAISE EXCEPTION 'natal chart report generation fields are immutable';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER natal_chart_reports_protect_generation
BEFORE UPDATE ON public.natal_chart_reports
FOR EACH ROW
EXECUTE PROCEDURE public.protect_natal_chart_report_generation();

NOTIFY pgrst, 'reload schema';
