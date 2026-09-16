-- Informes de Revolución Solar (generaciones inmutables, historial).
-- No modifica 20260907120000_create_solar_returns.sql ni migraciones anteriores.
-- Revisar antes de aplicar. No aplicar desde este prompt.
--
-- Ownership: solar_return_reports → solar_returns → clients → user_id = auth.uid().
-- INSERT exige además solar_returns.client_id = solar_return_reports.client_id
-- para que un report no vincule client A con una Revolución Solar de client B.
-- El repository server-side vuelve a verificar esa pertenencia antes del insert.
--
-- No hay UNIQUE(solar_return_id): cada generación crea un registro nuevo.
-- No hay política UPDATE: el JSON es inmutable en esta etapa.
-- No hay snapshot editorial separado, workflow ni versión consultante en V1.
--
-- Limitación Prompt 42: `report` guarda la salida IA validada. No hay snapshot
-- de posiciones/aspectos/contactos ni de la Carta Natal. Si se edita la
-- Revolución Solar después, el historial conserva el texto generado, no el input.

CREATE TABLE public.solar_return_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients (id) ON DELETE CASCADE,
  solar_return_id uuid NOT NULL REFERENCES public.solar_returns (id) ON DELETE CASCADE,
  report jsonb NOT NULL CHECK (jsonb_typeof(report) = 'object'),
  report_version text NOT NULL CHECK (char_length(trim(report_version)) > 0),
  methodology_version text NOT NULL CHECK (char_length(trim(methodology_version)) > 0),
  generated_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX solar_return_reports_solar_return_generated_at_idx
  ON public.solar_return_reports (solar_return_id, generated_at DESC);

CREATE INDEX solar_return_reports_client_generated_at_idx
  ON public.solar_return_reports (client_id, generated_at DESC);

ALTER TABLE public.solar_return_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can select own solar return reports"
  ON public.solar_return_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = solar_return_reports.client_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can insert own solar return reports"
  ON public.solar_return_reports
  FOR INSERT
  TO authenticated
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

CREATE POLICY "Professionals can delete own solar return reports"
  ON public.solar_return_reports
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = solar_return_reports.client_id
        AND clients.user_id = auth.uid()
    )
  );

REVOKE ALL ON TABLE public.solar_return_reports FROM PUBLIC, anon;

GRANT SELECT, INSERT, DELETE ON TABLE public.solar_return_reports
TO authenticated;

NOTIFY pgrst, 'reload schema';
