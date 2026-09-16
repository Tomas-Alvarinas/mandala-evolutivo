import {
  ASPECTS,
  ASTROLOGICAL_BODIES,
  CHART_CONFIGURATIONS,
  CHART_POINTS,
  HOUSE_NUMBERS,
  ZODIAC_SIGNS,
  getConfigurationPointRule,
  isRulerPlanetId,
  type AstrologicalPosition,
  type ChartConfiguration,
  type ChartConfigurationFormData,
  type ChartPointId,
  type HouseRuler,
  type HouseRulerFormData,
  type NatalAspect,
  type NatalAspectFormData,
  type NatalChart,
  type NatalChartFormData,
} from "@/lib/astrology";

export type NatalChartResult =
  | { success: true; data: NatalChart }
  | { success: false; error: string };


export type NatalAspectDraft = NatalAspectFormData & {
  uiId: string;
};

export type ChartConfigurationDraft = ChartConfigurationFormData & {
  uiId: string;
};

export type HouseRulerDraft = HouseRulerFormData & {
  uiId: string;
};

export type NatalChartDraft = Omit<
  NatalChartFormData,
  "aspects" | "configurations" | "houseRulers"
> & {
  aspects: NatalAspectDraft[];
  configurations: ChartConfigurationDraft[];
  houseRulers: HouseRulerDraft[];
};

export function createEmptyNatalChartDraft(): NatalChartDraft {
  return {
    positions: ASTROLOGICAL_BODIES.map((body) => ({
      point: body.id,
      sign: null,
      house: null,
    })),
    ascendant: null,
    midheaven: null,
    aspects: [],
    configurations: [],
    houseRulers: [],
  };
}

export function natalChartToDraft(chart: NatalChart): NatalChartDraft {
  const positionsByPoint = new Map(
    chart.positions.map((position) => [position.point, position]),
  );

  return {
    positions: ASTROLOGICAL_BODIES.map((body) => {
      const position = positionsByPoint.get(body.id);

      return {
        point: body.id,
        sign: position?.sign ?? null,
        house: position?.house ?? null,
      };
    }),
    ascendant: chart.ascendant,
    midheaven: chart.midheaven,
    aspects: chart.aspects.map((aspect) => ({
      uiId: createUiId(),
      pointA: aspect.pointA,
      aspect: aspect.aspect,
      pointB: aspect.pointB,
    })),
    configurations: chart.configurations.map((configuration) => ({
      uiId: createUiId(),
      type: configuration.type,
      points: [...configuration.points],
    })),
    houseRulers: (chart.houseRulers ?? []).map((ruler) => ({
      uiId: createUiId(),
      house: ruler.house,
      planet: ruler.planet,
      sign: ruler.sign,
    })),
  };
}

export function toNatalChartFormData(
  draft: NatalChartDraft,
): NatalChartFormData {
  return {
    positions: draft.positions,
    ascendant: draft.ascendant,
    midheaven: draft.midheaven,
    aspects: draft.aspects.map((aspect) => ({
      pointA: aspect.pointA,
      aspect: aspect.aspect,
      pointB: aspect.pointB,
    })),
    configurations: draft.configurations.map((configuration) => ({
      type: configuration.type,
      points: configuration.points,
    })),
    houseRulers: (draft.houseRulers ?? []).map((ruler) => ({
      house: ruler.house,
      planet: ruler.planet,
      sign: ruler.sign,
    })),
  };
}

export function getNatalChartContinueError(
  form: NatalChartFormData,
): string | null {
  const result = toNatalChart(form);
  return result.success ? null : result.error;
}

