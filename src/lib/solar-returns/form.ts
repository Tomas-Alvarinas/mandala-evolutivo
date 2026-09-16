import { isRulerPlanetId } from "@/lib/astrology";
import {
  SOLAR_RETURN_BODIES,
  SOLAR_RETURN_BODY_IDS,
  type SolarReturnBodyId,
} from "./constants";
import {
  isAspectId,
  isChartPointId,
  isHouseNumber,
  isIsoDateOnly,
  isNonNegativeInteger,
  isSolarReturnBodyId,
  isSolarReturnPointId,
  isValidSolarReturnPeriod,
  isZodiacSignId,
  solarReturnAspectKey,
  solarReturnNatalAspectKey,
  solarReturnPositionKey,
} from "./helpers";
import type {
  SolarReturnAngleFormData,
  SolarReturnAspect,
  SolarReturnAspectFormData,
  SolarReturnFormData,
  SolarReturnInput,
  SolarReturnNatalAspect,
  SolarReturnNatalAspectFormData,
  SolarReturnPosition,
  SolarReturnPositionFormData,
} from "./types";

export const DUPLICATE_SOLAR_RETURN_POINT_ERROR =
  "Este punto ya tiene una posición cargada en esta Revolución Solar.";

export const DUPLICATE_SOLAR_RETURN_ASPECT_ERROR =
  "Ese aspecto de Revolución Solar ya está cargado.";

export const DUPLICATE_SOLAR_RETURN_NATAL_CONTACT_ERROR =
  "Ese contacto con Carta Natal ya está cargado.";

export const SELF_ASPECT_ERROR =
  "Un aspecto interno no puede unir un punto consigo mismo.";

export type SolarReturnParseResult =
  | { success: true; data: SolarReturnInput }
  | { success: false; error: string };

export type SolarReturnCommitResult<T> =
  | { success: true; item: T }
  | { success: false; error: string };

export type SolarReturnAspectDraft = SolarReturnAspectFormData & {
  uiId: string;
};
export type SolarReturnNatalAspectDraft = SolarReturnNatalAspectFormData & {
  uiId: string;
};

export type SolarReturnDraft = {
  periodStart: string;
  periodEnd: string;
  ascendantRuler: SolarReturnFormData["ascendantRuler"];
  professionalNotes: string;
  ascendant: SolarReturnAngleFormData;
  midheaven: SolarReturnAngleFormData;
  positions: SolarReturnPositionFormData[];
  aspects: SolarReturnAspectDraft[];
  natalContacts: SolarReturnNatalAspectDraft[];
  elementSummary: SolarReturnFormData["elementSummary"];
};

export function createUiId(): string {
  return crypto.randomUUID();
}

function withStarterRow<T>(items: T[], createEmpty: () => T): T[] {
  return items.length === 0 ? [createEmpty()] : items;
}

function emptyAngle(): SolarReturnAngleFormData {
  return { sign: null, natalOverlayHouse: null };
}

export function emptyAspectComposer(): SolarReturnAspectFormData {
  return { pointA: null, aspect: null, pointB: null };
}

export function emptyNatalContactComposer(): SolarReturnNatalAspectFormData {
  return { solarReturnPoint: null, aspect: null, natalPoint: null };
}

export function emptyAspectDraft(): SolarReturnAspectDraft {
  return { uiId: createUiId(), ...emptyAspectComposer() };
}

export function emptyNatalContactDraft(): SolarReturnNatalAspectDraft {
  return { uiId: createUiId(), ...emptyNatalContactComposer() };
}

export function isEmptySolarReturnAspect(
  input: SolarReturnAspectFormData,
): boolean {
  return input.pointA === null && input.aspect === null && input.pointB === null;
}

export function isEmptySolarReturnNatalContact(
  input: SolarReturnNatalAspectFormData,
): boolean {
  return (
    input.solarReturnPoint === null &&
    input.aspect === null &&
    input.natalPoint === null
  );
}

