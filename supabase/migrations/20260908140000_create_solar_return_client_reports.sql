-- Versión consultante de Revolución Solar, derivada del informe profesional ready.
-- No modifica 20260908120000 ni migraciones anteriores.
-- Incluye protección de source_report y RPC de refresh (en Tránsitos eran dos
-- migrations; acá se combina porque Prompt 44 pide UNA sola).
-- Revisar antes de aplicar. No aplicar desde este prompt.

CREATE TABLE public.solar_return_client_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients (id) ON DELETE CASCADE,
  solar_return_id uuid NOT NULL REFERENCES public.solar_returns (id) ON DELETE CASCADE,
  professional_report_id uuid NOT NULL UNIQUE
    REFERENCES public.solar_return_reports (id) ON DELETE CASCADE,
  source_report jsonb NOT NULL CHECK (jsonb_typeof(source_report) = 'object'),
  client_report jsonb NOT NULL CHECK (jsonb_typeof(client_report) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX solar_return_client_reports_client_id_idx
  ON public.solar_return_client_reports (client_id);

CREATE INDEX solar_return_client_reports_solar_return_id_idx
  ON public.solar_return_client_reports (solar_return_id);

CREATE TRIGGER solar_return_client_reports_set_updated_at
BEFORE UPDATE ON public.solar_return_client_reports
FOR EACH ROW
EXECUTE PROCEDURE public.set_updated_at();

CREATE OR REPLACE FUNCTION public.enforce_solar_return_client_report_insert()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.solar_return_reports
    WHERE solar_return_reports.id = NEW.professional_report_id
      AND solar_return_reports.client_id = NEW.client_id
      AND solar_return_reports.solar_return_id = NEW.solar_return_id
      AND solar_return_reports.status = 'ready'
  ) THEN
    RAISE EXCEPTION 'client report requires a ready professional solar return report for the same client';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER solar_return_client_reports_enforce_insert
BEFORE INSERT ON public.solar_return_client_reports
FOR EACH ROW
EXECUTE PROCEDURE public.enforce_solar_return_client_report_insert();

CREATE OR REPLACE FUNCTION public.protect_solar_return_client_report_source()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.client_id IS DISTINCT FROM OLD.client_id
     OR NEW.solar_return_id IS DISTINCT FROM OLD.solar_return_id
     OR NEW.professional_report_id IS DISTINCT FROM OLD.professional_report_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'solar return client report identity fields are immutable';
  END IF;

  IF NEW.source_report IS DISTINCT FROM OLD.source_report
     AND current_setting('app.refresh_solar_return_client_report', true) IS DISTINCT FROM 'on'
  THEN
    RAISE EXCEPTION 'solar return client report source fields are immutable';
  END IF;

  IF NEW.source_report IS DISTINCT FROM OLD.source_report
     AND NOT EXISTS (
       SELECT 1
       FROM public.solar_return_reports
       WHERE solar_return_reports.id = NEW.professional_report_id
         AND solar_return_reports.client_id = NEW.client_id
         AND solar_return_reports.solar_return_id = NEW.solar_return_id
         AND solar_return_reports.status = 'ready'
     )
  THEN
    RAISE EXCEPTION 'client report refresh requires a ready professional solar return report for the same client';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER solar_return_client_reports_protect_source
BEFORE UPDATE ON public.solar_return_client_reports
FOR EACH ROW
EXECUTE PROCEDURE public.protect_solar_return_client_report_source();

ALTER TABLE public.solar_return_client_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can select own solar return client reports"
  ON public.solar_return_client_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = solar_return_client_reports.client_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can insert own solar return client reports"
  ON public.solar_return_client_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = solar_return_client_reports.client_id
        AND clients.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.solar_return_reports
      WHERE solar_return_reports.id = solar_return_client_reports.professional_report_id
        AND solar_return_reports.client_id = solar_return_client_reports.client_id
        AND solar_return_reports.solar_return_id = solar_return_client_reports.solar_return_id
    )
  );

CREATE POLICY "Professionals can update own solar return client reports"
  ON public.solar_return_client_reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = solar_return_client_reports.client_id
        AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = solar_return_client_reports.client_id
        AND clients.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.solar_return_reports
      WHERE solar_return_reports.id = solar_return_client_reports.professional_report_id
        AND solar_return_reports.client_id = solar_return_client_reports.client_id
        AND solar_return_reports.solar_return_id = solar_return_client_reports.solar_return_id
    )
  );

CREATE POLICY "Professionals can delete own solar return client reports"
  ON public.solar_return_client_reports
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = solar_return_client_reports.client_id
        AND clients.user_id = auth.uid()
    )
  );

REVOKE ALL ON TABLE public.solar_return_client_reports FROM PUBLIC, anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.solar_return_client_reports
TO authenticated;

CREATE OR REPLACE FUNCTION public.refresh_solar_return_client_report_from_professional(
  p_client_id uuid,
  p_solar_return_id uuid,
  p_professional_report_id uuid,
  p_source_report jsonb,
  p_client_report jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF jsonb_typeof(p_source_report) IS DISTINCT FROM 'object'
     OR jsonb_typeof(p_client_report) IS DISTINCT FROM 'object'
  THEN
    RAISE EXCEPTION 'invalid client report refresh payload';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.clients
    WHERE clients.id = p_client_id
      AND clients.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.solar_return_reports
    WHERE solar_return_reports.id = p_professional_report_id
      AND solar_return_reports.client_id = p_client_id
      AND solar_return_reports.solar_return_id = p_solar_return_id
      AND solar_return_reports.status = 'ready'
  ) THEN
    RAISE EXCEPTION 'client report refresh requires a ready professional solar return report for the same client';
  END IF;

  PERFORM set_config('app.refresh_solar_return_client_report', 'on', true);

  UPDATE public.solar_return_client_reports
  SET
    source_report = p_source_report,
    client_report = p_client_report
  WHERE client_id = p_client_id
    AND solar_return_id = p_solar_return_id
    AND professional_report_id = p_professional_report_id
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'client report not found';
  END IF;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_solar_return_client_report_from_professional(
  uuid,
  uuid,
  uuid,
  jsonb,
  jsonb
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.refresh_solar_return_client_report_from_professional(
  uuid,
  uuid,
  uuid,
  jsonb,
  jsonb
) TO authenticated;

NOTIFY pgrst, 'reload schema';
