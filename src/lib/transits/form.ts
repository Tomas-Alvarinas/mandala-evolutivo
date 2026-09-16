import type {
  TransitAnalysisFormData,
  TransitAnalysisInput,
  TransitAspect,
  TransitAspectFormData,
  TransitEclipse,
  TransitEclipseFormData,
  TransitPosition,
  TransitPositionFormData,
} from "./types";
import {
  isAspectId,
  isChartPointId,
  isEclipseType,
  isHouseNumber,
  isIsoDateOnly,
  isTransitPlanetId,
  isZodiacSignId,
  todayIsoDate,
  transitAspectKey,
  transitEclipseKey,
  transitPositionKey,
} from "./helpers";

export const DUPLICATE_TRANSIT_PLANET_ERROR =
  "Este planeta ya tiene una posición cargada en este análisis.";

export const EMPTY_TRANSIT_ANALYSIS_ERROR =
  "Agregá al menos un tránsito, aspecto o eclipse antes de guardar.";

export type TransitAnalysisParseResult =
  | { success: true; data: TransitAnalysisInput }
  | { success: false; error: string };

export type TransitCommitResult<T> =
  | { success: true; item: T }
  | { success: false; error: string };

export type TransitPositionDraft = TransitPositionFormData & { uiId: string };
export type TransitAspectDraft = TransitAspectFormData & { uiId: string };
export type TransitEclipseDraft = TransitEclipseFormData & { uiId: string };

export type TransitAnalysisDraft = {
  analysisDate: string;
  positions: TransitPositionDraft[];
  aspects: TransitAspectDraft[];
  eclipses: TransitEclipseDraft[];
};

export function createUiId(): string {
  return crypto.randomUUID();
}

function withStarterRow<T>(items: T[], createEmpty: () => T): T[] {
  return items.length === 0 ? [createEmpty()] : items;
}

export function emptyPositionComposer(): TransitPositionFormData {
  return { planet: null, sign: null, natalHouse: null };
}

export function emptyAspectComposer(): TransitAspectFormData {
  return { transitPlanet: null, aspect: null, natalPoint: null };
}

export function emptyEclipseComposer(): TransitEclipseFormData {
  return {
    eclipseType: null,
    signA: null,
    natalHouseA: null,
    signB: null,
    natalHouseB: null,
  };
}

export function emptyPositionDraft(): TransitPositionDraft {
  return { uiId: createUiId(), ...emptyPositionComposer() };
}

export function emptyAspectDraft(): TransitAspectDraft {
  return { uiId: createUiId(), ...emptyAspectComposer() };
}

export function emptyEclipseDraft(): TransitEclipseDraft {
  return { uiId: createUiId(), ...emptyEclipseComposer() };
}

export function isEmptyTransitPosition(input: TransitPositionFormData): boolean {
  return input.planet === null && input.sign === null && input.natalHouse === null;
}

export function isEmptyTransitAspect(input: TransitAspectFormData): boolean {
  return (
    input.transitPlanet === null &&
    input.aspect === null &&
    input.natalPoint === null
  );
}

export function isEmptyTransitEclipse(input: TransitEclipseFormData): boolean {
  return (
    input.eclipseType === null &&
    input.signA === null &&
    input.natalHouseA === null &&
    input.signB === null &&
    input.natalHouseB === null
  );
}

export function createEmptyTransitAnalysisDraft(
  analysisDate = todayIsoDate(),
): TransitAnalysisDraft {
  return {
    analysisDate,
    positions: [emptyPositionDraft()],
    aspects: [emptyAspectDraft()],
    eclipses: [emptyEclipseDraft()],
  };
}

export function transitAnalysisToDraft(input: {
  analysisDate: string;
  positions: TransitPosition[];
  aspects: TransitAspect[];
  eclipses: TransitEclipse[];
}): TransitAnalysisDraft {
  return {
    analysisDate: input.analysisDate,
    positions: withStarterRow(
      input.positions.map((position) => ({
        ...position,
        uiId: createUiId(),
      })),
      emptyPositionDraft,
    ),
    aspects: withStarterRow(
      input.aspects.map((aspect) => ({
        ...aspect,
        uiId: createUiId(),
      })),
      emptyAspectDraft,
    ),
    eclipses: withStarterRow(
      input.eclipses.map((eclipse) => ({
        ...eclipse,
        uiId: createUiId(),
      })),
      emptyEclipseDraft,
    ),
  };
}

