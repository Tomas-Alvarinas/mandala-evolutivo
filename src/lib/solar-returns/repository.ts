import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DataQueryResult } from "@/lib/clients/repository";
import {
  isAspectId,
  isChartPointId,
  isHouseNumber,
  isNonNegativeInteger,
  isSolarReturnAngleId,
  isSolarReturnAscendantRuler,
  isSolarReturnPointId,
  isValidSolarReturnPeriod,
  isZodiacSignId,
} from "./helpers";
import type {
  SolarReturn,
  SolarReturnAspect,
  SolarReturnInput,
  SolarReturnNatalAspect,
  SolarReturnPosition,
  SolarReturnSummary,
} from "./types";

export type SolarReturnWriteResult =
  | DataQueryResult<string>
  | { status: "duplicate_period" };

type SolarReturnRow = {
  id: string;
  client_id: string;
  period_start: string;
  period_end: string;
  ascendant_ruler: string;
  professional_notes: string | null;
  fire_count: number;
  earth_count: number;
  air_count: number;
  water_count: number;
  created_at: string;
  updated_at: string;
};

type PositionRow = {
  point: string;
  sign: string;
  solar_return_house: number | null;
  natal_overlay_house: number;
};

type AspectRow = {
  point_a: string;
  aspect: string;
  point_b: string;
};

type NatalAspectRow = {
  solar_return_point: string;
  aspect: string;
  natal_point: string;
};

type SolarReturnDetailRow = SolarReturnRow & {
  solar_return_positions: PositionRow[] | PositionRow | null;
  solar_return_aspects: AspectRow[] | AspectRow | null;
  solar_return_natal_aspects: NatalAspectRow[] | NatalAspectRow | null;
};

type SolarReturnSummaryRow = SolarReturnRow;

const SOLAR_RETURN_SELECT = `
  id,
  client_id,
  period_start,
  period_end,
  ascendant_ruler,
  professional_notes,
  fire_count,
  earth_count,
  air_count,
  water_count,
  created_at,
  updated_at
`;

export async function createSolarReturn(input: {
  clientId: string;
  solarReturn: SolarReturnInput;
}): Promise<SolarReturnWriteResult> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!isUuid(input.clientId)) {
    return { status: "not_found" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { status: "unauthorized" };
    }

    const { data, error } = await supabase.rpc("create_solar_return", {
      p_client_id: input.clientId,
      ...toRpcArgs(input.solarReturn),
    });

    if (error || typeof data !== "string") {
      const mapped = mapWriteError(error);

      if (mapped === "error") {
        console.error("[solar-returns] Failed to create solar return", {
          message: error?.message,
          code: error?.code,
        });
      }

      return { status: mapped };
    }

    return { status: "ok", data };
  } catch (error) {
    console.error("[solar-returns] Unexpected error creating solar return", error);
    return { status: "error" };
  }
}

export async function updateSolarReturn(input: {
  solarReturnId: string;
  solarReturn: SolarReturnInput;
}): Promise<SolarReturnWriteResult> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!isUuid(input.solarReturnId)) {
    return { status: "not_found" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { status: "unauthorized" };
    }

    const { data, error } = await supabase.rpc("update_solar_return", {
      p_solar_return_id: input.solarReturnId,
      ...toRpcArgs(input.solarReturn),
    });

    if (error || typeof data !== "string") {
      const mapped = mapWriteError(error);

      if (mapped === "error") {
        console.error("[solar-returns] Failed to update solar return", {
          message: error?.message,
          code: error?.code,
        });
      }

      return { status: mapped };
    }

    return { status: "ok", data };
  } catch (error) {
    console.error("[solar-returns] Unexpected error updating solar return", error);
    return { status: "error" };
  }
}

export async function deleteSolarReturn(
  solarReturnId: string,
): Promise<DataQueryResult<string>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!isUuid(solarReturnId)) {
    return { status: "not_found" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { status: "unauthorized" };
    }

    const { data, error } = await supabase
      .from("solar_returns")
      .delete()
      .eq("id", solarReturnId)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[solar-returns] Failed to delete solar return", {
        message: error.message,
        code: error.code,
      });
      return { status: "error" };
    }

    if (!data) {
      return { status: "not_found" };
    }

    return { status: "ok", data: data.id };
  } catch (error) {
    console.error("[solar-returns] Unexpected error deleting solar return", error);
    return { status: "error" };
  }
}

