-- Permite reconstruir una versión consultante existente desde el informe
-- profesional actual (source_report + client_report en el mismo UPDATE).
-- client_id, natal_chart_report_id y created_at siguen siendo inmutables.
-- Si source_report cambia, el informe profesional debe estar ready.
-- Ejecutar en Supabase: SQL Editor → New query → pegar este archivo → Run.

CREATE OR REPLACE FUNCTION public.protect_natal_chart_client_report_source()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.client_id IS DISTINCT FROM OLD.client_id
     OR NEW.natal_chart_report_id IS DISTINCT FROM OLD.natal_chart_report_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'natal chart client report identity fields are immutable';
  END IF;

  IF NEW.source_report IS DISTINCT FROM OLD.source_report
     AND NOT EXISTS (
       SELECT 1
       FROM public.natal_chart_reports
       WHERE natal_chart_reports.id = NEW.natal_chart_report_id
         AND natal_chart_reports.client_id = NEW.client_id
         AND natal_chart_reports.status = 'ready'
     )
  THEN
    RAISE EXCEPTION 'client report refresh requires a ready professional report for the same client';
  END IF;

  RETURN NEW;
END;
$$;

NOTIFY pgrst, 'reload schema';
