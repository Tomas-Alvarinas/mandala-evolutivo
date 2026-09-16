-- Permite reconstruir una versión consultante de Tránsitos existente
-- desde el informe profesional actual, de forma controlada.
-- No modifica 20260902200000 ni migraciones anteriores.
-- Revisar antes de aplicar. No aplicar desde este prompt.
--
-- source_report sigue protegido en UPDATE normal.
-- Solo refresh_transit_client_report_from_professional puede cambiarlo,
-- y únicamente si el informe profesional está ready.

CREATE OR REPLACE FUNCTION public.protect_transit_analysis_client_report_source()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.client_id IS DISTINCT FROM OLD.client_id
     OR NEW.transit_analysis_id IS DISTINCT FROM OLD.transit_analysis_id
     OR NEW.professional_report_id IS DISTINCT FROM OLD.professional_report_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'transit analysis client report identity fields are immutable';
  END IF;

  IF NEW.source_report IS DISTINCT FROM OLD.source_report
     AND current_setting('app.refresh_transit_client_report', true) IS DISTINCT FROM 'on'
  THEN
    RAISE EXCEPTION 'transit analysis client report source fields are immutable';
  END IF;

  IF NEW.source_report IS DISTINCT FROM OLD.source_report
     AND NOT EXISTS (
       SELECT 1
       FROM public.transit_analysis_reports
       WHERE transit_analysis_reports.id = NEW.professional_report_id
         AND transit_analysis_reports.client_id = NEW.client_id
         AND transit_analysis_reports.transit_analysis_id = NEW.transit_analysis_id
         AND transit_analysis_reports.status = 'ready'
     )
  THEN
    RAISE EXCEPTION 'client report refresh requires a ready professional transit report for the same client';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.refresh_transit_client_report_from_professional(
  p_client_id uuid,
  p_transit_analysis_id uuid,
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
    FROM public.transit_analysis_reports
    WHERE transit_analysis_reports.id = p_professional_report_id
      AND transit_analysis_reports.client_id = p_client_id
      AND transit_analysis_reports.transit_analysis_id = p_transit_analysis_id
      AND transit_analysis_reports.status = 'ready'
  ) THEN
    RAISE EXCEPTION 'client report refresh requires a ready professional transit report for the same client';
  END IF;

  PERFORM set_config('app.refresh_transit_client_report', 'on', true);

  UPDATE public.transit_analysis_client_reports
  SET
    source_report = p_source_report,
    client_report = p_client_report
  WHERE client_id = p_client_id
    AND transit_analysis_id = p_transit_analysis_id
    AND professional_report_id = p_professional_report_id
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'client report not found';
  END IF;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_transit_client_report_from_professional(
  uuid,
  uuid,
  uuid,
  jsonb,
  jsonb
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.refresh_transit_client_report_from_professional(
  uuid,
  uuid,
  uuid,
  jsonb,
  jsonb
) TO authenticated;

NOTIFY pgrst, 'reload schema';
