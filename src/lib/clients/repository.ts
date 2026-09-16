import { cache } from "react";
import {
  ASPECTS,
  ASTROLOGICAL_BODIES,
  CHART_CONFIGURATIONS,
  CHART_POINTS,
  HOUSE_NUMBERS,
  ZODIAC_SIGNS,
  getConfigurationPointRule,
  type AstrologicalPosition,
  type ChartPointId,
  type HouseRuler,
  type NatalChart,
} from "@/lib/astrology";
import { houseRulersFromQuery, type HouseRulerRow } from "./house-rulers";
import {
  escapeIlikePattern,
  getClientSearchTokens,
  normalizeClientSearchQuery,
  parseClientListSort,
} from "./list-query";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ClientListItem,
  ParsedClientInput,
  PersistedClient,
  PersistedClientSummary,
} from "@/types/client";

export type ClientWithNatalChart = PersistedClient & {
  natalChart: NatalChart;
  natalChartId: string;
};

export type DataQueryResult<T> =
  | { status: "ok"; data: T }
  | { status: "not_configured" }
  | { status: "unauthorized" }
  | { status: "not_found" }
  | { status: "error" };

export type ListQueryResult<T> =
  | { status: "ok"; data: T }
  | { status: "not_configured" }
  | { status: "unauthorized" }
  | { status: "error" };

const CLIENT_SELECT =
  "id, first_name, last_name, age, professional_notes, created_at, updated_at";

type ClientRow = {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  professional_notes: string | null;
  created_at: string;
  updated_at: string;
};

type PositionRow = {
  point: string;
  sign: string;
  house: number;
};

type AspectRow = {
  point_a: string;
  aspect: string;
  point_b: string;
};

type ConfigurationRow = {
  configuration_type: string;
  points: string[];
};

type NatalChartRow = {
  id: string;
  ascendant: string;
  midheaven: string;
  natal_positions: PositionRow[] | null;
  natal_aspects: AspectRow[] | null;
  natal_configurations: ConfigurationRow[] | null;
  natal_house_rulers: HouseRulerRow[] | null;
};

type ClientDetailRow = ClientRow & {
  natal_charts: NatalChartRow[] | NatalChartRow | null;
};

export async function createClientWithNatalChart(input: {
  client: ParsedClientInput;
  natalChart: NatalChart;
}): Promise<ListQueryResult<string>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { status: "unauthorized" };
    }

    const { data, error } = await supabase.rpc(
      "create_client_with_natal_chart",
      {
        p_first_name: input.client.firstName,
        p_last_name: input.client.lastName,
        p_age: input.client.age,
        p_professional_notes: input.client.professionalNotes,
        p_ascendant: input.natalChart.ascendant,
        p_midheaven: input.natalChart.midheaven,
        p_positions: input.natalChart.positions,
        p_aspects: input.natalChart.aspects,
        p_configurations: input.natalChart.configurations,
        p_house_rulers: input.natalChart.houseRulers ?? [],
      },
    );

    if (error || typeof data !== "string") {
      console.error("[clients] Failed to create client with natal chart", {
        message: error?.message,
        code: error?.code,
      });
      return { status: "error" };
    }

    return { status: "ok", data };
  } catch (error) {
    console.error("[clients] Unexpected error creating client", error);
    return { status: "error" };
  }
}

export async function updateClientWithNatalChart(input: {
  clientId: string;
  client: ParsedClientInput;
  natalChart: NatalChart;
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

    const { data, error } = await supabase.rpc(
      "update_client_with_natal_chart",
      {
        p_client_id: input.clientId,
        p_first_name: input.client.firstName,
        p_last_name: input.client.lastName,
        p_age: input.client.age,
        p_professional_notes: input.client.professionalNotes,
        p_ascendant: input.natalChart.ascendant,
        p_midheaven: input.natalChart.midheaven,
        p_positions: input.natalChart.positions,
        p_aspects: input.natalChart.aspects,
        p_configurations: input.natalChart.configurations,
        p_house_rulers: input.natalChart.houseRulers ?? [],
      },
    );

    if (error || typeof data !== "string") {
      const mapped = mapUpdateRpcError(error?.message);

      if (mapped === "error") {
        console.error("[clients] Failed to update client with natal chart", {
          message: error?.message,
          code: error?.code,
        });
      }

      return { status: mapped };
    }

    return { status: "ok", data };
  } catch (error) {
    console.error("[clients] Unexpected error updating client", error);
    return { status: "error" };
  }
}

// Child natal-chart rows follow via ON DELETE CASCADE on natal_charts,
// natal_positions, natal_aspects, natal_configurations, natal_house_rulers,
// natal_chart_reports and transit_analyses.
export async function deleteClient(
  clientId: string,
): Promise<DataQueryResult<string>> {
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
      .from("clients")
      .delete()
      .eq("id", clientId)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[clients] Failed to delete client", {
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
    console.error("[clients] Unexpected error deleting client", error);
    return { status: "error" };
  }
}

