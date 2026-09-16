import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DataQueryResult } from "@/lib/clients/repository";
import {
  isAspectId,
  isChartPointId,
  isEclipseType,
  isHouseNumber,
  isIsoDateOnly,
  isTransitPlanetId,
  isZodiacSignId,
} from "./helpers";
import type {
  TransitAnalysis,
  TransitAnalysisInput,
  TransitAnalysisSummary,
  TransitAspect,
  TransitEclipse,
  TransitPosition,
} from "./types";

type AnalysisRow = {
  id: string;
  client_id: string;
  analysis_date: string;
  created_at: string;
  updated_at: string;
};

type PositionRow = {
  planet: string;
  sign: string;
  natal_house: number;
};

type AspectRow = {
  transit_planet: string;
  aspect: string;
  natal_point: string;
};

type EclipseRow = {
  eclipse_type: string;
  sign_a: string;
  natal_house_a: number;
  sign_b: string;
  natal_house_b: number;
};

type AnalysisDetailRow = AnalysisRow & {
  transit_positions: PositionRow[] | PositionRow | null;
  transit_aspects: AspectRow[] | AspectRow | null;
  transit_eclipses: EclipseRow[] | EclipseRow | null;
};

type AnalysisSummaryRow = AnalysisRow & {
  transit_positions: Array<{ id: string }> | { id: string } | null;
  transit_aspects: Array<{ id: string }> | { id: string } | null;
  transit_eclipses: Array<{ id: string }> | { id: string } | null;
};

const ANALYSIS_SELECT =
  "id, client_id, analysis_date, created_at, updated_at";

export async function createTransitAnalysis(input: {
  clientId: string;
  analysis: TransitAnalysisInput;
}): Promise<DataQueryResult<string>> {
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

    const { data, error } = await supabase.rpc("create_transit_analysis", {
      p_client_id: input.clientId,
      p_analysis_date: input.analysis.analysisDate,
      p_positions: input.analysis.positions,
      p_aspects: input.analysis.aspects,
      p_eclipses: input.analysis.eclipses,
    });

    if (error || typeof data !== "string") {
      const mapped = mapRpcError(error?.message);

      if (mapped === "error") {
        console.error("[transits] Failed to create transit analysis", {
          message: error?.message,
          code: error?.code,
        });
      }

      return { status: mapped };
    }

    return { status: "ok", data };
  } catch (error) {
    console.error("[transits] Unexpected error creating transit analysis", error);
    return { status: "error" };
  }
}

export async function updateTransitAnalysis(input: {
  analysisId: string;
  analysis: TransitAnalysisInput;
}): Promise<DataQueryResult<string>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!isUuid(input.analysisId)) {
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

    const { data, error } = await supabase.rpc("update_transit_analysis", {
      p_transit_analysis_id: input.analysisId,
      p_analysis_date: input.analysis.analysisDate,
      p_positions: input.analysis.positions,
      p_aspects: input.analysis.aspects,
      p_eclipses: input.analysis.eclipses,
    });

    if (error || typeof data !== "string") {
      const mapped = mapRpcError(error?.message);

      if (mapped === "error") {
        console.error("[transits] Failed to update transit analysis", {
          message: error?.message,
          code: error?.code,
        });
      }

      return { status: mapped };
    }

    return { status: "ok", data };
  } catch (error) {
    console.error("[transits] Unexpected error updating transit analysis", error);
    return { status: "error" };
  }
}

export async function deleteTransitAnalysis(
  analysisId: string,
): Promise<DataQueryResult<string>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!isUuid(analysisId)) {
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
      .from("transit_analyses")
      .delete()
      .eq("id", analysisId)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[transits] Failed to delete transit analysis", {
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
    console.error("[transits] Unexpected error deleting transit analysis", error);
    return { status: "error" };
  }
}

export async function listTransitAnalysesByClientId(
  clientId: string,
): Promise<DataQueryResult<TransitAnalysisSummary[]>> {
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
      .from("transit_analyses")
      .select(
        `
        ${ANALYSIS_SELECT},
        transit_positions ( id ),
        transit_aspects ( id ),
        transit_eclipses ( id )
      `,
      )
      .eq("client_id", clientId)
      .order("analysis_date", { ascending: false })
      .order("created_at", { ascending: false })
      .returns<AnalysisSummaryRow[]>();

    if (error || !data) {
      console.error("[transits] Failed to list transit analyses", {
        message: error?.message,
        code: error?.code,
      });
      return { status: "error" };
    }

    return {
      status: "ok",
      data: data.map(mapSummary),
    };
  } catch (error) {
    console.error("[transits] Unexpected error listing transit analyses", error);
    return { status: "error" };
  }
}

