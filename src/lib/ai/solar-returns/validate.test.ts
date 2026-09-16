import assert from "node:assert/strict";
import {
  SOLAR_RETURN_REPORT_SECTION_IDS,
  type SolarReturnReportSectionId,
} from "@/lib/reports";
import type { GeminiSolarReturnReport } from "./schema";
import {
  buildSolarReturnEvidence,
  createEvidenceWhitelist,
} from "./evidence";
import { createSampleSolarReturnEngineInput } from "./sample";
import { validateSolarReturnAstrologicalBasis } from "./validate";

function section(
  basis: string[],
): GeminiSolarReturnReport[SolarReturnReportSectionId] {
  return {
    content: "Puede ser un año en el que se active una zona natal.",
    astrologicalBasis: basis,
  };
}

function createReport(basis: string[]): GeminiSolarReturnReport {
  return Object.fromEntries(
    SOLAR_RETURN_REPORT_SECTION_IDS.map((sectionId) => [
      sectionId,
      section(basis),
    ]),
  ) as GeminiSolarReturnReport;
}

function run() {
  const input = createSampleSolarReturnEngineInput();
  const evidence = buildSolarReturnEvidence({
    natalChart: input.natalChart,
    solarReturn: input.solarReturn,
  });
  const allowed = createEvidenceWhitelist(evidence);
  const validBasis = [
    "Venus RS en Capricornio — Casa RS 10 — Casa natal 2",
    "Ascendente RS en Tauro — Casa natal 6",
    "Regente del Ascendente RS: Venus",
    "Venus RS conjunción Marte RS",
    "Venus RS conjunción Saturno natal",
    "Sol RS trígono Nodo Norte natal",
    "Fuego: 2",
  ];

  const valid = validateSolarReturnAstrologicalBasis(
    createReport(validBasis),
    allowed,
  );
  assert.equal(valid.ok, true);
  assert.deepEqual(Object.keys(createReport(validBasis)), [
    ...SOLAR_RETURN_REPORT_SECTION_IDS,
  ]);

  const exact = validateSolarReturnAstrologicalBasis(
    createReport(["Venus RS en Capricornio — Casa RS 10 — Casa natal 2"]),
    allowed,
  );
  assert.equal(exact.ok, true);

  const invented = validateSolarReturnAstrologicalBasis(
    {
      ...createReport(validBasis),
      opportunities: section(["Venus te dará un trabajo nuevo"]),
    },
    allowed,
  );
  assert.equal(invented.ok, false);

  const alteredSign = validateSolarReturnAstrologicalBasis(
    createReport(["Venus RS en Acuario — Casa RS 10 — Casa natal 2"]),
    allowed,
  );
  assert.equal(alteredSign.ok, false);

  const alteredHouse = validateSolarReturnAstrologicalBasis(
    createReport(["Venus RS en Capricornio — Casa RS 9 — Casa natal 2"]),
    allowed,
  );
  assert.equal(alteredHouse.ok, false);

  const alteredOverlay = validateSolarReturnAstrologicalBasis(
    createReport(["Venus RS en Capricornio — Casa RS 10 — Casa natal 3"]),
    allowed,
  );
  assert.equal(alteredOverlay.ok, false);

  const alteredPlanet = validateSolarReturnAstrologicalBasis(
    createReport(["Marte RS en Capricornio — Casa RS 10 — Casa natal 2"]),
    allowed,
  );
  assert.equal(alteredPlanet.ok, false);

  const alteredAspect = validateSolarReturnAstrologicalBasis(
    createReport(["Venus RS oposición Saturno natal"]),
    allowed,
  );
  assert.equal(alteredAspect.ok, false);

  const withDegree = validateSolarReturnAstrologicalBasis(
    createReport([
      "Venus RS en Capricornio — Casa RS 10 — Casa natal 2 a 12°",
    ]),
    allowed,
  );
  assert.equal(withDegree.ok, false);

  const withOrb = validateSolarReturnAstrologicalBasis(
    createReport(["Venus RS conjunción Saturno natal orbe 2°"]),
    allowed,
  );
  assert.equal(withOrb.ok, false);

  const unknown = validateSolarReturnAstrologicalBasis(
    createReport(["Stellium inventado en Casa 10"]),
    allowed,
  );
  assert.equal(unknown.ok, false);

  const nodeOnRsSide = validateSolarReturnAstrologicalBasis(
    createReport(["Nodo Norte RS trígono Sol natal"]),
    allowed,
  );
  assert.equal(nodeOnRsSide.ok, false);

  const combined = validateSolarReturnAstrologicalBasis(
    createReport([
      "Venus RS en Capricornio — Casa RS 10 — Casa natal 2 y conjunción Marte RS",
    ]),
    allowed,
  );
  assert.equal(combined.ok, false);

  const natalMarkerDoesNotRescue = validateSolarReturnAstrologicalBasis(
    createReport(["Sol natal en Leo — Casa 5"]),
    allowed,
  );
  assert.equal(natalMarkerDoesNotRescue.ok, false);
  assert.equal(allowed.has("Sol en Leo — Casa 5"), true);
}

run();
console.log("solar return evidence validation tests ok");