export async function getClients(): Promise<
  ListQueryResult<PersistedClientSummary[]>
> {
  const result = await listClients();

  if (result.status !== "ok") {
    return result;
  }

  return {
    status: "ok",
    data: result.data.map((client) => ({
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      age: client.age,
      createdAt: client.createdAt,
    })),
  };
}

export async function listClients(input?: {
  search?: string;
  sort?: string;
}): Promise<ListQueryResult<ClientListItem[]>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  const search = normalizeClientSearchQuery(input?.search ?? "");
  const sort = parseClientListSort(input?.sort);
  const tokens = getClientSearchTokens(search);

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { status: "unauthorized" };
    }

    let request = supabase
      .from("clients")
      .select("id, first_name, last_name, age, created_at, updated_at")
      .eq("user_id", user.id);

    for (const token of tokens) {
      const pattern = `%${escapeIlikePattern(token)}%`;
      request = request.or(
        `first_name.ilike."${pattern}",last_name.ilike."${pattern}"`,
      );
    }

    if (sort === "name-asc") {
      request = request
        .order("first_name", { ascending: true })
        .order("last_name", { ascending: true });
    } else if (sort === "name-desc") {
      request = request
        .order("first_name", { ascending: false })
        .order("last_name", { ascending: false });
    } else {
      request = request
        .order("updated_at", { ascending: false })
        .order("id", { ascending: false });
    }

    const { data, error } = await request.returns<
      Array<{
        id: string;
        first_name: string;
        last_name: string;
        age: number;
        created_at: string;
        updated_at: string;
      }>
    >();

    if (error || !data) {
      console.error("[clients] Failed to list clients", {
        message: error?.message,
        code: error?.code,
      });
      return { status: "error" };
    }

    return {
      status: "ok",
      data: data.map((row) => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        age: row.age,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    };
  } catch (error) {
    console.error("[clients] Unexpected error listing clients", error);
    return { status: "error" };
  }
}

export type RecentClientSummary = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  updatedAt: string;
};

export type RecentClientsResult = {
  clients: RecentClientSummary[];
  hasMore: boolean;
};

export async function getRecentClients(
  limit: number,
): Promise<ListQueryResult<RecentClientsResult>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!Number.isInteger(limit) || limit < 1) {
    return { status: "error" };
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
      .from("clients")
      .select("id, first_name, last_name, age, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(limit + 1)
      .returns<
        Array<{
          id: string;
          first_name: string;
          last_name: string;
          age: number;
          updated_at: string;
        }>
      >();

    if (error || !data) {
      console.error("[clients] Failed to list recent clients", {
        message: error?.message,
        code: error?.code,
      });
      return { status: "error" };
    }

    return {
      status: "ok",
      data: {
        clients: data.slice(0, limit).map((row) => ({
          id: row.id,
          firstName: row.first_name,
          lastName: row.last_name,
          age: row.age,
          updatedAt: row.updated_at,
        })),
        hasMore: data.length > limit,
      },
    };
  } catch (error) {
    console.error("[clients] Unexpected error listing recent clients", error);
    return { status: "error" };
  }
}

export const getClientById = cache(async function getClientById(
  id: string,
): Promise<DataQueryResult<ClientWithNatalChart>> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  if (!isUuid(id)) {
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
      .from("clients")
      .select(
        `
        ${CLIENT_SELECT},
        natal_charts (
          id,
          ascendant,
          midheaven,
          natal_positions ( point, sign, house ),
          natal_aspects ( point_a, aspect, point_b ),
          natal_configurations ( configuration_type, points )
        )
      `,
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle()
      .returns<ClientDetailRow>();

    if (error) {
      console.error("[clients] Failed to load client", {
        message: error.message,
        code: error.code,
      });
      return { status: "error" };
    }

    if (!data) {
      return { status: "not_found" };
    }

    const mapped = mapClientDetail(data);

    if (!mapped) {
      console.error("[clients] Stored natal chart could not be mapped");
      return { status: "error" };
    }

    const chartId = toArray(data.natal_charts)[0]?.id;

    if (!chartId) {
      return { status: "error" };
    }

    const houseRulers = await loadHouseRulers(supabase, chartId);

    if (houseRulers.status !== "ok") {
      return { status: "error" };
    }

    return {
      status: "ok",
      data: {
        ...mapped,
        natalChart: {
          ...mapped.natalChart,
          houseRulers: houseRulers.data,
        },
      },
    };
  } catch (error) {
    console.error("[clients] Unexpected error loading client", error);
    return { status: "error" };
  }
});

function mapClientDetail(row: ClientDetailRow): ClientWithNatalChart | null {
  const charts = toArray(row.natal_charts);
  const chartRow = charts[0];

  if (!chartRow) {
    return null;
  }

  const natalChart = mapNatalChart(chartRow);

  if (!natalChart) {
    return null;
  }

  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    age: row.age,
    professionalNotes: row.professional_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    natalChart,
    natalChartId: chartRow.id,
  };
}

