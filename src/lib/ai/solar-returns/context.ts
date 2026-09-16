import { type NatalChart } from "@/lib/astrology";
import { GeminiEngineError } from "../gemini/errors";
import {
  assertNatalChartAnalysisInput,
  type NatalChartAnalysisInput,
} from "../natal-chart/context";
import {
  EXPECTED_NATAL_POSITION_COUNT,
  formatAngleEvidence,
  formatAspectEvidence,
  formatConfigurationEvidence,
  formatHouseRulerEvidence,
  formatPositionEvidence,
  getAscendantRulerEvidence,
} from "../natal-chart/evidence";
import {
  SOLAR_RETURN_POINT_IDS,
  formatSolarReturnPeriod,
  isSolarReturnAngleId,
  isValidSolarReturnPeriod,
  type SolarReturn,
} from "@/lib/solar-returns";
import {
  EXPECTED_SOLAR_RETURN_POSITION_COUNT,
  buildSolarReturnEvidence,
  formatSolarReturnAscendantRulerEvidence,
  formatSolarReturnAspectEvidence,
  formatSolarReturnElementEvidence,
  formatSolarReturnNatalContactEvidence,
  formatSolarReturnPositionEvidence,
  getSolarReturnAscendant,
  getSolarReturnMidheaven,
  getSolarReturnRulerLabel,
  getSolarReturnRulerPosition,
} from "./evidence";

export type SolarReturnEngineInput = {
  firstName: string;
  lastName: string;
  age: number;
  natalChart: NatalChart;
  solarReturn: SolarReturn;
};

const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

const FORBIDDEN_CONTEXT_TERMS = [
  "professionalnotes",
  "professional_notes",
  "notas profesionales",
  "user_id",
  "client_id",
  "supabase",
] as const;

export function assertSolarReturnEngineInput(
  input: SolarReturnEngineInput,
): void {
  assertNatalChartAnalysisInput({
    firstName: input.firstName,
    lastName: input.lastName,
    age: input.age,
    natalChart: input.natalChart,
  } satisfies NatalChartAnalysisInput);

  const { solarReturn } = input;

  if (
    !isValidSolarReturnPeriod({
      periodStart: solarReturn.periodStart,
      periodEnd: solarReturn.periodEnd,
    })
  ) {
    throw new GeminiEngineError(
      "invalid_input",
      "La Revolución Solar no tiene un período válido.",
    );
  }

  if (
    solarReturn.positions.length !== EXPECTED_SOLAR_RETURN_POSITION_COUNT
  ) {
    throw new GeminiEngineError(
      "invalid_input",
      "La Revolución Solar no tiene las 13 posiciones requeridas.",
    );
  }

  for (const point of SOLAR_RETURN_POINT_IDS) {
    const position = solarReturn.positions.find((entry) => entry.point === point);

    if (!position) {
      throw new GeminiEngineError(
        "invalid_input",
        "La Revolución Solar no tiene las 13 posiciones requeridas.",
      );
    }

    if (isSolarReturnAngleId(point) && position.solarReturnHouse !== null) {
      throw new GeminiEngineError(
        "invalid_input",
        "La Revolución Solar no tiene ángulos válidos.",
      );
    }

    if (!isSolarReturnAngleId(point) && position.solarReturnHouse === null) {
      throw new GeminiEngineError(
        "invalid_input",
        "La Revolución Solar no tiene las 13 posiciones requeridas.",
      );
    }
  }

  if (!getSolarReturnAscendant(solarReturn)) {
    throw new GeminiEngineError(
      "invalid_input",
      "La Revolución Solar no tiene Ascendente.",
    );
  }

  if (!getSolarReturnMidheaven(solarReturn)) {
    throw new GeminiEngineError(
      "invalid_input",
      "La Revolución Solar no tiene Medio Cielo.",
    );
  }

  if (!getSolarReturnRulerPosition(solarReturn)) {
    throw new GeminiEngineError(
      "invalid_input",
      "La Revolución Solar no tiene el regente del Ascendente.",
    );
  }

  const { fire, earth, air, water } = solarReturn.elementSummary;

  if (
    !Number.isInteger(fire) ||
    fire < 0 ||
    !Number.isInteger(earth) ||
    earth < 0 ||
    !Number.isInteger(air) ||
    air < 0 ||
    !Number.isInteger(water) ||
    water < 0
  ) {
    throw new GeminiEngineError(
      "invalid_input",
      "La Revolución Solar no tiene una síntesis de elementos válida.",
    );
  }
}

