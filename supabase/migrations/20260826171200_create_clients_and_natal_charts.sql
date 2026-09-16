-- Mandala Evolutivo — consultantes, Carta Natal y RLS por profesional
-- Ejecutar en Supabase: SQL Editor → New query → pegar este archivo → Run.
-- No ejecutar hasta haber creado el proyecto y el primer usuario en Authentication.

CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  first_name text NOT NULL CHECK (char_length(trim(first_name)) > 0),
  last_name text NOT NULL CHECK (char_length(trim(last_name)) > 0),
  age integer NOT NULL CHECK (age >= 0 AND age <= 120),
  professional_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.natal_charts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL UNIQUE REFERENCES public.clients (id) ON DELETE CASCADE,
  ascendant text NOT NULL CHECK (char_length(trim(ascendant)) > 0),
  midheaven text NOT NULL CHECK (char_length(trim(midheaven)) > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.natal_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  natal_chart_id uuid NOT NULL REFERENCES public.natal_charts (id) ON DELETE CASCADE,
  point text NOT NULL CHECK (char_length(trim(point)) > 0),
  sign text NOT NULL CHECK (char_length(trim(sign)) > 0),
  house smallint NOT NULL CHECK (house >= 1 AND house <= 12),
  UNIQUE (natal_chart_id, point)
);

CREATE TABLE public.natal_aspects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  natal_chart_id uuid NOT NULL REFERENCES public.natal_charts (id) ON DELETE CASCADE,
  point_a text NOT NULL CHECK (char_length(trim(point_a)) > 0),
  aspect text NOT NULL CHECK (char_length(trim(aspect)) > 0),
  point_b text NOT NULL CHECK (char_length(trim(point_b)) > 0),
  CHECK (point_a <> point_b)
);

CREATE TABLE public.natal_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  natal_chart_id uuid NOT NULL REFERENCES public.natal_charts (id) ON DELETE CASCADE,
  configuration_type text NOT NULL CHECK (char_length(trim(configuration_type)) > 0),
  UNIQUE (natal_chart_id, configuration_type)
);

