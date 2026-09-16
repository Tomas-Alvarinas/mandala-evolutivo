-- Análisis de Tránsitos y eclipses (carga manual).
-- No ejecuta cálculos ni efemérides. No modificar migraciones anteriores.
-- Revisar antes de aplicar en producción.

CREATE TABLE public.transit_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients (id) ON DELETE CASCADE,
  analysis_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.transit_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transit_analysis_id uuid NOT NULL REFERENCES public.transit_analyses (id) ON DELETE CASCADE,
  planet text NOT NULL CHECK (
    planet IN (
      'sun',
      'moon',
      'mercury',
      'venus',
      'mars',
      'jupiter',
      'saturn',
      'uranus',
      'neptune',
      'pluto',
      'chiron'
    )
  ),
  sign text NOT NULL CHECK (
    sign IN (
      'aries',
      'taurus',
      'gemini',
      'cancer',
      'leo',
      'virgo',
      'libra',
      'scorpio',
      'sagittarius',
      'capricorn',
      'aquarius',
      'pisces'
    )
  ),
  natal_house smallint NOT NULL CHECK (natal_house >= 1 AND natal_house <= 12),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (transit_analysis_id, planet)
);

CREATE TABLE public.transit_aspects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transit_analysis_id uuid NOT NULL REFERENCES public.transit_analyses (id) ON DELETE CASCADE,
  transit_planet text NOT NULL CHECK (
    transit_planet IN (
      'sun',
      'moon',
      'mercury',
      'venus',
      'mars',
      'jupiter',
      'saturn',
      'uranus',
      'neptune',
      'pluto',
      'chiron'
    )
  ),
  aspect text NOT NULL CHECK (
    aspect IN (
      'conjunction',
      'opposition',
      'square',
      'trine',
      'sextile',
      'quincunx'
    )
  ),
  natal_point text NOT NULL CHECK (
    natal_point IN (
      'sun',
      'moon',
      'mercury',
      'venus',
      'mars',
      'jupiter',
      'saturn',
      'uranus',
      'neptune',
      'pluto',
      'chiron',
      'northNode',
      'southNode',
      'ascendant',
      'midheaven'
    )
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (transit_analysis_id, transit_planet, aspect, natal_point)
);

CREATE TABLE public.transit_eclipses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transit_analysis_id uuid NOT NULL REFERENCES public.transit_analyses (id) ON DELETE CASCADE,
  eclipse_type text NOT NULL CHECK (eclipse_type IN ('solar', 'lunar')),
  sign_a text NOT NULL CHECK (
    sign_a IN (
      'aries',
      'taurus',
      'gemini',
      'cancer',
      'leo',
      'virgo',
      'libra',
      'scorpio',
      'sagittarius',
      'capricorn',
      'aquarius',
      'pisces'
    )
  ),
  natal_house_a smallint NOT NULL CHECK (natal_house_a >= 1 AND natal_house_a <= 12),
  sign_b text NOT NULL CHECK (
    sign_b IN (
      'aries',
      'taurus',
      'gemini',
      'cancer',
      'leo',
      'virgo',
      'libra',
      'scorpio',
      'sagittarius',
      'capricorn',
      'aquarius',
      'pisces'
    )
  ),
  natal_house_b smallint NOT NULL CHECK (natal_house_b >= 1 AND natal_house_b <= 12),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (sign_a <> sign_b),
  CHECK (natal_house_a <> natal_house_b),
  eclipse_axis_key text GENERATED ALWAYS AS (
    CASE
      WHEN (sign_a || ':' || natal_house_a::text) <= (sign_b || ':' || natal_house_b::text)
      THEN sign_a || ':' || natal_house_a::text || '|' || sign_b || ':' || natal_house_b::text
      ELSE sign_b || ':' || natal_house_b::text || '|' || sign_a || ':' || natal_house_a::text
    END
  ) STORED,
  UNIQUE (transit_analysis_id, eclipse_type, eclipse_axis_key)
);

CREATE INDEX transit_analyses_client_id_idx
  ON public.transit_analyses (client_id);

CREATE INDEX transit_analyses_client_date_idx
  ON public.transit_analyses (client_id, analysis_date DESC, created_at DESC);

CREATE INDEX transit_positions_analysis_id_idx
  ON public.transit_positions (transit_analysis_id);

CREATE INDEX transit_aspects_analysis_id_idx
  ON public.transit_aspects (transit_analysis_id);

CREATE INDEX transit_eclipses_analysis_id_idx
  ON public.transit_eclipses (transit_analysis_id);

CREATE TRIGGER transit_analyses_set_updated_at
BEFORE UPDATE ON public.transit_analyses
FOR EACH ROW
EXECUTE PROCEDURE public.set_updated_at();