export function buildSolarReturnContext(input: SolarReturnEngineInput): string {
  assertSolarReturnEngineInput(input);

  const { natalChart, solarReturn } = input;
  const natalRuler = getAscendantRulerEvidence(natalChart);
  const evidence = buildSolarReturnEvidence({
    natalChart,
    solarReturn,
  });
  const displayName = `${input.firstName.trim()} ${input.lastName.trim()}`;
  const periodLabel = formatSolarReturnPeriod(solarReturn);
  const ascendant = getSolarReturnAscendant(solarReturn);
  const midheaven = getSolarReturnMidheaven(solarReturn);
  const rulerPosition = getSolarReturnRulerPosition(solarReturn);
  const rulerLabel = getSolarReturnRulerLabel(solarReturn);

  if (!ascendant || !midheaven || !rulerPosition) {
    throw new GeminiEngineError(
      "invalid_input",
      "La Revolución Solar no tiene Ascendente, Medio Cielo o regente.",
    );
  }

  const positionLines = natalChart.positions.map(formatPositionEvidence);
  const natalAspectLines =
    natalChart.aspects.length > 0
      ? natalChart.aspects.map(formatAspectEvidence)
      : ["Ningún aspecto natal registrado."];
  const configurationLines =
    natalChart.configurations.length > 0
      ? natalChart.configurations.map(formatConfigurationEvidence)
      : ["Ninguna configuración registrada."];
  const houseRulers = natalChart.houseRulers ?? [];
  const houseRulerLines =
    houseRulers.length > 0
      ? houseRulers.map(formatHouseRulerEvidence)
      : [
          "No se cargaron regentes.",
          "No inventes ni deduzcas regentes de casas.",
        ];
  const solarReturnPositionLines = solarReturn.positions.map(
    formatSolarReturnPositionEvidence,
  );
  const internalAspectLines =
    solarReturn.aspects.length > 0
      ? solarReturn.aspects.map(formatSolarReturnAspectEvidence)
      : ["Ningún aspecto interno RS registrado."];
  const natalContactLines =
    solarReturn.natalContacts.length > 0
      ? solarReturn.natalContacts.map(formatSolarReturnNatalContactEvidence)
      : ["Ningún contacto RS ↔ Natal registrado."];

  const text = [
    "CONSULTANTE",
    "",
    `Nombre: ${displayName}`,
    `Edad: ${input.age}`,
    "",
    "PERÍODO",
    "",
    "De un cumpleaños al cumpleaños siguiente. No interpretar como carta aislada.",
    periodLabel,
    "",
    "CARTA NATAL",
    "",
    "Matriz de referencia persistida. No redescribir toda la personalidad. Interpretar el año sobre esta estructura.",
    "",
    "POSICIONES NATALES",
    "",
    ...positionLines,
    "",
    "ÁNGULOS NATALES",
    "",
    formatAngleEvidence("ascendant", natalChart.ascendant),
    `Regente del Ascendente natal: ${natalRuler.bodyLabel}`,
    `Posición del regente natal: ${formatPositionEvidence(natalRuler.position)}`,
    formatAngleEvidence("midheaven", natalChart.midheaven),
    "",
    "ASPECTOS NATALES",
    "",
    ...natalAspectLines,
    "",
    "REGENTES NATALES",
    "",
    ...houseRulerLines,
    "",
    "CONFIGURACIONES NATALES",
    "",
    ...configurationLines,
    "",
    "REVOLUCIÓN SOLAR",
    "",
    "POSICIONES RS",
    "",
    ...solarReturnPositionLines,
    "",
    "ASCENDENTE RS",
    "",
    formatSolarReturnPositionEvidence(ascendant),
    "",
    "REGENTE ASCENDENTE RS",
    "",
    formatSolarReturnAscendantRulerEvidence(rulerLabel),
    formatSolarReturnPositionEvidence(rulerPosition),
    "",
    "MEDIO CIELO RS",
    "",
    formatSolarReturnPositionEvidence(midheaven),
    "",
    "SUPERPOSICIONES RS → NATAL",
    "",
    "Casa RS y casa natal de superposición son datos distintos. No confundirlas.",
    ...solarReturnPositionLines,
    "",
    "ASPECTOS INTERNOS RS",
    "",
    ...internalAspectLines,
    "",
    "CONTACTOS RS ↔ NATAL",
    "",
    ...natalContactLines,
    "",
    "SÍNTESIS DE ELEMENTOS",
    "",
    "Usar únicamente estos conteos cargados. No recalcular.",
    formatSolarReturnElementEvidence("fire", solarReturn.elementSummary.fire),
    formatSolarReturnElementEvidence("earth", solarReturn.elementSummary.earth),
    formatSolarReturnElementEvidence("air", solarReturn.elementSummary.air),
    formatSolarReturnElementEvidence("water", solarReturn.elementSummary.water),
    "",
    "EVIDENCIA PERMITIDA PARA astrologicalBasis",
    "",
    "Usá exclusivamente estas cadenas, copiadas de forma exacta:",
    "",
    ...evidence.map((item) => `- ${item}`),
  ].join("\n");

  assertSolarReturnContextSafety(text, {
    natalPositions: positionLines,
    natalRulerLabel: natalRuler.bodyLabel,
    solarReturnPositions: solarReturnPositionLines,
    internalAspects: solarReturn.aspects.map(formatSolarReturnAspectEvidence),
    natalContacts: solarReturn.natalContacts.map(
      formatSolarReturnNatalContactEvidence,
    ),
    rulerEvidence: formatSolarReturnAscendantRulerEvidence(rulerLabel),
  });

  return text;
}