export async function listSolarReturnsByClientId(
  clientId: string,
): Promise<DataQueryResult<SolarReturnSummary[]>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!isUuid(clientId)) {
    return { status: "not_found" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { status: "unauthorized" };
    }

    const { data, error } = await supabase
      .from("solar_returns")
      .select(SOLAR_RETURN_SELECT)
      .eq("client_id", clientId)
      .order("period_start", { ascending: false })
      .order("created_at", { ascending: false })
      .returns<SolarReturnSummaryRow[]>();

    if (error || !data) {
      console.error("[solar-returns] Failed to list solar returns", {
        message: error?.message,
        code: error?.code,
      });
      return { status: "error" };
    }

    const summaries = data
      .map(mapSummary)
      .filter((summary): summary is SolarReturnSummary => summary !== null);

    if (summaries.length !== data.length) {
      console.error("[solar-returns] Stored solar return summary could not be mapped");
      return { status: "error" };
    }

    return { status: "ok", data: summaries };
  } catch (error) {
    console.error("[solar-returns] Unexpected error listing solar returns", error);
    return { status: "error" };
  }
}

export const getSolarReturnById = cache(async function getSolarReturnById(
  solarReturnId: string,
): Promise<DataQueryResult<SolarReturn>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!isUuid(solarReturnId)) {
    return { status: "not_found" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { status: "unauthorized" };
    }

    const { data, error } = await supabase
      .from("solar_returns")
      .select(
        `
        ${SOLAR_RETURN_SELECT},
        solar_return_positions (
          point,
          sign,
          solar_return_house,
          natal_overlay_house
        ),
        solar_return_aspects ( point_a, aspect, point_b ),
        solar_return_natal_aspects (
          solar_return_point,
          aspect,
          natal_point
        )
      `,
      )
      .eq("id", solarReturnId)
      .maybeSingle()
      .returns<SolarReturnDetailRow>();

    if (error) {
      console.error("[solar-returns] Failed to load solar return", {
        message: error.message,
        code: error.code,
      });
      return { status: "error" };
    }

    if (!data) {
      return { status: "not_found" };
    }

    const mapped = mapSolarReturn(data);

    if (!mapped) {
      console.error("[solar-returns] Stored solar return could not be mapped");
      return { status: "error" };
    }

    return { status: "ok", data: mapped };
  } catch (error) {
    console.error("[solar-returns] Unexpected error loading solar return", error);
    return { status: "error" };
  }
});

function toRpcArgs(input: SolarReturnInput) {
  return {
    p_period_start: input.periodStart,
    p_period_end: input.periodEnd,
    p_ascendant_ruler: input.ascendantRuler,
    p_professional_notes: input.professionalNotes,
    p_fire_count: input.elementSummary.fire,
    p_earth_count: input.elementSummary.earth,
    p_air_count: input.elementSummary.air,
    p_water_count: input.elementSummary.water,
    p_positions: input.positions.map((position) => ({
      point: position.point,
      sign: position.sign,
      solarReturnHouse: position.solarReturnHouse,
      natalOverlayHouse: position.natalOverlayHouse,
    })),
    p_aspects: input.aspects.map((aspect) => ({
      pointA: aspect.pointA,
      aspect: aspect.aspect,
      pointB: aspect.pointB,
    })),
    p_natal_contacts: input.natalContacts.map((contact) => ({
      solarReturnPoint: contact.solarReturnPoint,
      aspect: contact.aspect,
      natalPoint: contact.natalPoint,
    })),
  };
}

