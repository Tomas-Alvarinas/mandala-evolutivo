import type {
  NatalChartReport,
  ReportSection,
} from "@/lib/reports/natal-chart/types";
import { createPdfLayoutSampleReport } from "@/lib/reports/natal-chart/client-report/pdf-sample-report";
import type { NatalChartClientSection } from "@/lib/reports/natal-chart/client-report/types";

function section(content: string, basis: string[]): ReportSection {
  return { content, astrologicalBasis: basis };
}

const LAYOUT_BASIS = [
  "Sol en Géminis — Casa 1",
  "Luna en Libra — Casa 4",
  "Saturno en Cáncer — Casa 1",
];

export function createProfessionalPdfSampleReport(): NatalChartReport {
  const basis = ["Sol en Leo en casa 5", "Luna en Cáncer en casa 4"];

  return {
    metadata: {
      version: "1.1",
      generatedAt: "2026-08-28T12:00:00.000Z",
    },
    evolutionaryMandalaSummary: section(
      "Síntesis de prueba con auto\u00ADcustodia.",
      basis,
    ),
    identity: section("Identidad de prueba.", basis),
    emotionalWorld: section("Mundo emocional de prueba.", basis),
    potential: section("Potencial de prueba.", basis),
    evolutionaryChallenges: section("Desafíos de prueba.", basis),
    shadowPatterns: section("Sombra de prueba.", basis),
    systemicAndAstrogenealogicalReading: section(
      "Mirada sistémica de prueba.",
      basis,
    ),
    innerDialogue: section("Diálogo interno de prueba.", basis),
    relationships: section("Vínculos de prueba.", basis),
    security: section("Seguridad de prueba.", basis),
    moneyAndResources: section("Recursos de prueba.", basis),
    workAndVocation: section("Vocación de prueba.", basis),
    bodyWellbeingAndHabits: section("Hábitos de prueba.", basis),
    evolutionaryPurpose: section("Propósito de prueba.", basis),
    nervousSystemRegulation: section("Regulación de prueba.", basis),
    survivalMode: section("Supervivencia de prueba.", basis),
    creativeMode: section("Modo creativo de prueba.", basis),
    beliefsToExplore: ["Si no anticipo, algo se rompe."],
    byronKatieQuestions: ["¿Es realmente cierto?"],
    identityReprogramming: section("Reprogramación de prueba.", basis),
    dispenzaInspiredWork: section("Práctica de prueba.", basis),
    practicalActions: ["Elegí una pausa cotidiana."],
    empoweringWords: ["Presencia", "Ritmo"],
    symbolsAndColors: {
      symbols: [
        {
          symbol: "Círculo",
          meaning: "Un centro que no se disuelve.",
        },
      ],
      colors: [
        {
          color: "Tierra cálida",
          intention: "Volver al cuerpo.",
        },
      ],
    },
    mandalaIntervention: {
      intention: "Crear un espacio de presencia.",
      assignment: "Trabajá sobre un círculo amplio.",
      suggestedElements: ["Un centro contenido."],
      processQuestions: ["¿Dónde estoy desapareciendo?"],
    },
    finalSynthesis: section("Síntesis final de prueba.", basis),
  };
}

export function createProfessionalPdfLayoutSampleReport(): NatalChartReport {
  const client = createPdfLayoutSampleReport();
  const byId = new Map(
    client.sections.map((item) => [item.sourceSectionId, item]),
  );

  return {
    metadata: {
      version: "1.1",
      generatedAt: "2026-08-28T12:00:00.000Z",
    },
    evolutionaryMandalaSummary: narrativeFrom(byId, "evolutionaryMandalaSummary"),
    identity: narrativeFrom(byId, "identity"),
    emotionalWorld: narrativeFrom(byId, "emotionalWorld"),
    potential: narrativeFrom(byId, "potential"),
    evolutionaryChallenges: narrativeFrom(byId, "evolutionaryChallenges"),
    shadowPatterns: narrativeFrom(byId, "shadowPatterns"),
    systemicAndAstrogenealogicalReading: narrativeFrom(
      byId,
      "systemicAndAstrogenealogicalReading",
    ),
    innerDialogue: narrativeFrom(byId, "innerDialogue"),
    relationships: narrativeFrom(byId, "relationships"),
    security: narrativeFrom(byId, "security"),
    moneyAndResources: narrativeFrom(byId, "moneyAndResources"),
    workAndVocation: narrativeFrom(byId, "workAndVocation"),
    bodyWellbeingAndHabits: narrativeFrom(byId, "bodyWellbeingAndHabits"),
    evolutionaryPurpose: narrativeFrom(byId, "evolutionaryPurpose"),
    nervousSystemRegulation: narrativeFrom(byId, "nervousSystemRegulation"),
    survivalMode: narrativeFrom(byId, "survivalMode"),
    creativeMode: narrativeFrom(byId, "creativeMode"),
    beliefsToExplore: listFrom(byId, "beliefsToExplore"),
    byronKatieQuestions: listFrom(byId, "byronKatieQuestions"),
    identityReprogramming: narrativeFrom(byId, "identityReprogramming"),
    dispenzaInspiredWork: narrativeFrom(byId, "dispenzaInspiredWork"),
    practicalActions: listFrom(byId, "practicalActions"),
    empoweringWords: listFrom(byId, "empoweringWords"),
    symbolsAndColors: symbolsFrom(byId.get("symbolsAndColors")),
    mandalaIntervention: mandalaFrom(byId.get("mandalaIntervention")),
    finalSynthesis: narrativeFrom(byId, "finalSynthesis"),
  };
}

function narrativeFrom(
  byId: Map<string, NatalChartClientSection>,
  sectionId: string,
): ReportSection {
  const found = byId.get(sectionId);

  if (!found || found.kind !== "narrative") {
    throw new Error(`Missing narrative sample section: ${sectionId}`);
  }

  return section(found.content, LAYOUT_BASIS);
}

function listFrom(
  byId: Map<string, NatalChartClientSection>,
  sectionId: string,
): string[] {
  const found = byId.get(sectionId);

  if (!found || found.kind !== "list") {
    throw new Error(`Missing list sample section: ${sectionId}`);
  }

  return found.items;
}

function symbolsFrom(found: NatalChartClientSection | undefined) {
  if (!found || found.kind !== "symbolsAndColors") {
    throw new Error("Missing symbols sample section");
  }

  return {
    symbols: found.symbols,
    colors: found.colors,
  };
}

function mandalaFrom(found: NatalChartClientSection | undefined) {
  if (!found || found.kind !== "mandala") {
    throw new Error("Missing mandala sample section");
  }

  return {
    intention: found.intention,
    assignment: found.assignment,
    suggestedElements: found.elements,
    processQuestions: found.questions,
  };
}
