import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildTransitAnalysisEvidence,
  createEvidenceWhitelist,
} from "./evidence";
import {
  diagnoseRejectedTransitEvidence,
  hasUnexpectedFormat,
} from "./evidence-diagnostics";
import { createSampleTransitEngineInput } from "./sample";
import { validateTransitAstrologicalBasis } from "./validate";
import type { GeminiTransitAnalysisReport } from "./schema";
import type { TransitAnalysisReportSectionId } from "@/lib/reports";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

function section(
  basis: string[],
): GeminiTransitAnalysisReport[TransitAnalysisReportSectionId] {
  return {
    content: "Puede ser un período en el que se active una polaridad natal.",
    astrologicalBasis: basis,
  };
}

function createReport(
  basis: string[],
): GeminiTransitAnalysisReport {
  return {
    mandalaImpact: section(basis),
    activatedAreas: section(basis),
    evolutionaryChallenges: section(basis),
    availableResources: section(basis),
    opportunities: section(basis),
    learnings: section(basis),
  };
}

function run() {
  const input = createSampleTransitEngineInput();
  const evidence = buildTransitAnalysisEvidence({
    natalChart: input.natalChart,
    transitAnalysis: input.transitAnalysis,
  });
  const allowed = createEvidenceWhitelist(evidence);
  const validBasis = [
    "Júpiter en tránsito en Leo por Casa 5",
    "Júpiter en tránsito cuadratura Venus natal",
    "Eclipse solar: Leo Casa 1 ↔ Acuario Casa 7",
    "Marte natal en Casa 1",
  ];

  const paraphrased = "Júpiter en Leo transitando la Casa 5";
  const combined =
    "Júpiter en tránsito en Leo por Casa 5 cuadratura Venus natal";
  const inventedEvent = "Nibiru conjunción Lilith";
  const withDegree = "Júpiter en tránsito en Leo por Casa 5 a 12°";

  const validation = validateTransitAstrologicalBasis(
    {
      ...createReport(validBasis),
      activatedAreas: section([paraphrased, paraphrased]),
      opportunities: section([combined]),
      learnings: section([inventedEvent, withDegree]),
    },
    allowed,
  );
  assert.equal(validation.ok, false);
  if (validation.ok) {
    throw new Error("expected invented evidence to stay rejected");
  }

  const diagnostics = diagnoseRejectedTransitEvidence({
    invented: validation.invented,
    allowedEvidence: allowed,
  });

  const paraphrase = diagnostics.find((item) => item.received === paraphrased);
  assert.ok(paraphrase);
  assert.equal(paraphrase.section, "activatedAreas");
  assert.deepEqual(paraphrase.reasons, ["no_exact_match", "unexpected_format"]);
  assert.equal(paraphrase.classification, "format_mismatch");
  assert.equal(
    paraphrase.closestAllowed[0],
    "Júpiter en tránsito en Leo por Casa 5",
  );

  const duplicate = diagnostics.filter((item) => item.received === paraphrased);
  assert.equal(duplicate.length, 2);
  assert.ok(duplicate[1]?.reasons.includes("invalid_duplicate"));

  const crossSectionRejected = diagnoseRejectedTransitEvidence({
    invented: [
      { section: "evolutionaryChallenges", value: inventedEvent },
      { section: "learnings", value: inventedEvent },
    ],
    allowedEvidence: allowed,
  });
  assert.equal(crossSectionRejected.length, 2);
  assert.equal(
    crossSectionRejected.every(
      (item) => item.reasons.includes("invalid_duplicate") === false,
    ),
    true,
  );

  const inference = diagnostics.find((item) => item.received === combined);
  assert.ok(inference);
  assert.equal(inference.classification, "unsupported_inference");
  assert.ok(inference.reasons.includes("no_exact_match"));
  assert.equal(inference.reasons.includes("unexpected_format"), false);

  const unknown = diagnostics.find((item) => item.received === inventedEvent);
  assert.ok(unknown);
  assert.equal(unknown.classification, "unknown_reference");
  assert.deepEqual(unknown.closestAllowed, []);

  const degree = diagnostics.find((item) => item.received === withDegree);
  assert.ok(degree);
  assert.ok(degree.reasons.includes("unexpected_format"));
  assert.equal(hasUnexpectedFormat(paraphrased), true);
  assert.equal(hasUnexpectedFormat("Júpiter en tránsito en Leo por Casa 5"), false);

  assert.equal(allowed.has(paraphrased), false);
  assert.equal(allowed.has("Júpiter en tránsito en Leo por Casa 5"), true);

  const generateSource = readFileSync(path.join(DIRNAME, "generate.ts"), "utf8");
  const validateIndex = generateSource.indexOf(
    "validateTransitAstrologicalBasis(",
  );
  const logIndex = generateSource.indexOf("logRejectedTransitEvidence(");
  const throwIndex = generateSource.indexOf('"invented_evidence"');
  assert.ok(validateIndex >= 0);
  assert.ok(logIndex > validateIndex);
  assert.ok(throwIndex > logIndex);

  const inventedBlock = generateSource.slice(logIndex, throwIndex + 120);
  assert.equal(inventedBlock.includes("retry"), false);

  const validateSource = readFileSync(path.join(DIRNAME, "validate.ts"), "utf8");
  assert.ok(validateSource.includes("canonicalizeTransitEvidence"));
  assert.equal(validateSource.includes("diagnoseRejectedTransitEvidence"), false);
}

run();
console.log("transit evidence diagnostics tests ok");