export const getTransitAnalysisById = cache(async function getTransitAnalysisById(
  analysisId: string,
): Promise<DataQueryResult<TransitAnalysis>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!isUuid(analysisId)) {
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
      .from("transit_analyses")
      .select(
        `
        ${ANALYSIS_SELECT},
        transit_positions ( planet, sign, natal_house ),
        transit_aspects ( transit_planet, aspect, natal_point ),
        transit_eclipses (
          eclipse_type,
          sign_a,
          natal_house_a,
          sign_b,
          natal_house_b
        )
      `,
      )
      .eq("id", analysisId)
      .maybeSingle()
      .returns<AnalysisDetailRow>();

    if (error) {
      console.error("[transits] Failed to load transit analysis", {
        message: error.message,
        code: error.code,
      });
      return { status: "error" };
    }

    if (!data) {
      return { status: "not_found" };
    }

    const mapped = mapAnalysis(data);

    if (!mapped) {
      console.error("[transits] Stored transit analysis could not be mapped");
      return { status: "error" };
    }

    return { status: "ok", data: mapped };
  } catch (error) {
    console.error("[transits] Unexpected error loading transit analysis", error);
    return { status: "error" };
  }
});

function mapSummary(row: AnalysisSummaryRow): TransitAnalysisSummary {
  return {
    id: row.id,
    clientId: row.client_id,
    analysisDate: normalizeDate(row.analysis_date),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    positionCount: nestedCount(row.transit_positions),
    aspectCount: nestedCount(row.transit_aspects),
    eclipseCount: nestedCount(row.transit_eclipses),
  };
}

function mapAnalysis(row: AnalysisDetailRow): TransitAnalysis | null {
  const analysisDate = normalizeDate(row.analysis_date);

  if (!isIsoDateOnly(analysisDate)) {
    return null;
  }

  const positions = toArray(row.transit_positions).map(mapPosition);
  const aspects = toArray(row.transit_aspects).map(mapAspect);
  const eclipses = toArray(row.transit_eclipses).map(mapEclipse);

  if (
    positions.some((position) => position === null) ||
    aspects.some((aspect) => aspect === null) ||
    eclipses.some((eclipse) => eclipse === null)
  ) {
    return null;
  }

  return {
    id: row.id,
    clientId: row.client_id,
    analysisDate,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    positions: positions.filter(
      (position): position is TransitPosition => position !== null,
    ),
    aspects: aspects.filter(
      (aspect): aspect is TransitAspect => aspect !== null,
    ),
    eclipses: eclipses.filter(
      (eclipse): eclipse is TransitEclipse => eclipse !== null,
    ),
  };
}

function mapPosition(row: PositionRow): TransitPosition | null {
  if (
    !isTransitPlanetId(row.planet) ||
    !isZodiacSignId(row.sign) ||
    !isHouseNumber(row.natal_house)
  ) {
    return null;
  }

  return {
    planet: row.planet,
    sign: row.sign,
    natalHouse: row.natal_house,
  };
}

function mapAspect(row: AspectRow): TransitAspect | null {
  if (
    !isTransitPlanetId(row.transit_planet) ||
    !isAspectId(row.aspect) ||
    !isChartPointId(row.natal_point)
  ) {
    return null;
  }

  return {
    transitPlanet: row.transit_planet,
    aspect: row.aspect,
    natalPoint: row.natal_point,
  };
}

function mapEclipse(row: EclipseRow): TransitEclipse | null {
  if (
    !isEclipseType(row.eclipse_type) ||
    !isZodiacSignId(row.sign_a) ||
    !isHouseNumber(row.natal_house_a) ||
    !isZodiacSignId(row.sign_b) ||
    !isHouseNumber(row.natal_house_b) ||
    row.sign_a === row.sign_b ||
    row.natal_house_a === row.natal_house_b
  ) {
    return null;
  }

  return {
    eclipseType: row.eclipse_type,
    signA: row.sign_a,
    natalHouseA: row.natal_house_a,
    signB: row.sign_b,
    natalHouseB: row.natal_house_b,
  };
}

function nestedCount(
  value: Array<{ id: string }> | { id: string } | null | undefined,
): number {
  if (!value) {
    return 0;
  }

  return Array.isArray(value) ? value.length : 1;
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

function mapRpcError(
  message: string | undefined,
): "unauthorized" | "not_found" | "error" {
  const normalized = (message ?? "").toLowerCase();

  if (normalized.includes("not authenticated")) {
    return "unauthorized";
  }

  if (
    normalized.includes("client_not_found") ||
    normalized.includes("transit_analysis_not_found")
  ) {
    return "not_found";
  }

  return "error";
}