export function toNatalChart(form: NatalChartFormData): NatalChartResult {
  if (form.positions.length !== ASTROLOGICAL_BODIES.length) {
    return {
      success: false,
      error: "Completá todos los signos y casas antes de continuar.",
    };
  }

  const seenPoints = new Set<string>();
  const positions: AstrologicalPosition[] = [];

  for (const expectedBody of ASTROLOGICAL_BODIES) {
    const position = form.positions.find(
      (entry) => entry.point === expectedBody.id,
    );

    if (
      !position ||
      position.sign === null ||
      position.house === null ||
      !isZodiacSignId(position.sign) ||
      !isHouseNumber(position.house)
    ) {
      return {
        success: false,
        error: "Completá todos los signos y casas antes de continuar.",
      };
    }

    if (seenPoints.has(position.point)) {
      return {
        success: false,
        error: "Completá todos los signos y casas antes de continuar.",
      };
    }

    seenPoints.add(position.point);
    positions.push({
      point: expectedBody.id,
      sign: position.sign,
      house: position.house,
    });
  }

  if (!isZodiacSignId(form.ascendant) || !isZodiacSignId(form.midheaven)) {
    return {
      success: false,
      error: "Completá todos los signos y casas antes de continuar.",
    };
  }

  const aspects: NatalAspect[] = [];

  for (const aspect of form.aspects) {
    if (
      aspect.pointA === null ||
      aspect.aspect === null ||
      aspect.pointB === null
    ) {
      return {
        success: false,
        error: "Completá o eliminá los aspectos incompletos.",
      };
    }

    if (
      !isChartPointId(aspect.pointA) ||
      !isAspectId(aspect.aspect) ||
      !isChartPointId(aspect.pointB)
    ) {
      return {
        success: false,
        error: "Hay un aspecto inválido. Revisá los puntos y el tipo.",
      };
    }

    if (aspect.pointA === aspect.pointB) {
      return {
        success: false,
        error: "Un aspecto no puede unir un punto consigo mismo.",
      };
    }

    aspects.push({
      pointA: aspect.pointA,
      aspect: aspect.aspect,
      pointB: aspect.pointB,
    });
  }

  const seenConfigurations = new Set<string>();
  const configurations: ChartConfiguration[] = [];

  for (const configuration of form.configurations) {
    if (!isConfigurationId(configuration.type)) {
      return {
        success: false,
        error: "Hay una configuración inválida.",
      };
    }

    if (seenConfigurations.has(configuration.type)) {
      return {
        success: false,
        error: "No puede haber configuraciones duplicadas.",
      };
    }

    const pointsResult = parseConfigurationPoints(configuration);

    if (!pointsResult.success) {
      return pointsResult;
    }

    seenConfigurations.add(configuration.type);
    configurations.push({
      type: configuration.type,
      points: pointsResult.points,
    });
  }

  const houseRulersResult = parseHouseRulers(form.houseRulers ?? []);

  if (!houseRulersResult.success) {
    return houseRulersResult;
  }

  return {
    success: true,
    data: {
      positions,
      ascendant: form.ascendant,
      midheaven: form.midheaven,
      aspects,
      configurations,
      houseRulers: houseRulersResult.houseRulers,
    },
  };
}

export function parseNatalChart(
  form: NatalChartFormData,
): NatalChart | null {
  const result = toNatalChart(form);
  return result.success ? result.data : null;
}

export function createUiId(): string {
  return crypto.randomUUID();
}

function isZodiacSignId(
  value: string | null,
): value is (typeof ZODIAC_SIGNS)[number]["id"] {
  return ZODIAC_SIGNS.some((sign) => sign.id === value);
}

function isHouseNumber(
  value: number | null,
): value is (typeof HOUSE_NUMBERS)[number] {
  return HOUSE_NUMBERS.some((house) => house === value);
}

function isChartPointId(
  value: string,
): value is (typeof CHART_POINTS)[number]["id"] {
  return CHART_POINTS.some((point) => point.id === value);
}

function isAspectId(value: string): value is (typeof ASPECTS)[number]["id"] {
  return ASPECTS.some((aspect) => aspect.id === value);
}

function isConfigurationId(
  value: string,
): value is (typeof CHART_CONFIGURATIONS)[number]["id"] {
  return CHART_CONFIGURATIONS.some(
    (configuration) => configuration.id === value,
  );
}

function parseConfigurationPoints(
  configuration: ChartConfigurationFormData,
): { success: true; points: ChartPointId[] } | { success: false; error: string } {
  const rule = getConfigurationPointRule(configuration.type);

  if (
    configuration.points.length < rule.min ||
    configuration.points.length > rule.max
  ) {
    return {
      success: false,
      error: "Hay una configuración con una cantidad de participantes inválida.",
    };
  }

  const points: ChartPointId[] = [];
  const seenPoints = new Set<ChartPointId>();

  for (const point of configuration.points) {
    if (point === null) {
      return {
        success: false,
        error: "Completá o eliminá las configuraciones incompletas.",
      };
    }

    if (!isChartPointId(point)) {
      return {
        success: false,
        error: "Hay una configuración inválida.",
      };
    }

    if (seenPoints.has(point)) {
      return {
        success: false,
        error: "Una configuración no puede repetir el mismo planeta o punto.",
      };
    }

    seenPoints.add(point);
    points.push(point);
  }

  return { success: true, points };
}

function parseHouseRulers(
  rulers: HouseRulerFormData[],
): { success: true; houseRulers: HouseRuler[] } | { success: false; error: string } {
  const houseRulers: HouseRuler[] = [];
  const seenHouses = new Set<number>();

  for (const ruler of rulers) {
    if (ruler.house === null || ruler.planet === null || ruler.sign === null) {
      return {
        success: false,
        error: "Completá o eliminá los regentes incompletos.",
      };
    }

    if (!isHouseNumber(ruler.house)) {
      return {
        success: false,
        error: "Hay un regente con una casa inválida.",
      };
    }

    if (!isRulerPlanetId(ruler.planet)) {
      return {
        success: false,
        error: "Hay un regente con un planeta inválido.",
      };
    }

    if (!isZodiacSignId(ruler.sign)) {
      return {
        success: false,
        error: "Hay un regente con un signo inválido.",
      };
    }

    if (seenHouses.has(ruler.house)) {
      return {
        success: false,
        error: "No puede haber dos regentes para la misma casa.",
      };
    }

    seenHouses.add(ruler.house);
    houseRulers.push({
      house: ruler.house,
      planet: ruler.planet,
      sign: ruler.sign,
    });
  }

  houseRulers.sort((left, right) => left.house - right.house);

  return { success: true, houseRulers };
}