function mapNatalChart(row: NatalChartRow): NatalChart | null {
  const ascendant = parseZodiacSignId(row.ascendant);
  const midheaven = parseZodiacSignId(row.midheaven);

  if (!ascendant || !midheaven) {
    return null;
  }

  const positions = toArray(row.natal_positions).map((position) => {
    const point = parseBodyId(position.point);
    const sign = parseZodiacSignId(position.sign);
    const house = parseHouseNumber(position.house);

    if (!point || !sign || house === null) {
      return null;
    }

    return { point, sign, house };
  });

  if (positions.some((position) => position === null)) {
    return null;
  }

  const completePositions = positions.filter(
    (position): position is NonNullable<typeof position> => position !== null,
  );

  if (completePositions.length !== ASTROLOGICAL_BODIES.length) {
    return null;
  }

  const orderedPositions: AstrologicalPosition[] = [];

  for (const body of ASTROLOGICAL_BODIES) {
    const position = completePositions.find((entry) => entry.point === body.id);

    if (!position) {
      return null;
    }

    orderedPositions.push(position);
  }

  const aspects = toArray(row.natal_aspects).map((aspect) => {
    const pointA = parseChartPointId(aspect.point_a);
    const aspectId = parseAspectId(aspect.aspect);
    const pointB = parseChartPointId(aspect.point_b);

    if (!pointA || !aspectId || !pointB || pointA === pointB) {
      return null;
    }

    return { pointA, aspect: aspectId, pointB };
  });

  if (aspects.some((aspect) => aspect === null)) {
    return null;
  }

  const configurations = toArray(row.natal_configurations).map(
    (configuration) => {
      const type = parseConfigurationId(configuration.configuration_type);
      const points = parseConfigurationPoints(type, configuration.points);

      return type && points ? { type, points } : null;
    },
  );

  if (configurations.some((configuration) => configuration === null)) {
    return null;
  }

  return {
    positions: orderedPositions,
    ascendant,
    midheaven,
    aspects: aspects.filter(
      (aspect): aspect is NonNullable<typeof aspect> => aspect !== null,
    ),
    configurations: configurations.filter(
      (configuration): configuration is NonNullable<typeof configuration> =>
        configuration !== null,
    ),
    houseRulers: [],
  };
}

async function loadHouseRulers(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  natalChartId: string,
): Promise<DataQueryResult<HouseRuler[]>> {
  const { data, error } = await supabase
    .from("natal_house_rulers")
    .select("house, planet, sign")
    .eq("natal_chart_id", natalChartId)
    .returns<HouseRulerRow[]>();

  const loaded = houseRulersFromQuery({ data, error });

  if (loaded.status === "error") {
    if (error) {
      console.error("[clients] Failed to load house rulers", {
        message: error.message,
        code: error.code,
      });
    } else {
      console.error("[clients] Stored house rulers could not be mapped");
    }

    return { status: "error" };
  }

  return loaded;
}

function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function parseBodyId(value: string) {
  return ASTROLOGICAL_BODIES.find((body) => body.id === value)?.id ?? null;
}

function parseZodiacSignId(value: string) {
  return ZODIAC_SIGNS.find((sign) => sign.id === value)?.id ?? null;
}

function parseHouseNumber(value: number) {
  return HOUSE_NUMBERS.find((house) => house === value) ?? null;
}

function parseChartPointId(value: string) {
  return CHART_POINTS.find((point) => point.id === value)?.id ?? null;
}

function parseAspectId(value: string) {
  return ASPECTS.find((aspect) => aspect.id === value)?.id ?? null;
}

function parseConfigurationId(value: string) {
  return (
    CHART_CONFIGURATIONS.find((configuration) => configuration.id === value)
      ?.id ?? null
  );
}

function parseConfigurationPoints(
  type: ReturnType<typeof parseConfigurationId>,
  values: string[] | null | undefined,
) {
  if (!type || !Array.isArray(values)) {
    return null;
  }

  const rule = getConfigurationPointRule(type);

  if (values.length < rule.min || values.length > rule.max) {
    return null;
  }

  const points: ChartPointId[] = [];
  const seen = new Set<ChartPointId>();

  for (const value of values) {
    const point = parseChartPointId(value);

    if (!point || seen.has(point)) {
      return null;
    }

    seen.add(point);
    points.push(point);
  }

  return points;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function mapUpdateRpcError(
  message: string | undefined,
): "unauthorized" | "not_found" | "error" {
  const normalized = (message ?? "").toLowerCase();

  if (normalized.includes("not authenticated")) {
    return "unauthorized";
  }

  if (normalized.includes("client_not_found")) {
    return "not_found";
  }

  return "error";
}