CREATE INDEX clients_user_id_idx ON public.clients (user_id);
CREATE INDEX clients_created_at_idx ON public.clients (created_at DESC);
CREATE INDEX natal_positions_chart_id_idx ON public.natal_positions (natal_chart_id);
CREATE INDEX natal_aspects_chart_id_idx ON public.natal_aspects (natal_chart_id);
CREATE INDEX natal_configurations_chart_id_idx ON public.natal_configurations (natal_chart_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER clients_set_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER natal_charts_set_updated_at
BEFORE UPDATE ON public.natal_charts
FOR EACH ROW
EXECUTE PROCEDURE public.set_updated_at();

-- SECURITY INVOKER: respeta RLS y toma el dueño de auth.uid(), no del cliente HTTP.
CREATE OR REPLACE FUNCTION public.create_client_with_natal_chart(
  p_first_name text,
  p_last_name text,
  p_age integer,
  p_professional_notes text,
  p_ascendant text,
  p_midheaven text,
  p_positions jsonb,
  p_aspects jsonb,
  p_configurations jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_client_id uuid;
  v_chart_id uuid;
  v_position jsonb;
  v_aspect jsonb;
  v_configuration jsonb;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF jsonb_typeof(p_positions) IS DISTINCT FROM 'array'
     OR jsonb_array_length(p_positions) <> 13 THEN
    RAISE EXCEPTION 'natal chart must contain exactly 13 positions';
  END IF;

  INSERT INTO public.clients (
    user_id,
    first_name,
    last_name,
    age,
    professional_notes
  )
  VALUES (
    v_user_id,
    p_first_name,
    p_last_name,
    p_age,
    p_professional_notes
  )
  RETURNING id INTO v_client_id;

  INSERT INTO public.natal_charts (client_id, ascendant, midheaven)
  VALUES (v_client_id, p_ascendant, p_midheaven)
  RETURNING id INTO v_chart_id;

  FOR v_position IN SELECT value FROM jsonb_array_elements(p_positions)
  LOOP
    INSERT INTO public.natal_positions (natal_chart_id, point, sign, house)
    VALUES (
      v_chart_id,
      v_position ->> 'point',
      v_position ->> 'sign',
      (v_position ->> 'house')::smallint
    );
  END LOOP;

  IF p_aspects IS NOT NULL AND jsonb_typeof(p_aspects) = 'array' THEN
    FOR v_aspect IN SELECT value FROM jsonb_array_elements(p_aspects)
    LOOP
      INSERT INTO public.natal_aspects (natal_chart_id, point_a, aspect, point_b)
      VALUES (
        v_chart_id,
        v_aspect ->> 'pointA',
        v_aspect ->> 'aspect',
        v_aspect ->> 'pointB'
      );
    END LOOP;
  END IF;

  IF p_configurations IS NOT NULL AND jsonb_typeof(p_configurations) = 'array' THEN
    FOR v_configuration IN SELECT value FROM jsonb_array_elements(p_configurations)
    LOOP
      INSERT INTO public.natal_configurations (natal_chart_id, configuration_type)
      VALUES (
        v_chart_id,
        v_configuration ->> 'type'
      );
    END LOOP;
  END IF;

  RETURN v_client_id;
END;
$$;

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.natal_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.natal_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.natal_aspects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.natal_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can select own clients"
  ON public.clients
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Professionals can insert own clients"
  ON public.clients
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Professionals can update own clients"
  ON public.clients
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Professionals can delete own clients"
  ON public.clients
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Professionals can select own natal charts"
  ON public.natal_charts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = natal_charts.client_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can insert own natal charts"
  ON public.natal_charts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = natal_charts.client_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can update own natal charts"
  ON public.natal_charts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = natal_charts.client_id
        AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = natal_charts.client_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can delete own natal charts"
  ON public.natal_charts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = natal_charts.client_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can select own natal positions"
  ON public.natal_positions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.natal_charts
      JOIN public.clients ON clients.id = natal_charts.client_id
      WHERE natal_charts.id = natal_positions.natal_chart_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can insert own natal positions"
  ON public.natal_positions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.natal_charts
      JOIN public.clients ON clients.id = natal_charts.client_id
      WHERE natal_charts.id = natal_positions.natal_chart_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can update own natal positions"
  ON public.natal_positions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.natal_charts
      JOIN public.clients ON clients.id = natal_charts.client_id
      WHERE natal_charts.id = natal_positions.natal_chart_id
        AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.natal_charts
      JOIN public.clients ON clients.id = natal_charts.client_id
      WHERE natal_charts.id = natal_positions.natal_chart_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can delete own natal positions"
  ON public.natal_positions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.natal_charts
      JOIN public.clients ON clients.id = natal_charts.client_id
      WHERE natal_charts.id = natal_positions.natal_chart_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can select own natal aspects"
  ON public.natal_aspects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.natal_charts
      JOIN public.clients ON clients.id = natal_charts.client_id
      WHERE natal_charts.id = natal_aspects.natal_chart_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can insert own natal aspects"
  ON public.natal_aspects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.natal_charts
      JOIN public.clients ON clients.id = natal_charts.client_id
      WHERE natal_charts.id = natal_aspects.natal_chart_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can update own natal aspects"
  ON public.natal_aspects
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.natal_charts
      JOIN public.clients ON clients.id = natal_charts.client_id
      WHERE natal_charts.id = natal_aspects.natal_chart_id
        AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.natal_charts
      JOIN public.clients ON clients.id = natal_charts.client_id
      WHERE natal_charts.id = natal_aspects.natal_chart_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can delete own natal aspects"
  ON public.natal_aspects
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.natal_charts
      JOIN public.clients ON clients.id = natal_charts.client_id
      WHERE natal_charts.id = natal_aspects.natal_chart_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can select own natal configurations"
  ON public.natal_configurations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.natal_charts
      JOIN public.clients ON clients.id = natal_charts.client_id
      WHERE natal_charts.id = natal_configurations.natal_chart_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can insert own natal configurations"
  ON public.natal_configurations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.natal_charts
      JOIN public.clients ON clients.id = natal_charts.client_id
      WHERE natal_charts.id = natal_configurations.natal_chart_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can update own natal configurations"
  ON public.natal_configurations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.natal_charts
      JOIN public.clients ON clients.id = natal_charts.client_id
      WHERE natal_charts.id = natal_configurations.natal_chart_id
        AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.natal_charts
      JOIN public.clients ON clients.id = natal_charts.client_id
      WHERE natal_charts.id = natal_configurations.natal_chart_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can delete own natal configurations"
  ON public.natal_configurations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.natal_charts
      JOIN public.clients ON clients.id = natal_charts.client_id
      WHERE natal_charts.id = natal_configurations.natal_chart_id
        AND clients.user_id = auth.uid()
    )
  );

REVOKE ALL ON TABLE
  public.clients,
  public.natal_charts,
  public.natal_positions,
  public.natal_aspects,
  public.natal_configurations
FROM PUBLIC, anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.clients,
  public.natal_charts,
  public.natal_positions,
  public.natal_aspects,
  public.natal_configurations
TO authenticated;

REVOKE ALL ON FUNCTION public.create_client_with_natal_chart(
  text, text, integer, text, text, text, jsonb, jsonb, jsonb
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.create_client_with_natal_chart(
  text, text, integer, text, text, text, jsonb, jsonb, jsonb
) TO authenticated;
