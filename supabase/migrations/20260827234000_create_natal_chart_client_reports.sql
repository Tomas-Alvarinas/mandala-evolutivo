-- Versión para el consultante, derivada del informe profesional ready.
-- Ejecutar en Supabase: SQL Editor → New query → pegar este archivo → Run.
-- No modifica migraciones anteriores.

CREATE TABLE public.natal_chart_client_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients (id) ON DELETE CASCADE,
  natal_chart_report_id uuid NOT NULL UNIQUE
    REFERENCES public.natal_chart_reports (id) ON DELETE CASCADE,
  source_report jsonb NOT NULL CHECK (jsonb_typeof(source_report) = 'object'),
  client_report jsonb NOT NULL CHECK (jsonb_typeof(client_report) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX natal_chart_client_reports_client_id_idx
  ON public.natal_chart_client_reports (client_id);

CREATE TRIGGER natal_chart_client_reports_set_updated_at
BEFORE UPDATE ON public.natal_chart_client_reports
FOR EACH ROW
EXECUTE PROCEDURE public.set_updated_at();

CREATE OR REPLACE FUNCTION public.enforce_natal_chart_client_report_insert()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.natal_chart_reports
    WHERE natal_chart_reports.id = NEW.natal_chart_report_id
      AND natal_chart_reports.client_id = NEW.client_id
      AND natal_chart_reports.status = 'ready'
  ) THEN
    RAISE EXCEPTION 'client report requires a ready professional report for the same client';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER natal_chart_client_reports_enforce_insert
BEFORE INSERT ON public.natal_chart_client_reports
FOR EACH ROW
EXECUTE PROCEDURE public.enforce_natal_chart_client_report_insert();

CREATE OR REPLACE FUNCTION public.protect_natal_chart_client_report_source()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.source_report IS DISTINCT FROM OLD.source_report
     OR NEW.client_id IS DISTINCT FROM OLD.client_id
     OR NEW.natal_chart_report_id IS DISTINCT FROM OLD.natal_chart_report_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'natal chart client report source fields are immutable';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER natal_chart_client_reports_protect_source
BEFORE UPDATE ON public.natal_chart_client_reports
FOR EACH ROW
EXECUTE PROCEDURE public.protect_natal_chart_client_report_source();

ALTER TABLE public.natal_chart_client_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can select own natal chart client reports"
  ON public.natal_chart_client_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = natal_chart_client_reports.client_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can insert own natal chart client reports"
  ON public.natal_chart_client_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = natal_chart_client_reports.client_id
        AND clients.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.natal_chart_reports
      WHERE natal_chart_reports.id = natal_chart_client_reports.natal_chart_report_id
        AND natal_chart_reports.client_id = natal_chart_client_reports.client_id
    )
  );

CREATE POLICY "Professionals can update own natal chart client reports"
  ON public.natal_chart_client_reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = natal_chart_client_reports.client_id
        AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = natal_chart_client_reports.client_id
        AND clients.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.natal_chart_reports
      WHERE natal_chart_reports.id = natal_chart_client_reports.natal_chart_report_id
        AND natal_chart_reports.client_id = natal_chart_client_reports.client_id
    )
  );

CREATE POLICY "Professionals can delete own natal chart client reports"
  ON public.natal_chart_client_reports
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = natal_chart_client_reports.client_id
        AND clients.user_id = auth.uid()
    )
  );

REVOKE ALL ON TABLE public.natal_chart_client_reports FROM PUBLIC, anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.natal_chart_client_reports
TO authenticated;

NOTIFY pgrst, 'reload schema';
