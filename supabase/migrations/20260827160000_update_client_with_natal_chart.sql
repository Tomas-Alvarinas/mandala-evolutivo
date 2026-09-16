-- Actualiza un consultante y reemplaza su Carta Natal en una transacción.
-- Ejecutar en Supabase: SQL Editor → New query → pegar este archivo → Run.
-- No modifica la RPC de creación ni las migraciones anteriores.

CREATE OR REPLACE FUNCTION public.update_client_with_natal_chart(
  p_client_id uuid,
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

  UPDATE public.clients
  SET
    first_name = p_first_name,
    last_name = p_last_name,
    age = p_age,
    professional_notes = p_professional_notes
  WHERE id = p_client_id
    AND user_id = v_user_id
  RETURNING id INTO v_client_id;

  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'client_not_found';
  END IF;

  SELECT id
  INTO v_chart_id
  FROM public.natal_charts
  WHERE client_id = v_client_id;

  IF v_chart_id IS NULL THEN
    RAISE EXCEPTION 'client_not_found';
  END IF;

  UPDATE public.natal_charts
  SET
    ascendant = p_ascendant,
    midheaven = p_midheaven
  WHERE id = v_chart_id;

  DELETE FROM public.natal_positions
  WHERE natal_chart_id = v_chart_id;

  DELETE FROM public.natal_aspects
  WHERE natal_chart_id = v_chart_id;

  DELETE FROM public.natal_configurations
  WHERE natal_chart_id = v_chart_id;

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

REVOKE ALL ON FUNCTION public.update_client_with_natal_chart(
  uuid, text, text, integer, text, text, text, jsonb, jsonb, jsonb
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.update_client_with_natal_chart(
  uuid, text, text, integer, text, text, text, jsonb, jsonb, jsonb
) TO authenticated;
