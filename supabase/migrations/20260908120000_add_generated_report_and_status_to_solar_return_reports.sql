-- Conservar el original Gemini junto a la versión profesional editable.
-- No modifica 20260907200000_create_solar_return_reports.sql ni anteriores.
-- Informes existentes: generated_report = report actual; status = draft;
-- updated_at = created_at.
-- Revisar antes de aplicar. No aplicar desde este prompt.

ALTER TABLE public.solar_return_reports
  ADD COLUMN generated_report jsonb;

UPDATE public.solar_return_reports
SET generated_report = report
WHERE generated_report IS NULL;

ALTER TABLE public.solar_return_reports
  ALTER COLUMN generated_report SET NOT NULL;

ALTER TABLE public.solar_return_reports
  ADD CONSTRAINT solar_return_reports_generated_report_object_check
  CHECK (jsonb_typeof(generated_report) = 'object');

ALTER TABLE public.solar_return_reports
  ADD COLUMN status text NOT NULL DEFAULT 'draft';

ALTER TABLE public.solar_return_reports
  ADD CONSTRAINT solar_return_reports_status_check
  CHECK (status IN ('draft', 'reviewed', 'ready'));

ALTER TABLE public.solar_return_reports
  ADD COLUMN updated_at timestamptz;

UPDATE public.solar_return_reports
SET updated_at = created_at
WHERE updated_at IS NULL;

ALTER TABLE public.solar_return_reports
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE public.solar_return_reports
  ALTER COLUMN updated_at SET NOT NULL;

CREATE OR REPLACE FUNCTION public.protect_solar_return_report_generation()
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
     OR NEW.solar_return_id IS DISTINCT FROM OLD.solar_return_id
  THEN
    RAISE EXCEPTION 'solar return report generation fields are immutable';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER solar_return_reports_protect_generation
BEFORE UPDATE ON public.solar_return_reports
FOR EACH ROW
EXECUTE PROCEDURE public.protect_solar_return_report_generation();

CREATE TRIGGER solar_return_reports_set_updated_at
BEFORE UPDATE ON public.solar_return_reports
FOR EACH ROW
EXECUTE PROCEDURE public.set_updated_at();

CREATE POLICY "Professionals can update own solar return reports"
  ON public.solar_return_reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = solar_return_reports.client_id
        AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = solar_return_reports.client_id
        AND clients.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.solar_returns
      WHERE solar_returns.id = solar_return_reports.solar_return_id
        AND solar_returns.client_id = solar_return_reports.client_id
    )
  );

GRANT UPDATE ON TABLE public.solar_return_reports TO authenticated;

NOTIFY pgrst, 'reload schema';
