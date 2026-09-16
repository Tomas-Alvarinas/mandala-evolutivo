-- Configuraciones con participantes (puntos de la carta).
-- Desarrollo: se eliminan configuraciones de prueba sin participantes.
-- No se borran consultantes ni cartas natales.

DELETE FROM public.natal_configurations;

ALTER TABLE public.natal_configurations
  ADD COLUMN points text[] NOT NULL;

ALTER TABLE public.natal_configurations
  ADD CONSTRAINT natal_configurations_points_len_chk
  CHECK (
    cardinality(points) BETWEEN 3 AND 5
    AND array_position(points, NULL) IS NULL
  );

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
  v_points text[];
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
      IF jsonb_typeof(v_configuration -> 'points') IS DISTINCT FROM 'array' THEN
        RAISE EXCEPTION 'configuration points must be an array';
      END IF;

      v_points := ARRAY(
        SELECT jsonb_array_elements_text(v_configuration -> 'points')
      );

      IF cardinality(v_points) < 3 OR cardinality(v_points) > 5 THEN
        RAISE EXCEPTION 'configuration points must contain between 3 and 5 items';
      END IF;

      INSERT INTO public.natal_configurations (
        natal_chart_id,
        configuration_type,
        points
      )
      VALUES (
        v_chart_id,
        v_configuration ->> 'type',
        v_points
      );
    END LOOP;
  END IF;

  RETURN v_client_id;
END;
$$;
