-- Conservar el original Gemini junto a la versión profesional editable.
-- No modifica 20260902183000_create_transit_analysis_reports.sql ni anteriores.
-- Informes existentes: generated_report = report actual; status = draft.
-- Revisar antes de aplicar. No aplicar desde este prompt.

ALTER TABLE public.transit_analysis_reports
  ADD COLUMN generated_report jsonb;

UPDATE public.transit_analysis_reports
SET generated_report = report
WHERE generated_report IS NULL;

ALTER TABLE public.transit_analysis_reports
  ALTER COLUMN generated_report SET NOT NULL;

ALTER TABLE public.transit_analysis_reports
  ADD CONSTRAINT transit_analysis_reports_generated_report_object_check
  CHECK (jsonb_typeof(generated_report) = 'object');

ALTER TABLE public.transit_analysis_reports
  ADD COLUMN status text NOT NULL DEFAULT 'draft';

ALTER TABLE public.transit_analysis_reports
  ADD CONSTRAINT transit_analysis_reports_status_check
  CHECK (status IN ('draft', 'reviewed', 'ready'));

CREATE OR REPLACE FUNCTION public.protect_transit_analysis_report_generation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.generated_report IS DISTINCT FROM OLD.generated_report
     OR NEW.report_version IS DISTINCT FROM OLD.report_version
     OR NEW.methodology_version IS DISTINCT FROM OLD.methodology_version
     OR NEW.generated_at IS DISTINCT FROM OLD.generated_at
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
     OR NEW.client_id IS DISTINCT FROM OLD.client_id
     OR NEW.transit_analysis_id IS DISTINCT FROM OLD.transit_analysis_id
  THEN
    RAISE EXCEPTION 'transit analysis report generation fields are immutable';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER transit_analysis_reports_protect_generation
BEFORE UPDATE ON public.transit_analysis_reports
FOR EACH ROW
EXECUTE PROCEDURE public.protect_transit_analysis_report_generation();

CREATE POLICY "Professionals can update own transit analysis reports"
  ON public.transit_analysis_reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = transit_analysis_reports.client_id
        AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = transit_analysis_reports.client_id
        AND clients.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.transit_analyses
      WHERE transit_analyses.id = transit_analysis_reports.transit_analysis_id
        AND transit_analyses.client_id = transit_analysis_reports.client_id
    )
  );

GRANT UPDATE ON TABLE public.transit_analysis_reports TO authenticated;

NOTIFY pgrst, 'reload schema';
