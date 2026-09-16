import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GeminiEngineError } from "../gemini/errors";
import { assembleSolarReturnReportFromModelOutput } from "./assemble";
import {
  SOLAR_RETURN_REPORT_SECTION_IDS,
  type SolarReturnReportSectionId,
} from "@/lib/reports";
import type { GeminiSolarReturnReport } from "./schema";
import { createSampleSolarReturnEngineInput } from "./sample";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

function section(
  basis: string[],
): GeminiSolarReturnReport[SolarReturnReportSectionId] {
  return {
    content: "Puede ser un año de proceso.",
    astrologicalBasis: basis,
  };
}

function createGeminiReport(basis: string[]): GeminiSolarReturnReport {
  return Object.fromEntries(
    SOLAR_RETURN_REPORT_SECTION_IDS.map((sectionId) => [
      sectionId,
      section(basis),
    ]),
  ) as GeminiSolarReturnReport;
}

function run() {
  const engineInput = createSampleSolarReturnEngineInput();
  const validBasis = [
    "Venus RS en Capricornio — Casa RS 10 — Casa natal 2",
  ];
  const generatedAt = "2026-09-07T20:00:00.000Z";

  const assembled = assembleSolarReturnReportFromModelOutput({
    rawText: JSON.stringify(createGeminiReport(validBasis)),
    engineInput,
    generatedAt,
  });
  assert.equal(assembled.metadata.reportVersion, "1.0");
  assert.equal(assembled.metadata.methodologyVersion, "1.0");
  assert.equal(assembled.metadata.generatedAt, generatedAt);
  assert.equal(assembled.metadata.solarReturnId, engineInput.solarReturn.id);
  assert.deepEqual(Object.keys(assembled).filter((key) => key !== "metadata"), [
    ...SOLAR_RETURN_REPORT_SECTION_IDS,
  ]);

  assert.throws(
    () =>
      assembleSolarReturnReportFromModelOutput({
        rawText: "not-json",
        engineInput,
      }),
    (error: unknown) =>
      error instanceof GeminiEngineError && error.code === "invalid_json",
  );

  assert.throws(
    () =>
      assembleSolarReturnReportFromModelOutput({
        rawText: JSON.stringify({ annualTheme: "no" }),
        engineInput,
      }),
    (error: unknown) =>
      error instanceof GeminiEngineError && error.code === "invalid_schema",
  );

  assert.throws(
    () =>
      assembleSolarReturnReportFromModelOutput({
        rawText: JSON.stringify(
          createGeminiReport(["Venus RS en Acuario — Casa RS 10 — Casa natal 2"]),
        ),
        engineInput,
      }),
    (error: unknown) =>
      error instanceof GeminiEngineError && error.code === "invented_evidence",
  );

  const generateSource = readFileSync(path.join(DIRNAME, "generate.ts"), "utf8");
  assert.equal(generateSource.includes("createSolarReturnReport"), false);
  assert.equal(generateSource.includes("saveNatalChartReport"), false);
  assert.equal(generateSource.includes("saveTransitAnalysisReport"), false);
  assert.equal(generateSource.includes("revalidatePath"), false);
  assert.ok(generateSource.includes("assembleSolarReturnReportFromModelOutput"));
  assert.ok(generateSource.includes("createGeminiClient"));
  assert.ok(generateSource.includes("store: false"));
  assert.ok(generateSource.includes("GEMINI_NATAL_CHART_MODEL"));
}

run();
console.log("solar return generation tests ok");