export function toTransitAnalysisFormData(
  draft: TransitAnalysisDraft,
): TransitAnalysisFormData {
  return {
    analysisDate: draft.analysisDate,
    positions: draft.positions.map((position) => ({
      planet: position.planet,
      sign: position.sign,
      natalHouse: position.natalHouse,
    })),
    aspects: draft.aspects.map((aspect) => ({
      transitPlanet: aspect.transitPlanet,
      aspect: aspect.aspect,
      natalPoint: aspect.natalPoint,
    })),
    eclipses: draft.eclipses.map((eclipse) => ({
      eclipseType: eclipse.eclipseType,
      signA: eclipse.signA,
      natalHouseA: eclipse.natalHouseA,
      signB: eclipse.signB,
      natalHouseB: eclipse.natalHouseB,
    })),
  };
}

export function parseTransitPositionInput(
  input: TransitPositionFormData,
): TransitCommitResult<TransitPosition> {
  if (
    input.planet === null ||
    input.sign === null ||
    input.natalHouse === null
  ) {
    return {
      success: false,
      error: "Completá planeta, signo y casa.",
    };
  }

  if (
    !isTransitPlanetId(input.planet) ||
    !isZodiacSignId(input.sign) ||
    !isHouseNumber(input.natalHouse)
  ) {
    return {
      success: false,
      error: "Hay un tránsito inválido.",
    };
  }

  return {
    success: true,
    item: {
      planet: input.planet,
      sign: input.sign,
      natalHouse: input.natalHouse,
    },
  };
}

export function parseTransitAspectInput(
  input: TransitAspectFormData,
): TransitCommitResult<TransitAspect> {
  if (
    input.transitPlanet === null ||
    input.aspect === null ||
    input.natalPoint === null
  ) {
    return {
      success: false,
      error: "Completá planeta, aspecto y punto natal.",
    };
  }

  if (
    !isTransitPlanetId(input.transitPlanet) ||
    !isAspectId(input.aspect) ||
    !isChartPointId(input.natalPoint)
  ) {
    return {
      success: false,
      error: "Hay un aspecto de tránsito inválido.",
    };
  }

  return {
    success: true,
    item: {
      transitPlanet: input.transitPlanet,
      aspect: input.aspect,
      natalPoint: input.natalPoint,
    },
  };
}

export function parseTransitEclipseInput(
  input: TransitEclipseFormData,
): TransitCommitResult<TransitEclipse> {
  if (
    input.eclipseType === null ||
    input.signA === null ||
    input.natalHouseA === null ||
    input.signB === null ||
    input.natalHouseB === null
  ) {
    return {
      success: false,
      error: "Completá el tipo, los dos signos y las dos casas.",
    };
  }

  if (
    !isEclipseType(input.eclipseType) ||
    !isZodiacSignId(input.signA) ||
    !isHouseNumber(input.natalHouseA) ||
    !isZodiacSignId(input.signB) ||
    !isHouseNumber(input.natalHouseB)
  ) {
    return {
      success: false,
      error: "Hay un eclipse inválido.",
    };
  }

  if (input.signA === input.signB) {
    return {
      success: false,
      error: "Elegí dos signos distintos.",
    };
  }

  if (input.natalHouseA === input.natalHouseB) {
    return {
      success: false,
      error: "Elegí dos casas distintas.",
    };
  }

  return {
    success: true,
    item: {
      eclipseType: input.eclipseType,
      signA: input.signA,
      natalHouseA: input.natalHouseA,
      signB: input.signB,
      natalHouseB: input.natalHouseB,
    },
  };
}

