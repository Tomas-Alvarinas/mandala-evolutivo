import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { GeminiNatalChartReport } from "./schema";
import { createProfessionalPdfSampleReport } from "@/lib/reports/natal-chart/professional-pdf/sample";
import { createEvidenceWhitelist } from "./evidence";
import { validateAstrologicalBasis } from "./validate";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

function toGeminiReport(
  report: ReturnType<typeof createProfessionalPdfSampleReport>,
): GeminiNatalChartReport {
  const { metadata, ...rest } = report;
  void metadata;
  return rest;
}

function run() {
  const report = toGeminiReport(createProfessionalPdfSampleReport());
  const allowed = createEvidenceWhitelist([
    "Sol en Leo en casa 5",
    "Luna en Cáncer en casa 4",
  ]);

  const valid = validateAstrologicalBasis(report, allowed);
  assert.equal(valid.ok, true);

  const invented = validateAstrologicalBasis(
    {
      ...report,
      identity: {
        ...report.identity,
        astrologicalBasis: ["Quirón en Casa 99"],
      },
    },
    allowed,
  );
  assert.equal(invented.ok, false);
  if (invented.ok) {
    throw new Error("expected invented evidence to be rejected");
  }
  assert.equal(invented.invented.length, 1);
  assert.equal(invented.invented[0]?.section, "identity");
  assert.equal(invented.invented[0]?.value, "Quirón en Casa 99");

  const natalMarkerVariant = validateAstrologicalBasis(
    {
      ...report,
      identity: {
        ...report.identity,
        astrologicalBasis: ["Sol natal en Leo en casa 5"],
      },
    },
    allowed,
  );
  assert.equal(natalMarkerVariant.ok, false);

  const validateSource = readFileSync(path.join(DIRNAME, "validate.ts"), "utf8");
  assert.equal(validateSource.includes("canonicalizeTransitEvidence"), false);
  assert.ok(validateSource.includes("allowedEvidence.has(normalized)"));
}

run();
console.log("astrological basis whitelist tests ok");