CREATE OR REPLACE FUNCTION public.create_transit_analysis(
  p_client_id uuid,
  p_analysis_date date,
  p_positions jsonb,
  p_aspects jsonb,
  p_eclipses jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_client_id uuid;
  v_analysis_id uuid;
  v_position jsonb;
  v_aspect jsonb;
  v_eclipse jsonb;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT id
  INTO v_client_id
  FROM public.clients
  WHERE id = p_client_id
    AND user_id = v_user_id;

  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'client_not_found';
  END IF;

  IF jsonb_typeof(p_positions) IS DISTINCT FROM 'array'
     OR jsonb_typeof(p_aspects) IS DISTINCT FROM 'array'
     OR jsonb_typeof(p_eclipses) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'transit collections must be arrays';
  END IF;

  INSERT INTO public.transit_analyses (client_id, analysis_date)
  VALUES (v_client_id, p_analysis_date)
  RETURNING id INTO v_analysis_id;

  FOR v_position IN SELECT value FROM jsonb_array_elements(p_positions)
  LOOP
    INSERT INTO public.transit_positions (
      transit_analysis_id,
      planet,
      sign,
      natal_house
    )
    VALUES (
      v_analysis_id,
      v_position ->> 'planet',
      v_position ->> 'sign',
      (v_position ->> 'natalHouse')::smallint
    );
  END LOOP;

  FOR v_aspect IN SELECT value FROM jsonb_array_elements(p_aspects)
  LOOP
    INSERT INTO public.transit_aspects (
      transit_analysis_id,
      transit_planet,
      aspect,
      natal_point
    )
    VALUES (
      v_analysis_id,
      v_aspect ->> 'transitPlanet',
      v_aspect ->> 'aspect',
      v_aspect ->> 'natalPoint'
    );
  END LOOP;

  FOR v_eclipse IN SELECT value FROM jsonb_array_elements(p_eclipses)
  LOOP
    INSERT INTO public.transit_eclipses (
      transit_analysis_id,
      eclipse_type,
      sign_a,
      natal_house_a,
      sign_b,
      natal_house_b
    )
    VALUES (
      v_analysis_id,
      v_eclipse ->> 'eclipseType',
      v_eclipse ->> 'signA',
      (v_eclipse ->> 'natalHouseA')::smallint,
      v_eclipse ->> 'signB',
      (v_eclipse ->> 'natalHouseB')::smallint
    );
  END LOOP;

  RETURN v_analysis_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_transit_analysis(
  p_transit_analysis_id uuid,
  p_analysis_date date,
  p_positions jsonb,
  p_aspects jsonb,
  p_eclipses jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_analysis_id uuid;
  v_position jsonb;
  v_aspect jsonb;
  v_eclipse jsonb;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF jsonb_typeof(p_positions) IS DISTINCT FROM 'array'
     OR jsonb_typeof(p_aspects) IS DISTINCT FROM 'array'
     OR jsonb_typeof(p_eclipses) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'transit collections must be arrays';
  END IF;

  UPDATE public.transit_analyses
  SET analysis_date = p_analysis_date
  WHERE id = p_transit_analysis_id
    AND EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = transit_analyses.client_id
        AND clients.user_id = v_user_id
    )
  RETURNING id INTO v_analysis_id;

  IF v_analysis_id IS NULL THEN
    RAISE EXCEPTION 'transit_analysis_not_found';
  END IF;

  DELETE FROM public.transit_positions
  WHERE transit_analysis_id = v_analysis_id;

  DELETE FROM public.transit_aspects
  WHERE transit_analysis_id = v_analysis_id;

  DELETE FROM public.transit_eclipses
  WHERE transit_analysis_id = v_analysis_id;

  FOR v_position IN SELECT value FROM jsonb_array_elements(p_positions)
  LOOP
    INSERT INTO public.transit_positions (
      transit_analysis_id,
      planet,
      sign,
      natal_house
    )
    VALUES (
      v_analysis_id,
      v_position ->> 'planet',
      v_position ->> 'sign',
      (v_position ->> 'natalHouse')::smallint
    );
  END LOOP;

  FOR v_aspect IN SELECT value FROM jsonb_array_elements(p_aspects)
  LOOP
    INSERT INTO public.transit_aspects (
      transit_analysis_id,
      transit_planet,
      aspect,
      natal_point
    )
    VALUES (
      v_analysis_id,
      v_aspect ->> 'transitPlanet',
      v_aspect ->> 'aspect',
      v_aspect ->> 'natalPoint'
    );
  END LOOP;

  FOR v_eclipse IN SELECT value FROM jsonb_array_elements(p_eclipses)
  LOOP
    INSERT INTO public.transit_eclipses (
      transit_analysis_id,
      eclipse_type,
      sign_a,
      natal_house_a,
      sign_b,
      natal_house_b
    )
    VALUES (
      v_analysis_id,
      v_eclipse ->> 'eclipseType',
      v_eclipse ->> 'signA',
      (v_eclipse ->> 'natalHouseA')::smallint,
      v_eclipse ->> 'signB',
      (v_eclipse ->> 'natalHouseB')::smallint
    );
  END LOOP;

  RETURN v_analysis_id;
END;
$$;

ALTER TABLE public.transit_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transit_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transit_aspects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transit_eclipses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can select own transit analyses"
  ON public.transit_analyses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = transit_analyses.client_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can insert own transit analyses"
  ON public.transit_analyses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = transit_analyses.client_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can update own transit analyses"
  ON public.transit_analyses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = transit_analyses.client_id
        AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = transit_analyses.client_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can delete own transit analyses"
  ON public.transit_analyses
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = transit_analyses.client_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can select own transit positions"
  ON public.transit_positions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.transit_analyses
      JOIN public.clients ON clients.id = transit_analyses.client_id
      WHERE transit_analyses.id = transit_positions.transit_analysis_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can insert own transit positions"
  ON public.transit_positions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.transit_analyses
      JOIN public.clients ON clients.id = transit_analyses.client_id
      WHERE transit_analyses.id = transit_positions.transit_analysis_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can update own transit positions"
  ON public.transit_positions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.transit_analyses
      JOIN public.clients ON clients.id = transit_analyses.client_id
      WHERE transit_analyses.id = transit_positions.transit_analysis_id
        AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.transit_analyses
      JOIN public.clients ON clients.id = transit_analyses.client_id
      WHERE transit_analyses.id = transit_positions.transit_analysis_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can delete own transit positions"
  ON public.transit_positions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.transit_analyses
      JOIN public.clients ON clients.id = transit_analyses.client_id
      WHERE transit_analyses.id = transit_positions.transit_analysis_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can select own transit aspects"
  ON public.transit_aspects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.transit_analyses
      JOIN public.clients ON clients.id = transit_analyses.client_id
      WHERE transit_analyses.id = transit_aspects.transit_analysis_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can insert own transit aspects"
  ON public.transit_aspects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.transit_analyses
      JOIN public.clients ON clients.id = transit_analyses.client_id
      WHERE transit_analyses.id = transit_aspects.transit_analysis_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can update own transit aspects"
  ON public.transit_aspects
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.transit_analyses
      JOIN public.clients ON clients.id = transit_analyses.client_id
      WHERE transit_analyses.id = transit_aspects.transit_analysis_id
        AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.transit_analyses
      JOIN public.clients ON clients.id = transit_analyses.client_id
      WHERE transit_analyses.id = transit_aspects.transit_analysis_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can delete own transit aspects"
  ON public.transit_aspects
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.transit_analyses
      JOIN public.clients ON clients.id = transit_analyses.client_id
      WHERE transit_analyses.id = transit_aspects.transit_analysis_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can select own transit eclipses"
  ON public.transit_eclipses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.transit_analyses
      JOIN public.clients ON clients.id = transit_analyses.client_id
      WHERE transit_analyses.id = transit_eclipses.transit_analysis_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can insert own transit eclipses"
  ON public.transit_eclipses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.transit_analyses
      JOIN public.clients ON clients.id = transit_analyses.client_id
      WHERE transit_analyses.id = transit_eclipses.transit_analysis_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can update own transit eclipses"
  ON public.transit_eclipses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.transit_analyses
      JOIN public.clients ON clients.id = transit_analyses.client_id
      WHERE transit_analyses.id = transit_eclipses.transit_analysis_id
        AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.transit_analyses
      JOIN public.clients ON clients.id = transit_analyses.client_id
      WHERE transit_analyses.id = transit_eclipses.transit_analysis_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can delete own transit eclipses"
  ON public.transit_eclipses
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.transit_analyses
      JOIN public.clients ON clients.id = transit_analyses.client_id
      WHERE transit_analyses.id = transit_eclipses.transit_analysis_id
        AND clients.user_id = auth.uid()
    )
  );

REVOKE ALL ON TABLE
  public.transit_analyses,
  public.transit_positions,
  public.transit_aspects,
  public.transit_eclipses
FROM PUBLIC, anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.transit_analyses,
  public.transit_positions,
  public.transit_aspects,
  public.transit_eclipses
TO authenticated;

REVOKE ALL ON FUNCTION public.create_transit_analysis(
  uuid, date, jsonb, jsonb, jsonb
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.create_transit_analysis(
  uuid, date, jsonb, jsonb, jsonb
) TO authenticated;

REVOKE ALL ON FUNCTION public.update_transit_analysis(
  uuid, date, jsonb, jsonb, jsonb
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.update_transit_analysis(
  uuid, date, jsonb, jsonb, jsonb
) TO authenticated;