export function commitTransitPosition(
  existing: readonly TransitPosition[],
  input: TransitPositionFormData,
): TransitCommitResult<TransitPosition> {
  const parsed = parseTransitPositionInput(input);

  if (!parsed.success) {
    return parsed;
  }

  if (existing.some((position) => position.planet === parsed.item.planet)) {
    return {
      success: false,
      error: DUPLICATE_TRANSIT_PLANET_ERROR,
    };
  }

  return parsed;
}

export function commitTransitAspect(
  existing: readonly TransitAspect[],
  input: TransitAspectFormData,
): TransitCommitResult<TransitAspect> {
  const parsed = parseTransitAspectInput(input);

  if (!parsed.success) {
    return parsed;
  }

  if (
    existing.some(
      (aspect) => transitAspectKey(aspect) === transitAspectKey(parsed.item),
    )
  ) {
    return {
      success: false,
      error: "Ese aspecto ya está cargado.",
    };
  }

  return parsed;
}

export function commitTransitEclipse(
  existing: readonly TransitEclipse[],
  input: TransitEclipseFormData,
): TransitCommitResult<TransitEclipse> {
  const parsed = parseTransitEclipseInput(input);

  if (!parsed.success) {
    return parsed;
  }

  if (
    existing.some(
      (eclipse) => transitEclipseKey(eclipse) === transitEclipseKey(parsed.item),
    )
  ) {
    return {
      success: false,
      error: "Ese eclipse ya está cargado.",
    };
  }

  return parsed;
}

export function toTransitAnalysis(
  form: TransitAnalysisFormData,
): TransitAnalysisParseResult {
  if (!isIsoDateOnly(form.analysisDate.trim())) {
    return {
      success: false,
      error: "Indicá una fecha válida.",
    };
  }

  const positions: TransitPosition[] = [];
  const seenPositions = new Set<string>();

  for (const entry of form.positions) {
    if (isEmptyTransitPosition(entry)) {
      continue;
    }

    const parsed = parseTransitPositionInput(entry);

    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error === "Completá planeta, signo y casa."
            ? "Completá o eliminá los tránsitos incompletos."
            : parsed.error,
      };
    }

    const key = transitPositionKey(parsed.item);

    if (seenPositions.has(key)) {
      return {
        success: false,
        error: DUPLICATE_TRANSIT_PLANET_ERROR,
      };
    }

    seenPositions.add(key);
    positions.push(parsed.item);
  }

  const aspects: TransitAspect[] = [];
  const seenAspects = new Set<string>();

  for (const entry of form.aspects) {
    if (isEmptyTransitAspect(entry)) {
      continue;
    }

    const parsed = parseTransitAspectInput(entry);

    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error === "Completá planeta, aspecto y punto natal."
            ? "Completá o eliminá los aspectos incompletos."
            : parsed.error,
      };
    }

    const key = transitAspectKey(parsed.item);

    if (seenAspects.has(key)) {
      return {
        success: false,
        error: "Hay aspectos de tránsito duplicados.",
      };
    }

    seenAspects.add(key);
    aspects.push(parsed.item);
  }

  const eclipses: TransitEclipse[] = [];
  const seenEclipses = new Set<string>();

  for (const entry of form.eclipses) {
    if (isEmptyTransitEclipse(entry)) {
      continue;
    }

    const parsed = parseTransitEclipseInput(entry);

    if (!parsed.success) {
      if (
        parsed.error === "Completá el tipo, los dos signos y las dos casas."
      ) {
        return {
          success: false,
          error: "Completá o eliminá los eclipses incompletos.",
        };
      }

      return parsed;
    }

    const key = transitEclipseKey(parsed.item);

    if (seenEclipses.has(key)) {
      return {
        success: false,
        error: "Hay eclipses duplicados.",
      };
    }

    seenEclipses.add(key);
    eclipses.push(parsed.item);
  }

  if (
    positions.length === 0 &&
    aspects.length === 0 &&
    eclipses.length === 0
  ) {
    return {
      success: false,
      error: EMPTY_TRANSIT_ANALYSIS_ERROR,
    };
  }

  return {
    success: true,
    data: {
      analysisDate: form.analysisDate.trim(),
      positions,
      aspects,
      eclipses,
    },
  };
}