function mapSummary(row: SolarReturnSummaryRow): SolarReturnSummary | null {
  const periodStart = normalizeDate(row.period_start);
  const periodEnd = normalizeDate(row.period_end);

  if (!isValidSolarReturnPeriod({ periodStart, periodEnd })) {
    return null;
  }

  return {
    id: row.id,
    clientId: row.client_id,
    periodStart,
    periodEnd,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSolarReturn(row: SolarReturnDetailRow): SolarReturn | null {
  const summary = mapSummary(row);

  if (!summary) {
    return null;
  }

  if (!isSolarReturnAscendantRuler(row.ascendant_ruler)) {
    return null;
  }

  if (
    !isNonNegativeInteger(row.fire_count) ||
    !isNonNegativeInteger(row.earth_count) ||
    !isNonNegativeInteger(row.air_count) ||
    !isNonNegativeInteger(row.water_count)
  ) {
    return null;
  }

  const positions = toArray(row.solar_return_positions).map(mapPosition);
  const aspects = toArray(row.solar_return_aspects).map(mapAspect);
  const natalContacts = toArray(row.solar_return_natal_aspects).map(
    mapNatalAspect,
  );

  if (
    positions.some((position) => position === null) ||
    aspects.some((aspect) => aspect === null) ||
    natalContacts.some((contact) => contact === null)
  ) {
    return null;
  }

  return {
    ...summary,
    ascendantRuler: row.ascendant_ruler,
    professionalNotes: row.professional_notes,
    positions: positions.filter(
      (position): position is SolarReturnPosition => position !== null,
    ),
    aspects: aspects.filter(
      (aspect): aspect is SolarReturnAspect => aspect !== null,
    ),
    natalContacts: natalContacts.filter(
      (contact): contact is SolarReturnNatalAspect => contact !== null,
    ),
    elementSummary: {
      fire: row.fire_count,
      earth: row.earth_count,
      air: row.air_count,
      water: row.water_count,
    },
  };
}

function mapPosition(row: PositionRow): SolarReturnPosition | null {
  if (
    !isSolarReturnPointId(row.point) ||
    !isZodiacSignId(row.sign) ||
    !isHouseNumber(row.natal_overlay_house)
  ) {
    return null;
  }

  const isAngle = isSolarReturnAngleId(row.point);

  if (isAngle) {
    if (row.solar_return_house !== null) {
      return null;
    }

    return {
      point: row.point,
      sign: row.sign,
      solarReturnHouse: null,
      natalOverlayHouse: row.natal_overlay_house,
    };
  }

  if (row.solar_return_house === null || !isHouseNumber(row.solar_return_house)) {
    return null;
  }

  return {
    point: row.point,
    sign: row.sign,
    solarReturnHouse: row.solar_return_house,
    natalOverlayHouse: row.natal_overlay_house,
  };
}

function mapAspect(row: AspectRow): SolarReturnAspect | null {
  if (
    !isSolarReturnPointId(row.point_a) ||
    !isAspectId(row.aspect) ||
    !isSolarReturnPointId(row.point_b) ||
    row.point_a === row.point_b
  ) {
    return null;
  }

  return {
    pointA: row.point_a,
    aspect: row.aspect,
    pointB: row.point_b,
  };
}

function mapNatalAspect(row: NatalAspectRow): SolarReturnNatalAspect | null {
  if (
    !isSolarReturnPointId(row.solar_return_point) ||
    !isAspectId(row.aspect) ||
    !isChartPointId(row.natal_point)
  ) {
    return null;
  }

  return {
    solarReturnPoint: row.solar_return_point,
    aspect: row.aspect,
    natalPoint: row.natal_point,
  };
}

function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function normalizeDate(value: string): string {
  return value.slice(0, 10);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function mapWriteError(
  error: { message?: string; code?: string } | null | undefined,
): "unauthorized" | "not_found" | "duplicate_period" | "error" {
  const code = error?.code ?? "";
  const normalized = (error?.message ?? "").toLowerCase();

  if (normalized.includes("not authenticated")) {
    return "unauthorized";
  }

  if (
    normalized.includes("client_not_found") ||
    normalized.includes("solar_return_not_found")
  ) {
    return "not_found";
  }

  if (
    code === "23505" ||
    normalized.includes("solar_returns_client_id_period_start_period_end")
  ) {
    return "duplicate_period";
  }

  return "error";
}
