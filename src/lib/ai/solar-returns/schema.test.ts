import assert from "node:assert/strict";
import {
  SOLAR_RETURN_REPORT_SECTION_IDS,
  SOLAR_RETURN_REPORT_SECTION_LABELS,
} from "@/lib/reports";
import {
  geminiSolarReturnReportSchema,
  getSolarReturnGeminiJsonSchema,
  parseSolarReturnGeminiOutput,
} from "./schema";
import { GeminiEngineError } from "../gemini/errors";

const FORBIDDEN_KEYS = ["$ref", "$defs", "definitions", "allOf"];
const SECTION_IDS = [
  "annualTheme",
  "solarAscendant",
  "ascendantRuler",
  "sunDirection",
  "emotionalWorld",
  "personalPlanets",
  "energyConcentration",
  "lifeAreas",
  "evolutionaryChallenges",
  "opportunities",
  "learnings",
  "evolutionarySynthesis",
] as const;

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

function section() {
  return {
    content: "Puede ser un año de proceso.",
    astrologicalBasis: ["Venus RS en Capricornio — Casa RS 10 — Casa natal 2"],
  };
}

function createGeminiPayload() {
  return Object.fromEntries(SECTION_IDS.map((id) => [id, section()]));
}

function run() {
  assert.deepEqual([...SOLAR_RETURN_REPORT_SECTION_IDS], [...SECTION_IDS]);
  assert.equal(
    SOLAR_RETURN_REPORT_SECTION_LABELS.annualTheme,
    "Tema central del año",
  );
  assert.equal(
    SOLAR_RETURN_REPORT_SECTION_LABELS.evolutionarySynthesis,
    "Síntesis evolutiva del año",
  );

  assert.deepEqual(Object.keys(geminiSolarReturnReportSchema.shape), [
    ...SOLAR_RETURN_REPORT_SECTION_IDS,
  ]);
  assert.equal("metadata" in geminiSolarReturnReportSchema.shape, false);

  const schema = getSolarReturnGeminiJsonSchema();
  const keys = new Set<string>();
  collectKeys(schema, keys);

  for (const forbidden of FORBIDDEN_KEYS) {
    assert.equal(keys.has(forbidden), false, `schema contains ${forbidden}`);
  }

  assert.equal(schema.type, "object");
  const properties = schema.properties as Record<string, unknown>;
  assert.deepEqual(Object.keys(properties), [...SOLAR_RETURN_REPORT_SECTION_IDS]);
  assert.deepEqual(schema.propertyOrdering, [...SOLAR_RETURN_REPORT_SECTION_IDS]);

  const parsed = geminiSolarReturnReportSchema.safeParse({
    ...createGeminiPayload(),
    extraSection: section(),
    metadata: { reportVersion: "should-be-stripped" },
  });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal("metadata" in parsed.data, false);
    assert.equal("extraSection" in parsed.data, false);
  }

  const missingContent = geminiSolarReturnReportSchema.safeParse({
    ...createGeminiPayload(),
    annualTheme: { content: "", astrologicalBasis: ["Venus RS"] },
  });
  assert.equal(missingContent.success, false);

  const missingBasis = geminiSolarReturnReportSchema.safeParse({
    ...createGeminiPayload(),
    annualTheme: { content: "Texto", astrologicalBasis: [] },
  });
  assert.equal(missingBasis.success, false);

  assert.throws(
    () => parseSolarReturnGeminiOutput("not-json"),
    (error: unknown) =>
      error instanceof GeminiEngineError && error.code === "invalid_json",
  );
  assert.throws(
    () => parseSolarReturnGeminiOutput(JSON.stringify({ annualTheme: "no" })),
    (error: unknown) =>
      error instanceof GeminiEngineError && error.code === "invalid_schema",
  );
}

run();
console.log("solar return schema tests ok");
