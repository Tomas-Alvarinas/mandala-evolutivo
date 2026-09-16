import assert from "node:assert/strict";
import { solarReturnReportSchema } from "@/lib/ai/solar-returns/schema";
import { SOLAR_RETURN_REPORT_SECTION_IDS } from "./constants";
import { applySolarReturnProfessionalEdits } from "./editorial";
import { createSampleSolarReturnReport } from "./sample";

function run() {
  const original = createSampleSolarReturnReport();
  const edited = structuredClone(original);
  edited.metadata = {
    ...edited.metadata,
    reportVersion: "9.9",
    methodologyVersion: "9.9",
    generatedAt: "2099-01-01T00:00:00.000Z",
    solarReturnId: "99999999-9999-4999-8999-999999999999",
    periodStart: "2099-01-01",
    periodEnd: "2100-01-01",
  };
  edited.annualTheme = {
    content: "Texto profesional editado.",
    astrologicalBasis: ["Evidencia inventada en Casa 99"],
  };
  edited.evolutionarySynthesis = {
    content: "Síntesis editada.",
    astrologicalBasis: ["Otro dato inventado"],
  };

  const next = applySolarReturnProfessionalEdits(original, edited);

  assert.deepEqual(next.metadata, original.metadata);
  assert.notDeepEqual(next.metadata, edited.metadata);
  assert.equal(next.annualTheme.content, "Texto profesional editado.");
  assert.equal(next.evolutionarySynthesis.content, "Síntesis editada.");
  assert.deepEqual(
    next.annualTheme.astrologicalBasis,
    original.annualTheme.astrologicalBasis,
  );
  assert.deepEqual(
    next.evolutionarySynthesis.astrologicalBasis,
    original.evolutionarySynthesis.astrologicalBasis,
  );
  assert.deepEqual(
    Object.keys(next).filter((key) => key !== "metadata"),
    [...SOLAR_RETURN_REPORT_SECTION_IDS],
  );

  for (const sectionId of SOLAR_RETURN_REPORT_SECTION_IDS) {
    assert.deepEqual(
      next[sectionId].astrologicalBasis,
      original[sectionId].astrologicalBasis,
    );
  }

  const emptied = structuredClone(original);
  emptied.annualTheme.content = "";
  const emptiedNext = applySolarReturnProfessionalEdits(original, emptied);
  assert.equal(emptiedNext.annualTheme.content, "");
  assert.equal(solarReturnReportSchema.safeParse(emptiedNext).success, false);
  assert.equal(solarReturnReportSchema.safeParse(next).success, true);
}

run();
console.log("solar return professional editorial tests ok");
