import assert from "node:assert/strict";
import {
  TRANSIT_ANALYSIS_REPORT_SECTION_IDS,
  TRANSIT_ANALYSIS_REPORT_SECTION_LABELS,
} from "@/lib/reports";
import {
  geminiTransitAnalysisReportSchema,
  getTransitAnalysisGeminiJsonSchema,
} from "./schema";

const FORBIDDEN_KEYS = ["$ref", "$defs", "definitions", "allOf"];

function collectKeys(value: unknown, found: Set<string>) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectKeys(item, found);
    }
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    found.add(key);
    collectKeys(child, found);
  }
}

function run() {
  assert.deepEqual([...TRANSIT_ANALYSIS_REPORT_SECTION_IDS], [
    "mandalaImpact",
    "activatedAreas",
    "evolutionaryChallenges",
    "availableResources",
    "opportunities",
    "learnings",
  ]);
  assert.equal(
    TRANSIT_ANALYSIS_REPORT_SECTION_LABELS.mandalaImpact,
    "Cómo impacta en el Mandala Evolutivo",
  );
  assert.equal(
    TRANSIT_ANALYSIS_REPORT_SECTION_LABELS.activatedAreas,
    "Áreas activadas de la Carta Natal",
  );
  assert.equal(
    TRANSIT_ANALYSIS_REPORT_SECTION_LABELS.evolutionaryChallenges,
    "Desafíos evolutivos",
  );
  assert.equal(
    TRANSIT_ANALYSIS_REPORT_SECTION_LABELS.availableResources,
    "Recursos disponibles",
  );
  assert.equal(
    TRANSIT_ANALYSIS_REPORT_SECTION_LABELS.opportunities,
    "Oportunidades",
  );
  assert.equal(
    TRANSIT_ANALYSIS_REPORT_SECTION_LABELS.learnings,
    "Aprendizajes",
  );

  assert.deepEqual(Object.keys(geminiTransitAnalysisReportSchema.shape), [
    ...TRANSIT_ANALYSIS_REPORT_SECTION_IDS,
  ]);
  assert.equal(
    "metadata" in geminiTransitAnalysisReportSchema.shape,
    false,
  );

  const schema = getTransitAnalysisGeminiJsonSchema();
  const keys = new Set<string>();
  collectKeys(schema, keys);

  for (const forbidden of FORBIDDEN_KEYS) {
    assert.equal(keys.has(forbidden), false, `schema contains ${forbidden}`);
  }

  assert.equal(schema.type, "object");
  const properties = schema.properties as Record<string, unknown>;
  assert.deepEqual(Object.keys(properties), [
    ...TRANSIT_ANALYSIS_REPORT_SECTION_IDS,
  ]);
  assert.deepEqual(schema.propertyOrdering, [
    ...TRANSIT_ANALYSIS_REPORT_SECTION_IDS,
  ]);

  const parsed = geminiTransitAnalysisReportSchema.safeParse({
    mandalaImpact: {
      content: "Puede activar el Mandala.",
      astrologicalBasis: ["Júpiter en tránsito en Leo por Casa 5"],
    },
    activatedAreas: {
      content: "Casa 5 puede cobrar protagonismo.",
      astrologicalBasis: ["Júpiter en tránsito en Leo por Casa 5"],
    },
    evolutionaryChallenges: {
      content: "Puede intensificar una tensión natal.",
      astrologicalBasis: ["Júpiter en tránsito cuadratura Venus natal"],
    },
    availableResources: {
      content: "Hay recursos natales disponibles.",
      astrologicalBasis: ["Marte natal en Casa 1"],
    },
    opportunities: {
      content: "Podría abrir una oportunidad de expresión.",
      astrologicalBasis: ["Júpiter en tránsito en Leo por Casa 5"],
    },
    learnings: {
      content: "Puede invitar a revisar un eje.",
      astrologicalBasis: ["Eclipse solar: Leo Casa 1 ↔ Acuario Casa 7"],
    },
    metadata: {
      reportVersion: "should-be-stripped",
    },
  });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal("metadata" in parsed.data, false);
  }
}

run();
console.log("transit analysis schema tests ok");