export function createEmptySolarReturnDraft(): SolarReturnDraft {
  return {
    periodStart: "",
    periodEnd: "",
    ascendantRuler: null,
    professionalNotes: "",
    ascendant: emptyAngle(),
    midheaven: emptyAngle(),
    positions: SOLAR_RETURN_BODIES.map((body) => ({
      point: body.id,
      sign: null,
      solarReturnHouse: null,
      natalOverlayHouse: null,
    })),
    aspects: [emptyAspectDraft()],
    natalContacts: [emptyNatalContactDraft()],
    elementSummary: {
      fire: 0,
      earth: 0,
      air: 0,
      water: 0,
    },
  };
}

export function solarReturnToDraft(input: SolarReturnInput): SolarReturnDraft {
  const positionsByPoint = new Map(
    input.positions.map((position) => [position.point, position]),
  );

  function angleFrom(point: "ascendant" | "midheaven"): SolarReturnAngleFormData {
    const stored = positionsByPoint.get(point);

    return {
      sign: stored?.sign ?? null,
      natalOverlayHouse: stored?.natalOverlayHouse ?? null,
    };
  }

  return {
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    ascendantRuler: input.ascendantRuler,
    professionalNotes: input.professionalNotes ?? "",
    ascendant: angleFrom("ascendant"),
    midheaven: angleFrom("midheaven"),
    positions: SOLAR_RETURN_BODIES.map((body) => {
      const stored = positionsByPoint.get(body.id);

      return {
        point: body.id,
        sign: stored?.sign ?? null,
        solarReturnHouse: stored?.solarReturnHouse ?? null,
        natalOverlayHouse: stored?.natalOverlayHouse ?? null,
      };
    }),
    aspects: withStarterRow(
      input.aspects.map((aspect) => ({
        ...aspect,
        uiId: createUiId(),
      })),
      emptyAspectDraft,
    ),
    natalContacts: withStarterRow(
      input.natalContacts.map((contact) => ({
        ...contact,
        uiId: createUiId(),
      })),
      emptyNatalContactDraft,
    ),
    elementSummary: { ...input.elementSummary },
  };
}

export function toSolarReturnFormData(
  draft: SolarReturnDraft,
): SolarReturnFormData {
  return {
    periodStart: draft.periodStart,
    periodEnd: draft.periodEnd,
    ascendantRuler: draft.ascendantRuler,
    professionalNotes: draft.professionalNotes,
    ascendant: { ...draft.ascendant },
    midheaven: { ...draft.midheaven },
    positions: draft.positions.map((position) => ({ ...position })),
    aspects: draft.aspects.map((aspect) => ({
      pointA: aspect.pointA,
      aspect: aspect.aspect,
      pointB: aspect.pointB,
    })),
    natalContacts: draft.natalContacts.map((contact) => ({
      solarReturnPoint: contact.solarReturnPoint,
      aspect: contact.aspect,
      natalPoint: contact.natalPoint,
    })),
    elementSummary: { ...draft.elementSummary },
  };
}

export function parseSolarReturnAspectInput(
  input: SolarReturnAspectFormData,
): SolarReturnCommitResult<SolarReturnAspect> {
  if (input.pointA === null || input.aspect === null || input.pointB === null) {
    return {
      success: false,
      error: "Completá los dos puntos y el aspecto.",
    };
  }

  if (
    !isSolarReturnPointId(input.pointA) ||
    !isAspectId(input.aspect) ||
    !isSolarReturnPointId(input.pointB)
  ) {
    return {
      success: false,
      error: "Hay un aspecto de Revolución Solar inválido.",
    };
  }

  if (input.pointA === input.pointB) {
    return {
      success: false,
      error: SELF_ASPECT_ERROR,
    };
  }

  return {
    success: true,
    item: {
      pointA: input.pointA,
      aspect: input.aspect,
      pointB: input.pointB,
    },
  };
}

export function parseSolarReturnNatalAspectInput(
  input: SolarReturnNatalAspectFormData,
): SolarReturnCommitResult<SolarReturnNatalAspect> {
  if (
    input.solarReturnPoint === null ||
    input.aspect === null ||
    input.natalPoint === null
  ) {
    return {
      success: false,
      error: "Completá el punto de Revolución Solar, el aspecto y el punto natal.",
    };
  }

  if (
    !isSolarReturnPointId(input.solarReturnPoint) ||
    !isAspectId(input.aspect) ||
    !isChartPointId(input.natalPoint)
  ) {
    return {
      success: false,
      error: "Hay un contacto con Carta Natal inválido.",
    };
  }

  return {
    success: true,
    item: {
      solarReturnPoint: input.solarReturnPoint,
      aspect: input.aspect,
      natalPoint: input.natalPoint,
    },
  };
}