export function assertSolarReturnContextSafety(
  text: string,
  expected: {
    natalPositions: string[];
    natalRulerLabel: string;
    solarReturnPositions: string[];
    internalAspects: string[];
    natalContacts: string[];
    rulerEvidence: string;
  },
): void {
  if (expected.natalPositions.length !== EXPECTED_NATAL_POSITION_COUNT) {
    throw new GeminiEngineError(
      "invalid_input",
      "El contexto no contiene exactamente 13 posiciones natales.",
    );
  }

  if (
    expected.solarReturnPositions.length !== EXPECTED_SOLAR_RETURN_POSITION_COUNT
  ) {
    throw new GeminiEngineError(
      "invalid_input",
      "El contexto no contiene exactamente 13 posiciones de Revolución Solar.",
    );
  }

  for (const position of expected.natalPositions) {
    if (!text.includes(position)) {
      throw new GeminiEngineError(
        "invalid_input",
        "El contexto no contiene las 13 posiciones de la carta natal.",
      );
    }
  }

  for (const position of expected.solarReturnPositions) {
    if (!text.includes(position)) {
      throw new GeminiEngineError(
        "invalid_input",
        "El contexto no contiene todas las posiciones de Revolución Solar.",
      );
    }
  }

  if (!text.includes(`Regente del Ascendente natal: ${expected.natalRulerLabel}`)) {
    throw new GeminiEngineError(
      "invalid_input",
      "El contexto no contiene el regente natal del Ascendente.",
    );
  }

  if (!text.includes(expected.rulerEvidence)) {
    throw new GeminiEngineError(
      "invalid_input",
      "El contexto no contiene el regente del Ascendente RS.",
    );
  }

  for (const heading of [
    "CONSULTANTE",
    "PERÍODO",
    "CARTA NATAL",
    "POSICIONES NATALES",
    "ÁNGULOS NATALES",
    "ASPECTOS NATALES",
    "REGENTES NATALES",
    "CONFIGURACIONES NATALES",
    "REVOLUCIÓN SOLAR",
    "POSICIONES RS",
    "ASCENDENTE RS",
    "REGENTE ASCENDENTE RS",
    "MEDIO CIELO RS",
    "SUPERPOSICIONES RS → NATAL",
    "ASPECTOS INTERNOS RS",
    "CONTACTOS RS ↔ NATAL",
    "SÍNTESIS DE ELEMENTOS",
    "EVIDENCIA PERMITIDA PARA astrologicalBasis",
  ]) {
    if (!text.includes(heading)) {
      throw new GeminiEngineError(
        "invalid_input",
        `El contexto no contiene ${heading}.`,
      );
    }
  }

  for (const line of expected.internalAspects) {
    if (!text.includes(line)) {
      throw new GeminiEngineError(
        "invalid_input",
        "El contexto no contiene todos los aspectos internos RS cargados.",
      );
    }
  }

  for (const line of expected.natalContacts) {
    if (!text.includes(line)) {
      throw new GeminiEngineError(
        "invalid_input",
        "El contexto no contiene todos los contactos RS ↔ Natal cargados.",
      );
    }
  }

  if (UUID_PATTERN.test(text)) {
    throw new GeminiEngineError(
      "invalid_input",
      "El contexto no debe incluir identificadores internos.",
    );
  }

  const normalized = text.toLowerCase();

  for (const term of FORBIDDEN_CONTEXT_TERMS) {
    if (normalized.includes(term)) {
      throw new GeminiEngineError(
        "invalid_input",
        "El contexto no debe incluir notas profesionales ni datos internos.",
      );
    }
  }
}
