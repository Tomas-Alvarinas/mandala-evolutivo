import assert from "node:assert/strict";
import { createSampleSolarReturnReport } from "../sample";
import { isSolarReturnClientReportSourceOutdated } from "./source-outdated";
import { toSolarReturnClientReport } from "./from-professional";

function run() {
  const professional = createSampleSolarReturnReport();
  const sourceReport = structuredClone(professional);

  assert.equal(
    isSolarReturnClientReportSourceOutdated(sourceReport, professional),
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
    isSolarReturnClientReportSourceOutdated(sourceReport, editedProfessional),
    true,
  );

  const reordered = {
    metadata: professional.metadata,
    evolutionarySynthesis: professional.evolutionarySynthesis,
    learnings: professional.learnings,
    opportunities: professional.opportunities,
    evolutionaryChallenges: professional.evolutionaryChallenges,
    lifeAreas: professional.lifeAreas,
    energyConcentration: professional.energyConcentration,
    personalPlanets: professional.personalPlanets,
    emotionalWorld: professional.emotionalWorld,
    sunDirection: professional.sunDirection,
    ascendantRuler: professional.ascendantRuler,
    solarAscendant: professional.solarAscendant,
    annualTheme: professional.annualTheme,
  };

  assert.equal(
    isSolarReturnClientReportSourceOutdated(sourceReport, reordered),
    false,
  );
  assert.notEqual(JSON.stringify(sourceReport), JSON.stringify(reordered));

  const generatedOnlyChange = {
    ...professional,
    generatedReportWouldNotMatter: true,
  };
  assert.equal(
    isSolarReturnClientReportSourceOutdated(sourceReport, professional),
    false,
  );
  assert.notEqual(
    JSON.stringify(generatedOnlyChange),
    JSON.stringify(professional),
  );

  const clientReport = toSolarReturnClientReport(professional);
  clientReport.learnings.content = "Paula editó solo la versión consultante.";
  assert.equal(
    isSolarReturnClientReportSourceOutdated(sourceReport, professional),
    false,
  );
}

run();
console.log("solar return client report sourceOutdated tests ok");
