-- Informes profesionales de Carta Natal (snapshots históricos, no se sobreescriben).
-- Ejecutar en Supabase: SQL Editor → New query → pegar este archivo → Run.
-- No modifica migraciones anteriores.

CREATE TABLE public.natal_chart_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients (id) ON DELETE CASCADE,
  natal_chart_id uuid NOT NULL REFERENCES public.natal_charts (id) ON DELETE CASCADE,
  report jsonb NOT NULL CHECK (jsonb_typeof(report) = 'object'),
  report_version text NOT NULL CHECK (char_length(trim(report_version)) > 0),
  paula_lens_version text NOT NULL CHECK (char_length(trim(paula_lens_version)) > 0),
  gemini_model text NOT NULL CHECK (char_length(trim(gemini_model)) > 0),
  generation_duration_ms integer CHECK (
    generation_duration_ms IS NULL OR generation_duration_ms >= 0
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX natal_chart_reports_client_id_created_at_idx
  ON public.natal_chart_reports (client_id, created_at DESC);

CREATE INDEX natal_chart_reports_natal_chart_id_idx
  ON public.natal_chart_reports (natal_chart_id);

CREATE TRIGGER natal_chart_reports_set_updated_at
BEFORE UPDATE ON public.natal_chart_reports
FOR EACH ROW
EXECUTE PROCEDURE public.set_updated_at();

ALTER TABLE public.natal_chart_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can select own natal chart reports"
  ON public.natal_chart_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = natal_chart_reports.client_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can insert own natal chart reports"
  ON public.natal_chart_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = natal_chart_reports.client_id
        AND clients.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.natal_charts
      WHERE natal_charts.id = natal_chart_reports.natal_chart_id
        AND natal_charts.client_id = natal_chart_reports.client_id
    )
  );

CREATE POLICY "Professionals can update own natal chart reports"
  ON public.natal_chart_reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = natal_chart_reports.client_id
        AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = natal_chart_reports.client_id
        AND clients.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.natal_charts
      WHERE natal_charts.id = natal_chart_reports.natal_chart_id
        AND natal_charts.client_id = natal_chart_reports.client_id
    )
  );

CREATE POLICY "Professionals can delete own natal chart reports"
  ON public.natal_chart_reports
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = natal_chart_reports.client_id
        AND clients.user_id = auth.uid()
    )
  );

REVOKE ALL ON TABLE public.natal_chart_reports FROM PUBLIC, anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.natal_chart_reports
TO authenticated;

NOTIFY pgrst, 'reload schema';
