import {
  getAstrologicalBodyLabel,
  getHouseLabel,
  type NatalChart,
} from "@/lib/astrology";
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
  formatIsoDateOnlyEs,
  type TransitAnalysis,
} from "@/lib/transits";
import {
  buildTransitAnalysisEvidence,
  formatTransitAspectEvidence,
  formatTransitEclipseEvidence,
  formatTransitPositionEvidence,
  getNatalPositionsInHouse,
} from "./evidence";

export type TransitAnalysisEngineInput = {
  firstName: string;
  lastName: string;
  age: number;
  natalChart: NatalChart;
  transitAnalysis: TransitAnalysis;
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

export function assertTransitAnalysisEngineInput(
  input: TransitAnalysisEngineInput,
): void {
  assertNatalChartAnalysisInput({
    firstName: input.firstName,
    lastName: input.lastName,
    age: input.age,
    natalChart: input.natalChart,
  } satisfies NatalChartAnalysisInput);

  const { transitAnalysis } = input;

  if (
    transitAnalysis.positions.length === 0 &&
    transitAnalysis.aspects.length === 0 &&
    transitAnalysis.eclipses.length === 0
  ) {
    throw new GeminiEngineError(
      "invalid_input",
      "El análisis de tránsitos no tiene eventos astrológicos cargados.",
    );
  }
}

export function buildTransitAnalysisContext(
  input: TransitAnalysisEngineInput,
): string {
  assertTransitAnalysisEngineInput(input);

  const { natalChart, transitAnalysis } = input;
  const ruler = getAscendantRulerEvidence(natalChart);
  const evidence = buildTransitAnalysisEvidence({
    natalChart,
    transitAnalysis,
  });
  const displayName = `${input.firstName.trim()} ${input.lastName.trim()}`;
  const dateLabel =
    formatIsoDateOnlyEs(transitAnalysis.analysisDate) ||
    transitAnalysis.analysisDate;

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
  const transitPositionLines =
    transitAnalysis.positions.length > 0
      ? transitAnalysis.positions.map(formatTransitPositionEvidence)
      : ["Ningún tránsito por casa registrado."];
  const transitAspectLines =
    transitAnalysis.aspects.length > 0
      ? transitAnalysis.aspects.map(formatTransitAspectEvidence)
      : ["Ningún aspecto de tránsito registrado."];
  const eclipseLines = buildEclipseContextLines(natalChart, transitAnalysis);

  const text = [
    "CONSULTANTE",
    "",
    `Nombre: ${displayName}`,
    `Edad: ${input.age}`,
    "",
    "FECHA DEL ANÁLISIS",
    "",
    dateLabel,
    "",
    "MANDALA NATAL",
    "",
    "Estructura persistida. No redescribir toda la personalidad. Interpretar qué partes se activan ahora.",
    "",
    "POSICIONES NATALES",
    "",
    ...positionLines,
    "",
    "ÁNGULOS",
    "",
    formatAngleEvidence("ascendant", natalChart.ascendant),
    `Regente del Ascendente: ${ruler.bodyLabel}`,
    `Posición del regente: ${formatPositionEvidence(ruler.position)}`,
    formatAngleEvidence("midheaven", natalChart.midheaven),
    "",
    "ASPECTOS NATALES",
    "",
    ...natalAspectLines,
    "",
    "REGENTES",
    "",
    ...houseRulerLines,
    "",
    "CONFIGURACIONES",
    "",
    ...configurationLines,
    "",
    "TRÁNSITOS ACTUALES",
    "",
    ...transitPositionLines,
    "",
    "ASPECTOS DE TRÁNSITO",
    "",
    ...transitAspectLines,
    "",
    "ECLIPSES",
    "",
    ...eclipseLines,
    "",
    "EVIDENCIA PERMITIDA PARA astrologicalBasis",
    "",
    "Usá exclusivamente estas cadenas, copiadas de forma exacta:",
    "",
    ...evidence.map((item) => `- ${item}`),
  ].join("\n");

  assertTransitAnalysisContextSafety(text, {
    positions: positionLines,
    rulerLabel: ruler.bodyLabel,
    transitPositions: transitAnalysis.positions.map(formatTransitPositionEvidence),
    transitAspects: transitAnalysis.aspects.map(formatTransitAspectEvidence),
    eclipses: transitAnalysis.eclipses.map(formatTransitEclipseEvidence),
  });

  return text;
}

function buildEclipseContextLines(
  natalChart: NatalChart,
  transitAnalysis: TransitAnalysis,
): string[] {
  if (transitAnalysis.eclipses.length === 0) {
    return ["Ningún eclipse registrado."];
  }

  const lines: string[] = [];

  for (const eclipse of transitAnalysis.eclipses) {
    lines.push(formatTransitEclipseEvidence(eclipse));

    for (const house of [eclipse.natalHouseA, eclipse.natalHouseB]) {
      const occupants = getNatalPositionsInHouse(natalChart, house);

      if (occupants.length === 0) {
        lines.push(
          `Ningún planeta natal cargado en ${getHouseLabel(house)}.`,
        );
        continue;
      }

      lines.push(
        `Planetas natales en ${getHouseLabel(house)}: ${occupants
          .map(
            (position) =>
              `${getAstrologicalBodyLabel(position.point)} natal en Casa ${house}`,
          )
          .join("; ")}`,
      );
    }
  }

  return lines;
}

export function assertTransitAnalysisContextSafety(
  text: string,
  expected: {
    positions: string[];
    rulerLabel: string;
    transitPositions: string[];
    transitAspects: string[];
    eclipses: string[];
  },
): void {
  if (expected.positions.length !== EXPECTED_NATAL_POSITION_COUNT) {
    throw new GeminiEngineError(
      "invalid_input",
      "El contexto no contiene exactamente 13 posiciones.",
    );
  }

  for (const position of expected.positions) {
    if (!text.includes(position)) {
      throw new GeminiEngineError(
        "invalid_input",
        "El contexto no contiene las 13 posiciones de la carta.",
      );
    }
  }

  if (!text.includes(`Regente del Ascendente: ${expected.rulerLabel}`)) {
    throw new GeminiEngineError(
      "invalid_input",
      "El contexto no contiene el regente del Ascendente.",
    );
  }

  if (!text.includes("CONSULTANTE") || !text.includes("MANDALA NATAL")) {
    throw new GeminiEngineError(
      "invalid_input",
      "El contexto no contiene consultante y Mandala Natal.",
    );
  }

  if (!text.includes("POSICIONES NATALES") || !text.includes("ÁNGULOS")) {
    throw new GeminiEngineError(
      "invalid_input",
      "El contexto no contiene posiciones natales y ángulos.",
    );
  }

  if (!text.includes("ASPECTOS NATALES") || !text.includes("REGENTES")) {
    throw new GeminiEngineError(
      "invalid_input",
      "El contexto no contiene aspectos natales y regentes.",
    );
  }

  if (!text.includes("CONFIGURACIONES")) {
    throw new GeminiEngineError(
      "invalid_input",
      "El contexto no contiene configuraciones.",
    );
  }

  if (!text.includes("TRÁNSITOS ACTUALES") || !text.includes("ASPECTOS DE TRÁNSITO")) {
    throw new GeminiEngineError(
      "invalid_input",
      "El contexto no contiene tránsitos y aspectos de tránsito.",
    );
  }

  if (!text.includes("ECLIPSES") || !text.includes("FECHA DEL ANÁLISIS")) {
    throw new GeminiEngineError(
      "invalid_input",
      "El contexto no contiene eclipses y fecha del análisis.",
    );
  }

  for (const line of expected.transitPositions) {
    if (!text.includes(line)) {
      throw new GeminiEngineError(
        "invalid_input",
        "El contexto no contiene todos los tránsitos cargados.",
      );
    }
  }

  for (const line of expected.transitAspects) {
    if (!text.includes(line)) {
      throw new GeminiEngineError(
        "invalid_input",
        "El contexto no contiene todos los aspectos de tránsito cargados.",
      );
    }
  }

  for (const line of expected.eclipses) {
    if (!text.includes(line)) {
      throw new GeminiEngineError(
        "invalid_input",
        "El contexto no contiene todos los eclipses cargados.",
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
