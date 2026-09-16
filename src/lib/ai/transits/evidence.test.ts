import assert from "node:assert/strict";
import {
  buildEclipseHouseNatalEvidence,
  buildTransitAnalysisEvidence,
  createEvidenceWhitelist,
  formatNatalBodyInHouseEvidence,
  formatTransitAspectEvidence,
  formatTransitEclipseEvidence,
  formatTransitPositionEvidence,
} from "./evidence";
import { createSampleTransitEngineInput } from "./sample";

const DEGREE_OR_ORB = /\d+\s*°|\borbe\b|\borb\b/i;

function run() {
  const input = createSampleTransitEngineInput();
  const evidence = buildTransitAnalysisEvidence({
    natalChart: input.natalChart,
    transitAnalysis: input.transitAnalysis,
  });
  const allowed = createEvidenceWhitelist(evidence);

  assert.equal(
    formatTransitPositionEvidence(input.transitAnalysis.positions[0]!),
    "Júpiter en tránsito en Leo por Casa 5",
  );
  assert.equal(
    formatTransitAspectEvidence(input.transitAnalysis.aspects[0]!),
    "Júpiter en tránsito cuadratura Venus natal",
  );
  assert.equal(
    formatTransitEclipseEvidence(input.transitAnalysis.eclipses[0]!),
    "Eclipse solar: Leo Casa 1 ↔ Acuario Casa 7",
  );

  assert.equal(allowed.has("Júpiter en tránsito en Leo por Casa 5"), true);
  assert.equal(allowed.has("Saturno en tránsito en Piscis por Casa 12"), true);
  assert.equal(allowed.has("Júpiter en tránsito cuadratura Venus natal"), true);
  assert.equal(
    allowed.has("Eclipse solar: Leo Casa 1 ↔ Acuario Casa 7"),
    true,
  );
  assert.equal(allowed.has("Marte natal en Casa 1"), true);
  assert.equal(allowed.has("Marte en Aries — Casa 1"), true);
  assert.equal(allowed.has("Nodo Norte natal en Casa 7"), true);
  assert.equal(allowed.has("Sol en Leo — Casa 5"), true);
  assert.equal(allowed.has("Nodo Sur en Aries — Casa 1"), true);
  assert.equal(allowed.has("Nodo Sur natal en Virgo — Casa 12"), false);
  assert.equal(allowed.has("Nodo Sur en Virgo — Casa 12"), false);
  assert.equal(allowed.has("Ascendente en Aries"), true);
  assert.equal(allowed.has("Regente de Casa 5: Sol en Leo"), true);

  assert.equal(allowed.has("Júpiter en tránsito en Leo en casa 5"), false);
  assert.equal(allowed.has("Júpiter · Leo · Casa 5"), false);
  assert.equal(
    allowed.has("Júpiter en tránsito en Leo por Casa 5 a 12°"),
    false,
  );
  assert.equal(allowed.has("orbe 2°"), false);

  const eclipseHouseNatal = buildEclipseHouseNatalEvidence(
    input.natalChart,
    input.transitAnalysis,
  );
  assert.ok(
    eclipseHouseNatal.includes(formatNatalBodyInHouseEvidence("Marte", 1)),
  );
  assert.ok(
    eclipseHouseNatal.includes(formatNatalBodyInHouseEvidence("Nodo Norte", 7)),
  );

  for (const item of evidence) {
    assert.equal(DEGREE_OR_ORB.test(item), false, `unexpected degree/orb: ${item}`);
  }
}

run();
console.log("transit analysis evidence tests ok");
