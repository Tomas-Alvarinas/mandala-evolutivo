import assert from "node:assert/strict";
import { createEvidenceWhitelist } from "./evidence";
import {
  canonicalizeTransitEvidence,
  isNatalPositionEvidenceFormat,
} from "./evidence-normalize";
import { createSampleTransitEngineInput } from "./sample";
import { buildTransitAnalysisEvidence } from "./evidence";

function run() {
  const productionCase = createEvidenceWhitelist([
    "Nodo Sur en Virgo — Casa 12",
    "Venus en Libra — Casa 4",
    "Marte natal en Casa 1",
  ]);

  assert.equal(
    canonicalizeTransitEvidence(
      "Nodo Sur natal en Virgo — Casa 12",
      productionCase,
    ),
    "Nodo Sur en Virgo — Casa 12",
  );

  assert.equal(
    canonicalizeTransitEvidence("Venus natal en Libra — Casa 4", productionCase),
    "Venus en Libra — Casa 4",
  );
  assert.equal(
    canonicalizeTransitEvidence("Venus natal en Tauro — Casa 2", productionCase),
    null,
  );

  assert.equal(
    canonicalizeTransitEvidence(
      "Nodo Sur natal en Libra — Casa 12",
      productionCase,
    ),
    null,
  );
  assert.equal(
    canonicalizeTransitEvidence(
      "Nodo Sur natal en Virgo — Casa 11",
      productionCase,
    ),
    null,
  );
  assert.equal(
    canonicalizeTransitEvidence("Nodo Sur oposición Venus", productionCase),
    null,
  );
  assert.equal(
    canonicalizeTransitEvidence("Nodo Sur en 14° Virgo", productionCase),
    null,
  );
  assert.equal(
    canonicalizeTransitEvidence(
      "Nodo Sur natal en Virgo — Casa 12, activando trauma ancestral",
      productionCase,
    ),
    null,
  );

  assert.equal(
    canonicalizeTransitEvidence("Marte en Casa 1", productionCase),
    "Marte natal en Casa 1",
  );

  const input = createSampleTransitEngineInput();
  const sampleAllowed = createEvidenceWhitelist(
    buildTransitAnalysisEvidence({
      natalChart: input.natalChart,
      transitAnalysis: input.transitAnalysis,
    }),
  );

  assert.equal(sampleAllowed.has("Nodo Sur en Virgo — Casa 12"), false);
  assert.equal(sampleAllowed.has("Nodo Sur en Aries — Casa 1"), true);
  assert.equal(sampleAllowed.has("Venus en Tauro — Casa 2"), true);
  assert.equal(sampleAllowed.has("Venus en Libra — Casa 4"), false);

  assert.equal(
    canonicalizeTransitEvidence("Nodo Sur natal en Aries — Casa 1", sampleAllowed),
    "Nodo Sur en Aries — Casa 1",
  );
  assert.equal(
    canonicalizeTransitEvidence("Venus natal en Tauro — Casa 2", sampleAllowed),
    "Venus en Tauro — Casa 2",
  );
  assert.equal(
    canonicalizeTransitEvidence("Venus natal en Libra — Casa 4", sampleAllowed),
    null,
  );

  assert.equal(
    canonicalizeTransitEvidence(
      "Júpiter en tránsito cuadratura Venus",
      sampleAllowed,
    ),
    null,
  );
  assert.equal(
    canonicalizeTransitEvidence(
      "Júpiter natal en tránsito en Leo por Casa 5",
      sampleAllowed,
    ),
    null,
  );
  assert.equal(
    isNatalPositionEvidenceFormat("Nodo Sur natal en Virgo — Casa 12"),
    true,
  );
  assert.equal(
    isNatalPositionEvidenceFormat("Júpiter en tránsito cuadratura Venus natal"),
    false,
  );
}

run();
console.log("transit evidence natal-marker normalization tests ok");
