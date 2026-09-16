import assert from "node:assert/strict";
import { TRANSIT_ANALYSIS_REPORT_SECTION_IDS } from "./constants";
import { applyTransitAnalysisProfessionalEdits } from "./editorial";
import { createSampleTransitAnalysisReport } from "./sample";

function run() {
  const original = createSampleTransitAnalysisReport();
  const edited = structuredClone(original);
  edited.metadata = {
    ...edited.metadata,
    reportVersion: "9.9",
    methodologyVersion: "9.9",
    generatedAt: "2099-01-01T00:00:00.000Z",
    analysisDate: "2099-01-01",
  };
  edited.mandalaImpact = {
    content: "Texto profesional editado.",
    astrologicalBasis: ["Evidencia inventada en Casa 99"],
  };
  edited.learnings = {
    content: "Aprendizaje editado.",
    astrologicalBasis: ["Otro dato inventado"],
  };

  const next = applyTransitAnalysisProfessionalEdits(original, edited);

  assert.deepEqual(next.metadata, original.metadata);
  assert.notDeepEqual(next.metadata, edited.metadata);
  assert.equal(next.mandalaImpact.content, "Texto profesional editado.");
  assert.equal(next.learnings.content, "Aprendizaje editado.");
  assert.deepEqual(
    next.mandalaImpact.astrologicalBasis,
    original.mandalaImpact.astrologicalBasis,
  );
  assert.deepEqual(
    next.learnings.astrologicalBasis,
    original.learnings.astrologicalBasis,
  );

  for (const sectionId of TRANSIT_ANALYSIS_REPORT_SECTION_IDS) {
    assert.deepEqual(
      next[sectionId].astrologicalBasis,
      original[sectionId].astrologicalBasis,
    );
  }
}

run();
console.log("transit professional editorial tests ok");
