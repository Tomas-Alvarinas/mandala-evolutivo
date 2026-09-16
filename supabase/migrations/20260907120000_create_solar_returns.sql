-- Revolución Solar V1 (carga manual).
-- No calcula carta, efemérides ni contactos. No modifica migrations anteriores.
-- Revisar antes de aplicar. No aplicar desde este prompt.

CREATE TABLE public.solar_returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients (id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  ascendant_ruler text NOT NULL CHECK (
    ascendant_ruler IN (
      'sun',
      'moon',
      'mercury',
      'venus',
      'mars',
      'jupiter',
      'saturn',
      'uranus',
      'neptune',
      'pluto'
    )
  ),
  professional_notes text,
  fire_count integer NOT NULL CHECK (fire_count >= 0),
  earth_count integer NOT NULL CHECK (earth_count >= 0),
  air_count integer NOT NULL CHECK (air_count >= 0),
  water_count integer NOT NULL CHECK (water_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (period_end > period_start),
  UNIQUE (client_id, period_start, period_end)
);

CREATE TABLE public.solar_return_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solar_return_id uuid NOT NULL REFERENCES public.solar_returns (id) ON DELETE CASCADE,
  point text NOT NULL CHECK (
    point IN (
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
      'ascendant',
      'midheaven'
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
  solar_return_house smallint CHECK (
    solar_return_house IS NULL
    OR (solar_return_house >= 1 AND solar_return_house <= 12)
  ),
  natal_overlay_house smallint NOT NULL CHECK (
    natal_overlay_house >= 1 AND natal_overlay_house <= 12
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (solar_return_id, point),
  CHECK (
    (
      point IN ('ascendant', 'midheaven')
      AND solar_return_house IS NULL
    )
    OR (
      point NOT IN ('ascendant', 'midheaven')
      AND solar_return_house IS NOT NULL
    )
  )
);

CREATE TABLE public.solar_return_aspects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solar_return_id uuid NOT NULL REFERENCES public.solar_returns (id) ON DELETE CASCADE,
  point_a text NOT NULL CHECK (
    point_a IN (
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
      'ascendant',
      'midheaven'
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
  point_b text NOT NULL CHECK (
    point_b IN (
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
      'ascendant',
      'midheaven'
    )
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (point_a <> point_b),
  UNIQUE (solar_return_id, point_a, aspect, point_b)
);

CREATE TABLE public.solar_return_natal_aspects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solar_return_id uuid NOT NULL REFERENCES public.solar_returns (id) ON DELETE CASCADE,
  solar_return_point text NOT NULL CHECK (
    solar_return_point IN (
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
      'ascendant',
      'midheaven'
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
  UNIQUE (solar_return_id, solar_return_point, aspect, natal_point)
);

CREATE INDEX solar_returns_client_id_idx
  ON public.solar_returns (client_id);

CREATE INDEX solar_returns_client_period_idx
  ON public.solar_returns (client_id, period_start DESC, created_at DESC);

CREATE INDEX solar_return_positions_return_id_idx
  ON public.solar_return_positions (solar_return_id);

CREATE INDEX solar_return_aspects_return_id_idx
  ON public.solar_return_aspects (solar_return_id);

CREATE INDEX solar_return_natal_aspects_return_id_idx
  ON public.solar_return_natal_aspects (solar_return_id);

CREATE TRIGGER solar_returns_set_updated_at
BEFORE UPDATE ON public.solar_returns
FOR EACH ROW
EXECUTE PROCEDURE public.set_updated_at();

CREATE OR REPLACE FUNCTION public.create_solar_return(
  p_client_id uuid,
  p_period_start date,
  p_period_end date,
  p_ascendant_ruler text,
  p_professional_notes text,
  p_fire_count integer,
  p_earth_count integer,
  p_air_count integer,
  p_water_count integer,
  p_positions jsonb,
  p_aspects jsonb,
  p_natal_contacts jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_client_id uuid;
  v_solar_return_id uuid;
  v_position jsonb;
  v_aspect jsonb;
  v_contact jsonb;
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
     OR jsonb_typeof(p_natal_contacts) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'solar return collections must be arrays';
  END IF;

  INSERT INTO public.solar_returns (
    client_id,
    period_start,
    period_end,
    ascendant_ruler,
    professional_notes,
    fire_count,
    earth_count,
    air_count,
    water_count
  )
  VALUES (
    v_client_id,
    p_period_start,
    p_period_end,
    p_ascendant_ruler,
    p_professional_notes,
    p_fire_count,
    p_earth_count,
    p_air_count,
    p_water_count
  )
  RETURNING id INTO v_solar_return_id;

  FOR v_position IN SELECT value FROM jsonb_array_elements(p_positions)
  LOOP
    INSERT INTO public.solar_return_positions (
      solar_return_id,
      point,
      sign,
      solar_return_house,
      natal_overlay_house
    )
    VALUES (
      v_solar_return_id,
      v_position ->> 'point',
      v_position ->> 'sign',
      NULLIF(v_position ->> 'solarReturnHouse', '')::smallint,
      (v_position ->> 'natalOverlayHouse')::smallint
    );
  END LOOP;

  FOR v_aspect IN SELECT value FROM jsonb_array_elements(p_aspects)
  LOOP
    INSERT INTO public.solar_return_aspects (
      solar_return_id,
      point_a,
      aspect,
      point_b
    )
    VALUES (
      v_solar_return_id,
      v_aspect ->> 'pointA',
      v_aspect ->> 'aspect',
      v_aspect ->> 'pointB'
    );
  END LOOP;

  FOR v_contact IN SELECT value FROM jsonb_array_elements(p_natal_contacts)
  LOOP
    INSERT INTO public.solar_return_natal_aspects (
      solar_return_id,
      solar_return_point,
      aspect,
      natal_point
    )
    VALUES (
      v_solar_return_id,
      v_contact ->> 'solarReturnPoint',
      v_contact ->> 'aspect',
      v_contact ->> 'natalPoint'
    );
  END LOOP;

  RETURN v_solar_return_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_solar_return(
  p_solar_return_id uuid,
  p_period_start date,
  p_period_end date,
  p_ascendant_ruler text,
  p_professional_notes text,
  p_fire_count integer,
  p_earth_count integer,
  p_air_count integer,
  p_water_count integer,
  p_positions jsonb,
  p_aspects jsonb,
  p_natal_contacts jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_solar_return_id uuid;
  v_position jsonb;
  v_aspect jsonb;
  v_contact jsonb;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF jsonb_typeof(p_positions) IS DISTINCT FROM 'array'
     OR jsonb_typeof(p_aspects) IS DISTINCT FROM 'array'
     OR jsonb_typeof(p_natal_contacts) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'solar return collections must be arrays';
  END IF;

  UPDATE public.solar_returns
  SET
    period_start = p_period_start,
    period_end = p_period_end,
    ascendant_ruler = p_ascendant_ruler,
    professional_notes = p_professional_notes,
    fire_count = p_fire_count,
    earth_count = p_earth_count,
    air_count = p_air_count,
    water_count = p_water_count
  WHERE id = p_solar_return_id
    AND EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = solar_returns.client_id
        AND clients.user_id = v_user_id
    )
  RETURNING id INTO v_solar_return_id;

  IF v_solar_return_id IS NULL THEN
    RAISE EXCEPTION 'solar_return_not_found';
  END IF;

  DELETE FROM public.solar_return_positions
  WHERE solar_return_id = v_solar_return_id;

  DELETE FROM public.solar_return_aspects
  WHERE solar_return_id = v_solar_return_id;

  DELETE FROM public.solar_return_natal_aspects
  WHERE solar_return_id = v_solar_return_id;

  FOR v_position IN SELECT value FROM jsonb_array_elements(p_positions)
  LOOP
    INSERT INTO public.solar_return_positions (
      solar_return_id,
      point,
      sign,
      solar_return_house,
      natal_overlay_house
    )
    VALUES (
      v_solar_return_id,
      v_position ->> 'point',
      v_position ->> 'sign',
      NULLIF(v_position ->> 'solarReturnHouse', '')::smallint,
      (v_position ->> 'natalOverlayHouse')::smallint
    );
  END LOOP;

  FOR v_aspect IN SELECT value FROM jsonb_array_elements(p_aspects)
  LOOP
    INSERT INTO public.solar_return_aspects (
      solar_return_id,
      point_a,
      aspect,
      point_b
    )
    VALUES (
      v_solar_return_id,
      v_aspect ->> 'pointA',
      v_aspect ->> 'aspect',
      v_aspect ->> 'pointB'
    );
  END LOOP;

  FOR v_contact IN SELECT value FROM jsonb_array_elements(p_natal_contacts)
  LOOP
    INSERT INTO public.solar_return_natal_aspects (
      solar_return_id,
      solar_return_point,
      aspect,
      natal_point
    )
    VALUES (
      v_solar_return_id,
      v_contact ->> 'solarReturnPoint',
      v_contact ->> 'aspect',
      v_contact ->> 'natalPoint'
    );
  END LOOP;

  RETURN v_solar_return_id;
END;
$$;

ALTER TABLE public.solar_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_return_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_return_aspects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_return_natal_aspects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can select own solar returns"
  ON public.solar_returns
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = solar_returns.client_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can insert own solar returns"
  ON public.solar_returns
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = solar_returns.client_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can update own solar returns"
  ON public.solar_returns
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = solar_returns.client_id
        AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = solar_returns.client_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can delete own solar returns"
  ON public.solar_returns
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clients
      WHERE clients.id = solar_returns.client_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can select own solar return positions"
  ON public.solar_return_positions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.solar_returns
      JOIN public.clients ON clients.id = solar_returns.client_id
      WHERE solar_returns.id = solar_return_positions.solar_return_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can insert own solar return positions"
  ON public.solar_return_positions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.solar_returns
      JOIN public.clients ON clients.id = solar_returns.client_id
      WHERE solar_returns.id = solar_return_positions.solar_return_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can update own solar return positions"
  ON public.solar_return_positions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.solar_returns
      JOIN public.clients ON clients.id = solar_returns.client_id
      WHERE solar_returns.id = solar_return_positions.solar_return_id
        AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.solar_returns
      JOIN public.clients ON clients.id = solar_returns.client_id
      WHERE solar_returns.id = solar_return_positions.solar_return_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can delete own solar return positions"
  ON public.solar_return_positions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.solar_returns
      JOIN public.clients ON clients.id = solar_returns.client_id
      WHERE solar_returns.id = solar_return_positions.solar_return_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can select own solar return aspects"
  ON public.solar_return_aspects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.solar_returns
      JOIN public.clients ON clients.id = solar_returns.client_id
      WHERE solar_returns.id = solar_return_aspects.solar_return_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can insert own solar return aspects"
  ON public.solar_return_aspects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.solar_returns
      JOIN public.clients ON clients.id = solar_returns.client_id
      WHERE solar_returns.id = solar_return_aspects.solar_return_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can update own solar return aspects"
  ON public.solar_return_aspects
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.solar_returns
      JOIN public.clients ON clients.id = solar_returns.client_id
      WHERE solar_returns.id = solar_return_aspects.solar_return_id
        AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.solar_returns
      JOIN public.clients ON clients.id = solar_returns.client_id
      WHERE solar_returns.id = solar_return_aspects.solar_return_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can delete own solar return aspects"
  ON public.solar_return_aspects
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.solar_returns
      JOIN public.clients ON clients.id = solar_returns.client_id
      WHERE solar_returns.id = solar_return_aspects.solar_return_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can select own solar return natal aspects"
  ON public.solar_return_natal_aspects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.solar_returns
      JOIN public.clients ON clients.id = solar_returns.client_id
      WHERE solar_returns.id = solar_return_natal_aspects.solar_return_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can insert own solar return natal aspects"
  ON public.solar_return_natal_aspects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.solar_returns
      JOIN public.clients ON clients.id = solar_returns.client_id
      WHERE solar_returns.id = solar_return_natal_aspects.solar_return_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can update own solar return natal aspects"
  ON public.solar_return_natal_aspects
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.solar_returns
      JOIN public.clients ON clients.id = solar_returns.client_id
      WHERE solar_returns.id = solar_return_natal_aspects.solar_return_id
        AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.solar_returns
      JOIN public.clients ON clients.id = solar_returns.client_id
      WHERE solar_returns.id = solar_return_natal_aspects.solar_return_id
        AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can delete own solar return natal aspects"
  ON public.solar_return_natal_aspects
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.solar_returns
      JOIN public.clients ON clients.id = solar_returns.client_id
      WHERE solar_returns.id = solar_return_natal_aspects.solar_return_id
        AND clients.user_id = auth.uid()
    )
  );

REVOKE ALL ON TABLE
  public.solar_returns,
  public.solar_return_positions,
  public.solar_return_aspects,
  public.solar_return_natal_aspects
FROM PUBLIC, anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.solar_returns,
  public.solar_return_positions,
  public.solar_return_aspects,
  public.solar_return_natal_aspects
TO authenticated;

REVOKE ALL ON FUNCTION public.create_solar_return(
  uuid, date, date, text, text, integer, integer, integer, integer, jsonb, jsonb, jsonb
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.create_solar_return(
  uuid, date, date, text, text, integer, integer, integer, integer, jsonb, jsonb, jsonb
) TO authenticated;

REVOKE ALL ON FUNCTION public.update_solar_return(
  uuid, date, date, text, text, integer, integer, integer, integer, jsonb, jsonb, jsonb
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.update_solar_return(
  uuid, date, date, text, text, integer, integer, integer, integer, jsonb, jsonb, jsonb
) TO authenticated;