export function commitSolarReturnAspect(
  existing: readonly SolarReturnAspect[],
  input: SolarReturnAspectFormData,
): SolarReturnCommitResult<SolarReturnAspect> {
  const parsed = parseSolarReturnAspectInput(input);

  if (!parsed.success) {
    return parsed;
  }

  if (
    existing.some(
      (aspect) => solarReturnAspectKey(aspect) === solarReturnAspectKey(parsed.item),
    )
  ) {
    return {
      success: false,
      error: DUPLICATE_SOLAR_RETURN_ASPECT_ERROR,
    };
  }

  return parsed;
}

export function commitSolarReturnNatalAspect(
  existing: readonly SolarReturnNatalAspect[],
  input: SolarReturnNatalAspectFormData,
): SolarReturnCommitResult<SolarReturnNatalAspect> {
  const parsed = parseSolarReturnNatalAspectInput(input);

  if (!parsed.success) {
    return parsed;
  }

  if (
    existing.some(
      (contact) =>
        solarReturnNatalAspectKey(contact) ===
        solarReturnNatalAspectKey(parsed.item),
    )
  ) {
    return {
      success: false,
      error: DUPLICATE_SOLAR_RETURN_NATAL_CONTACT_ERROR,
    };
  }

  return parsed;
}

function parseAnglePosition(input: {
  point: "ascendant" | "midheaven";
  angle: SolarReturnAngleFormData;
}): SolarReturnParseResult | { success: true; position: SolarReturnPosition } {
  if (input.angle.sign === null || input.angle.natalOverlayHouse === null) {
    return {
      success: false,
      error: "Completá signo y casa natal del Ascendente y del Medio Cielo.",
    };
  }

  if (
    !isZodiacSignId(input.angle.sign) ||
    !isHouseNumber(input.angle.natalOverlayHouse)
  ) {
    return {
      success: false,
      error: "Hay un ángulo de Revolución Solar inválido.",
    };
  }

  return {
    success: true,
    position: {
      point: input.point,
      sign: input.angle.sign,
      solarReturnHouse: null,
      natalOverlayHouse: input.angle.natalOverlayHouse,
    },
  };
}

function parseBodyPosition(
  input: SolarReturnPositionFormData,
): SolarReturnParseResult | { success: true; position: SolarReturnPosition } {
  if (
    input.sign === null ||
    input.solarReturnHouse === null ||
    input.natalOverlayHouse === null
  ) {
    return {
      success: false,
      error: "Completá signo, casa RS y casa natal de todos los planetas.",
    };
  }

  if (
    !isSolarReturnBodyId(input.point) ||
    !isZodiacSignId(input.sign) ||
    !isHouseNumber(input.solarReturnHouse) ||
    !isHouseNumber(input.natalOverlayHouse)
  ) {
    return {
      success: false,
      error: "Hay una posición de Revolución Solar inválida.",
    };
  }

  return {
    success: true,
    position: {
      point: input.point,
      sign: input.sign,
      solarReturnHouse: input.solarReturnHouse,
      natalOverlayHouse: input.natalOverlayHouse,
    },
  };
}

