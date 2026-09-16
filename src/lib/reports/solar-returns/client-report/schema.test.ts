import assert from "node:assert/strict";
import { SOLAR_RETURN_REPORT_SECTION_IDS } from "../constants";
import { createSampleSolarReturnReport } from "../sample";
import { toSolarReturnClientReport } from "./from-professional";
import { solarReturnClientReportSchema } from "./schema";

function run() {
  const professional = createSampleSolarReturnReport();
  const built = toSolarReturnClientReport(professional);
  const parsed = solarReturnClientReportSchema.safeParse(built);

  assert.equal(parsed.success, true);
  assert.deepEqual(Object.keys(built), [...SOLAR_RETURN_REPORT_SECTION_IDS]);
  assert.equal(SOLAR_RETURN_REPORT_SECTION_IDS.length, 12);

  for (const sectionId of SOLAR_RETURN_REPORT_SECTION_IDS) {
    assert.deepEqual(Object.keys(built[sectionId]), ["content"]);
    assert.equal(typeof built[sectionId].content, "string");
    assert.equal(built[sectionId].content.length > 0, true);
    assert.equal("astrologicalBasis" in built[sectionId], false);
  }

  assert.equal("metadata" in built, false);
  assert.equal("generatedAt" in built, false);
  assert.equal(JSON.stringify(built).includes("astrologicalBasis"), false);

  const emptyContent = {
    ...built,
    annualTheme: { content: "" },
  };
  assert.equal(solarReturnClientReportSchema.safeParse(emptyContent).success, false);

  const extraSection = {
    ...built,
    extraSection: { content: "no corresponde" },
  };
  assert.equal(solarReturnClientReportSchema.safeParse(extraSection).success, false);

  const extraField = {
    ...built,
    annualTheme: { content: built.annualTheme.content, astrologicalBasis: ["x"] },
  };
  assert.equal(solarReturnClientReportSchema.safeParse(extraField).success, false);
}

run();
console.log("solar return client report contract tests ok");
