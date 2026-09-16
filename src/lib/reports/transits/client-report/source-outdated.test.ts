import assert from "node:assert/strict";
import { createSampleTransitAnalysisReport } from "../sample";
import { isTransitClientReportSourceOutdated } from "./source-outdated";
import { toTransitClientReport } from "./from-professional";

function run() {
  const professional = createSampleTransitAnalysisReport();
  const sourceReport = structuredClone(professional);

  assert.equal(
    isTransitClientReportSourceOutdated(sourceReport, professional),
    false,
  );

  const editedProfessional = {
    ...professional,
    learnings: {
      ...professional.learnings,
      content: "Paula editó el informe profesional después.",
    },
  };

  assert.equal(
    isTransitClientReportSourceOutdated(sourceReport, editedProfessional),
    true,
  );

  const generatedOnlyChange = {
    ...professional,
    generatedReportWouldNotMatter: true,
  };
  assert.equal(
    isTransitClientReportSourceOutdated(sourceReport, professional),
    false,
  );
  assert.notEqual(
    JSON.stringify(generatedOnlyChange),
    JSON.stringify(professional),
  );

  const clientReport = toTransitClientReport(professional);
  clientReport.learnings.content = "Paula editó solo la versión consultante.";
  assert.equal(
    isTransitClientReportSourceOutdated(sourceReport, professional),
    false,
  );
}

run();
console.log("transit client report sourceOutdated tests ok");
