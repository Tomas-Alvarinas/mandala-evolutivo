-- Informes de Tránsitos y Eclipses (generaciones inmutables, historial).
-- No modifica 20260901195300_create_transit_analyses.sql ni migraciones anteriores.
-- Revisar antes de aplicar. No aplicar desde este prompt.
--
-- Ownership: transit_analysis_reports → transit_analyses → clients → user_id = auth.uid().
-- INSERT exige además transit_analyses.client_id = transit_analysis_reports.client_id
-- para que un report no vincule client A con un TransitAnalysis de client B.
-- El repository server-side vuelve a verificar esa pertenencia antes del insert.
--
-- No hay UNIQUE(transit_analysis_id): cada generación crea un registro nuevo.
-- No hay política UPDATE: el JSON es inmutable en esta etapa.
--
-- Limitación Prompt 35: `report` guarda la salida IA validada. No hay snapshot
-- de positions/aspects/eclipses ni de la Carta Natal. Si se edita el
-- TransitAnalysis después, el historial conserva el texto generado, no el input.

CREATE TABLE public.transit_analysis_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients (id) ON DELETE CASCADE,
  transit_analysis_id uuid NOT NULL REFERENCES public.transit_analyses (id) ON DELETE CASCADE,
  report jsonb NOT NULL CHECK (jsonb_typeof(report) = 'object'),
  report_version text NOT NULL CHECK (char_length(trim(report_version)) > 0),
  methodology_version text NOT NULL CHECK (char_length(trim(methodology_version)) > 0),
  generated_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX transit_analysis_reports_analysis_generated_at_idx
  ON public.transit_analysis_reports (transit_analysis_id, generated_at DESC);

CREATE INDEX transit_analysis_reports_client_generated_at_idx
  ON public.transit_analysis_reports (client_id, generated_at DESC);

ALTER TABLE public.transit_analysis_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can select own transit analysis reports"
  ON public.transit_analysis_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = transit_analysis_reports.client_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can insert own transit analysis reports"
  ON public.transit_analysis_reports
  FOR INSERT
  TO authenticated
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

CREATE POLICY "Professionals can delete own transit analysis reports"
  ON public.transit_analysis_reports
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = transit_analysis_reports.client_id
        AND clients.user_id = auth.uid()
    )
  );

REVOKE ALL ON TABLE public.transit_analysis_reports FROM PUBLIC, anon;

GRANT SELECT, INSERT, DELETE ON TABLE public.transit_analysis_reports
TO authenticated;

NOTIFY pgrst, 'reload schema';