export function toSolarReturn(
  form: SolarReturnFormData,
): SolarReturnParseResult {
  const periodStart = form.periodStart.trim();
  const periodEnd = form.periodEnd.trim();

  if (!isIsoDateOnly(periodStart) || !isIsoDateOnly(periodEnd)) {
    return {
      success: false,
      error: "Indicá el período con fechas válidas.",
    };
  }

  if (!isValidSolarReturnPeriod({ periodStart, periodEnd })) {
    return {
      success: false,
      error: "La fecha de fin debe ser posterior a la de inicio.",
    };
  }

  if (form.ascendantRuler === null || !isRulerPlanetId(form.ascendantRuler)) {
    return {
      success: false,
      error: "Seleccioná el regente del Ascendente.",
    };
  }

  const ascendant = parseAnglePosition({
    point: "ascendant",
    angle: form.ascendant,
  });

  if (!("position" in ascendant)) {
    return ascendant;
  }

  const midheaven = parseAnglePosition({
    point: "midheaven",
    angle: form.midheaven,
  });

  if (!("position" in midheaven)) {
    return midheaven;
  }

  if (form.positions.length !== SOLAR_RETURN_BODY_IDS.length) {
    return {
      success: false,
      error: "Completá signo, casa RS y casa natal de todos los planetas.",
    };
  }

  const positions: SolarReturnPosition[] = [
    ascendant.position,
    midheaven.position,
  ];
  const seenPoints = new Set<string>([
    solarReturnPositionKey(ascendant.position),
    solarReturnPositionKey(midheaven.position),
  ]);

  for (const expectedBody of SOLAR_RETURN_BODY_IDS) {
    const entry = form.positions.find(
      (position) => position.point === expectedBody,
    );

    if (!entry) {
      return {
        success: false,
        error: "Completá signo, casa RS y casa natal de todos los planetas.",
      };
    }

    const parsed = parseBodyPosition(entry);

    if (!("position" in parsed)) {
      return parsed;
    }

    const key = solarReturnPositionKey(parsed.position);

    if (seenPoints.has(key)) {
      return {
        success: false,
        error: DUPLICATE_SOLAR_RETURN_POINT_ERROR,
      };
    }

    seenPoints.add(key);
    positions.push(parsed.position);
  }

  const aspects: SolarReturnAspect[] = [];
  const seenAspects = new Set<string>();

  for (const entry of form.aspects) {
    if (isEmptySolarReturnAspect(entry)) {
      continue;
    }

    const parsed = parseSolarReturnAspectInput(entry);

    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error === "Completá los dos puntos y el aspecto."
            ? "Completá o eliminá los aspectos incompletos."
            : parsed.error,
      };
    }

    const key = solarReturnAspectKey(parsed.item);

    if (seenAspects.has(key)) {
      return {
        success: false,
        error: DUPLICATE_SOLAR_RETURN_ASPECT_ERROR,
      };
    }

    seenAspects.add(key);
    aspects.push(parsed.item);
  }

  const natalContacts: SolarReturnNatalAspect[] = [];
  const seenContacts = new Set<string>();

  for (const entry of form.natalContacts) {
    if (isEmptySolarReturnNatalContact(entry)) {
      continue;
    }

    const parsed = parseSolarReturnNatalAspectInput(entry);

    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error ===
          "Completá el punto de Revolución Solar, el aspecto y el punto natal."
            ? "Completá o eliminá los contactos incompletos."
            : parsed.error,
      };
    }

    const key = solarReturnNatalAspectKey(parsed.item);

    if (seenContacts.has(key)) {
      return {
        success: false,
        error: DUPLICATE_SOLAR_RETURN_NATAL_CONTACT_ERROR,
      };
    }

    seenContacts.add(key);
    natalContacts.push(parsed.item);
  }

  const summary = form.elementSummary;

  if (
    !isNonNegativeInteger(summary.fire) ||
    !isNonNegativeInteger(summary.earth) ||
    !isNonNegativeInteger(summary.air) ||
    !isNonNegativeInteger(summary.water)
  ) {
    return {
      success: false,
      error: "La síntesis de elementos debe usar números enteros de 0 o más.",
    };
  }

  const notes = form.professionalNotes.trim();

  return {
    success: true,
    data: {
      periodStart,
      periodEnd,
      ascendantRuler: form.ascendantRuler,
      professionalNotes: notes.length > 0 ? notes : null,
      positions,
      aspects,
      natalContacts,
      elementSummary: {
        fire: summary.fire,
        earth: summary.earth,
        air: summary.air,
        water: summary.water,
      },
    },
  };
}

export function expectedSolarReturnBodyIds(): readonly SolarReturnBodyId[] {
  return SOLAR_RETURN_BODY_IDS;
}
