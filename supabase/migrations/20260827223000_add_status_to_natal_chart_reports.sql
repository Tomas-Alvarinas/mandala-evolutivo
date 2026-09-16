-- Estado editorial del informe profesional (no es entrega ni PDF).
-- Ejecutar en Supabase: SQL Editor → New query → pegar este archivo → Run.
-- No modifica migraciones anteriores.
-- Informes existentes: status = 'draft'. No inferimos revisión previa.

ALTER TABLE public.natal_chart_reports
  ADD COLUMN status text NOT NULL DEFAULT 'draft';

ALTER TABLE public.natal_chart_reports
  ADD CONSTRAINT natal_chart_reports_status_check
  CHECK (status IN ('draft', 'reviewed', 'ready'));

NOTIFY pgrst, 'reload schema';
