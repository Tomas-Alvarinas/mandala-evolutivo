-- Versión consultante de Tránsitos, derivada del informe profesional ready.
-- No modifica 20260902191500 ni migraciones anteriores.
-- Revisar antes de aplicar. No aplicar desde este prompt.

CREATE TABLE public.transit_analysis_client_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients (id) ON DELETE CASCADE,
  transit_analysis_id uuid NOT NULL REFERENCES public.transit_analyses (id) ON DELETE CASCADE,
  professional_report_id uuid NOT NULL UNIQUE
    REFERENCES public.transit_analysis_reports (id) ON DELETE CASCADE,
  source_report jsonb NOT NULL CHECK (jsonb_typeof(source_report) = 'object'),
  client_report jsonb NOT NULL CHECK (jsonb_typeof(client_report) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX transit_analysis_client_reports_client_id_idx
  ON public.transit_analysis_client_reports (client_id);

CREATE INDEX transit_analysis_client_reports_analysis_id_idx
  ON public.transit_analysis_client_reports (transit_analysis_id);

CREATE TRIGGER transit_analysis_client_reports_set_updated_at
BEFORE UPDATE ON public.transit_analysis_client_reports
FOR EACH ROW
EXECUTE PROCEDURE public.set_updated_at();

CREATE OR REPLACE FUNCTION public.enforce_transit_analysis_client_report_insert()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.transit_analysis_reports
    WHERE transit_analysis_reports.id = NEW.professional_report_id
      AND transit_analysis_reports.client_id = NEW.client_id
      AND transit_analysis_reports.transit_analysis_id = NEW.transit_analysis_id
      AND transit_analysis_reports.status = 'ready'
  ) THEN
    RAISE EXCEPTION 'client report requires a ready professional transit report for the same client';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER transit_analysis_client_reports_enforce_insert
BEFORE INSERT ON public.transit_analysis_client_reports
FOR EACH ROW
EXECUTE PROCEDURE public.enforce_transit_analysis_client_report_insert();

CREATE OR REPLACE FUNCTION public.protect_transit_analysis_client_report_source()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.source_report IS DISTINCT FROM OLD.source_report
     OR NEW.client_id IS DISTINCT FROM OLD.client_id
     OR NEW.transit_analysis_id IS DISTINCT FROM OLD.transit_analysis_id
     OR NEW.professional_report_id IS DISTINCT FROM OLD.professional_report_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'transit analysis client report source fields are immutable';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER transit_analysis_client_reports_protect_source
BEFORE UPDATE ON public.transit_analysis_client_reports
FOR EACH ROW
EXECUTE PROCEDURE public.protect_transit_analysis_client_report_source();

ALTER TABLE public.transit_analysis_client_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can select own transit analysis client reports"
  ON public.transit_analysis_client_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = transit_analysis_client_reports.client_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can insert own transit analysis client reports"
  ON public.transit_analysis_client_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = transit_analysis_client_reports.client_id
        AND clients.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.transit_analysis_reports
      WHERE transit_analysis_reports.id = transit_analysis_client_reports.professional_report_id
        AND transit_analysis_reports.client_id = transit_analysis_client_reports.client_id
        AND transit_analysis_reports.transit_analysis_id = transit_analysis_client_reports.transit_analysis_id
    )
  );

CREATE POLICY "Professionals can update own transit analysis client reports"
  ON public.transit_analysis_client_reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = transit_analysis_client_reports.client_id
        AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = transit_analysis_client_reports.client_id
        AND clients.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.transit_analysis_reports
      WHERE transit_analysis_reports.id = transit_analysis_client_reports.professional_report_id
        AND transit_analysis_reports.client_id = transit_analysis_client_reports.client_id
        AND transit_analysis_reports.transit_analysis_id = transit_analysis_client_reports.transit_analysis_id
    )
  );

CREATE POLICY "Professionals can delete own transit analysis client reports"
  ON public.transit_analysis_client_reports
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = transit_analysis_client_reports.client_id
        AND clients.user_id = auth.uid()
    )
  );

REVOKE ALL ON TABLE public.transit_analysis_client_reports FROM PUBLIC, anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.transit_analysis_client_reports
TO authenticated;

NOTIFY pgrst, 'reload schema';
