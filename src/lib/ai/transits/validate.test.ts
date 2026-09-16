import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  TRANSIT_ANALYSIS_REPORT_SECTION_IDS,
  type TransitAnalysisReportSectionId,
} from "@/lib/reports";
import type { GeminiTransitAnalysisReport } from "./schema";
import {
  buildTransitAnalysisEvidence,
  createEvidenceWhitelist,
} from "./evidence";
import { createSampleTransitEngineInput } from "./sample";
import { validateTransitAstrologicalBasis } from "./validate";

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

  const valid = validateTransitAstrologicalBasis(
    createReport(validBasis),
    allowed,
  );
  assert.equal(valid.ok, true);
  assert.deepEqual(Object.keys(createReport(validBasis)), [
    ...TRANSIT_ANALYSIS_REPORT_SECTION_IDS,
  ]);

  const invented = validateTransitAstrologicalBasis(
    {
      ...createReport(validBasis),
      opportunities: section(["Júpiter te dará un trabajo nuevo"]),
    },
    allowed,
  );
  assert.equal(invented.ok, false);
  if (invented.ok) {
    throw new Error("expected invented evidence to be rejected");
  }
  assert.equal(invented.invented[0]?.section, "opportunities");
  assert.equal(
    invented.invented[0]?.value,
    "Júpiter te dará un trabajo nuevo",
  );

  const withDegree = validateTransitAstrologicalBasis(
    {
      ...createReport(validBasis),
      learnings: section(["Júpiter en tránsito en Leo por Casa 5 a 12°"]),
    },
    allowed,
  );
  assert.equal(withDegree.ok, false);

  const withOrb = validateTransitAstrologicalBasis(
    {
      ...createReport(validBasis),
      activatedAreas: section(["Júpiter cuadratura Venus natal orbe 2°"]),
    },
    allowed,
  );
  assert.equal(withOrb.ok, false);

  const stillExact = validateTransitAstrologicalBasis(
    createReport(["Júpiter en tránsito en Leo por Casa 5"]),
    allowed,
  );
  assert.equal(stillExact.ok, true);
  assert.equal(
    allowed.has("Júpiter en Leo transitando la Casa 5"),
    false,
  );

  const productionAllowed = createEvidenceWhitelist([
    ...evidence,
    "Nodo Sur en Virgo — Casa 12",
  ]);

  const natalMarker = validateTransitAstrologicalBasis(
    {
      ...createReport(["Júpiter en tránsito en Leo por Casa 5"]),
      evolutionaryChallenges: section([
        "Nodo Sur natal en Virgo — Casa 12",
      ]),
      learnings: section(["Nodo Sur natal en Virgo — Casa 12"]),
    },
    productionAllowed,
  );
  assert.equal(natalMarker.ok, true);
  if (!natalMarker.ok) {
    throw new Error("expected natal-marker variant to canonicalize");
  }
  assert.deepEqual(
    natalMarker.report.evolutionaryChallenges.astrologicalBasis,
    ["Nodo Sur en Virgo — Casa 12"],
  );
  assert.deepEqual(natalMarker.report.learnings.astrologicalBasis, [
    "Nodo Sur en Virgo — Casa 12",
  ]);

  const signChange = validateTransitAstrologicalBasis(
    {
      ...createReport(["Júpiter en tránsito en Leo por Casa 5"]),
      learnings: section(["Nodo Sur natal en Libra — Casa 12"]),
    },
    productionAllowed,
  );
  assert.equal(signChange.ok, false);

  const houseChange = validateTransitAstrologicalBasis(
    {
      ...createReport(["Júpiter en tránsito en Leo por Casa 5"]),
      learnings: section(["Nodo Sur natal en Virgo — Casa 11"]),
    },
    productionAllowed,
  );
  assert.equal(houseChange.ok, false);

  const unchargedAspect = validateTransitAstrologicalBasis(
    {
      ...createReport(["Júpiter en tránsito en Leo por Casa 5"]),
      learnings: section(["Nodo Sur oposición Venus"]),
    },
    productionAllowed,
  );
  assert.equal(unchargedAspect.ok, false);

  const commentary = validateTransitAstrologicalBasis(
    {
      ...createReport(["Júpiter en tránsito en Leo por Casa 5"]),
      learnings: section([
        "Nodo Sur natal en Virgo — Casa 12, activando trauma ancestral",
      ]),
    },
    productionAllowed,
  );
  assert.equal(commentary.ok, false);

  const sharedAcrossSections = validateTransitAstrologicalBasis(
    {
      ...createReport(["Júpiter en tránsito en Leo por Casa 5"]),
      evolutionaryChallenges: section(["Nodo Sur en Virgo — Casa 12"]),
      learnings: section(["Nodo Sur en Virgo — Casa 12"]),
    },
    productionAllowed,
  );
  assert.equal(sharedAcrossSections.ok, true);

  const inSectionDuplicate = validateTransitAstrologicalBasis(
    {
      ...createReport(["Júpiter en tránsito en Leo por Casa 5"]),
      evolutionaryChallenges: section([
        "Nodo Sur natal en Virgo — Casa 12",
        "Nodo Sur en Virgo — Casa 12",
      ]),
      learnings: section(["Nodo Sur en Virgo — Casa 12"]),
    },
    productionAllowed,
  );
  assert.equal(inSectionDuplicate.ok, true);
  if (!inSectionDuplicate.ok) {
    throw new Error("expected in-section duplicate to be deduped, not rejected");
  }
  assert.deepEqual(
    inSectionDuplicate.report.evolutionaryChallenges.astrologicalBasis,
    ["Nodo Sur en Virgo — Casa 12"],
  );
  assert.deepEqual(inSectionDuplicate.report.learnings.astrologicalBasis, [
    "Nodo Sur en Virgo — Casa 12",
  ]);

  const natalValidateSource = readFileSync(
    path.join(DIRNAME, "../natal-chart/validate.ts"),
    "utf8",
  );
  assert.equal(
    natalValidateSource.includes("canonicalizeTransitEvidence"),
    false,
  );
  assert.ok(natalValidateSource.includes("allowedEvidence.has(normalized)"));

  const evidenceSource = readFileSync(path.join(DIRNAME, "evidence.ts"), "utf8");
  assert.ok(
    evidenceSource.includes(
      "en ${getSignLabel(position.sign)} por Casa ${position.natalHouse}",
    ),
  );
}

run();
console.log("transit analysis evidence validation tests ok");
