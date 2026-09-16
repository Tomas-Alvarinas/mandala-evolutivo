import {
  ASTROLOGICAL_BODIES,
  type NatalChart,
} from "@/lib/astrology";
import { GeminiEngineError } from "../gemini/errors";
import {
  EXPECTED_NATAL_POSITION_COUNT,
  buildNatalChartEvidence,
  formatAngleEvidence,
  formatAspectEvidence,
  formatConfigurationEvidence,
  formatHouseRulerEvidence,
  formatPositionEvidence,
  getAscendantRulerEvidence,
} from "./evidence";

export type NatalChartAnalysisInput = {
  firstName: string;
  lastName: string;
  age: number;
  natalChart: NatalChart;
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

export function assertNatalChartAnalysisInput(
  input: NatalChartAnalysisInput,
): void {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();

  if (!firstName || !lastName) {
    throw new GeminiEngineError(
      "invalid_input",
      "El consultante necesita nombre y apellido para generar el informe.",
    );
  }

  if (!Number.isInteger(input.age) || input.age < 0 || input.age > 120) {
    throw new GeminiEngineError(
      "invalid_input",
      "La edad del consultante no es válida para generar el informe.",
    );
  }

  const { natalChart } = input;

  if (natalChart.positions.length !== EXPECTED_NATAL_POSITION_COUNT) {
    throw new GeminiEngineError(
      "invalid_input",
      "La carta natal no tiene las 13 posiciones requeridas.",
    );
  }

  for (const body of ASTROLOGICAL_BODIES) {
    const position = natalChart.positions.find(
      (entry) => entry.point === body.id,
    );

    if (!position) {
      throw new GeminiEngineError(
        "invalid_input",
        "La carta natal no tiene las 13 posiciones requeridas.",
      );
    }
  }

  try {
    getAscendantRulerEvidence(natalChart);
  } catch {
    throw new GeminiEngineError(
      "invalid_input",
      "La carta natal no incluye la posición del regente del Ascendente.",
    );
  }
}

export function buildNatalChartContext(input: NatalChartAnalysisInput): string {
  assertNatalChartAnalysisInput(input);

  const { natalChart } = input;
  const ruler = getAscendantRulerEvidence(natalChart);
  const evidence = buildNatalChartEvidence(natalChart);
  const displayName = `${input.firstName.trim()} ${input.lastName.trim()}`;

  const positionLines = natalChart.positions.map(formatPositionEvidence);
  const aspectLines =
    natalChart.aspects.length > 0
      ? natalChart.aspects.map(formatAspectEvidence)
      : ["Ningún aspecto registrado."];
  const configurationLines =
    natalChart.configurations.length > 0
      ? natalChart.configurations.map(formatConfigurationEvidence)
      : ["Ninguna configuración registrada."];
  const houseRulers = natalChart.houseRulers ?? [];
  const houseRulerLines =
    houseRulers.length > 0
      ? [
          ...houseRulers.map(formatHouseRulerEvidence),
          "",
          "Cómo usar REGENTES: un planeta listado aquí es el regente cargado de esa casa, no un cálculo. Buscá el mismo planeta en CARTA NATAL para ver en qué casa natal está. Cruzá sus aspectos y configuraciones cargados cuando aporten. No deduzcas regentes ausentes. En astrologicalBasis copiá por separado las cadenas originales (regente, posición, aspecto, configuración); no inventes un string combinado.",
        ]
      : [
          "No se cargaron regentes.",
          "No inventes ni deduzcas regentes de casas a partir de signos, cúspides u otras posiciones.",
        ];

  const text = [
    "CONSULTANTE",
    "",
    `Nombre: ${displayName}`,
    `Edad: ${input.age}`,
    "",
    "CARTA NATAL",
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
    "ASPECTOS",
    "",
    ...aspectLines,
    "",
    "REGENTES",
    "",
    ...houseRulerLines,
    "",
    "CONFIGURACIONES",
    "",
    ...configurationLines,
    "",
    "EVIDENCIA PERMITIDA PARA astrologicalBasis",
    "",
    "Usá exclusivamente estas cadenas, copiadas de forma exacta:",
    "",
    ...evidence.map((item) => `- ${item}`),
  ].join("\n");

  assertNatalChartContextSafety(text, {
    positions: positionLines,
    rulerLabel: ruler.bodyLabel,
  });

  return text;
}

export function assertNatalChartContextSafety(
  text: string,
  expected: { positions: string[]; rulerLabel: string },
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

  if (!text.includes("Ascendente en") || !text.includes("Medio Cielo en")) {
    throw new GeminiEngineError(
      "invalid_input",
      "El contexto no contiene Ascendente y Medio Cielo.",
    );
  }

  if (!text.includes(`Regente del Ascendente: ${expected.rulerLabel}`)) {
    throw new GeminiEngineError(
      "invalid_input",
      "El contexto no contiene el regente del Ascendente.",
    );
  }

  if (!text.includes("ASPECTOS") || !text.includes("CONFIGURACIONES")) {
    throw new GeminiEngineError(
      "invalid_input",
      "El contexto no contiene aspectos y configuraciones.",
    );
  }

  if (!text.includes("REGENTES")) {
    throw new GeminiEngineError(
      "invalid_input",
      "El contexto no contiene regentes.",
    );
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
