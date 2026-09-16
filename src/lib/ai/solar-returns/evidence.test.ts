import assert from "node:assert/strict";
import {
  buildSolarReturnEvidence,
  createEvidenceWhitelist,
  formatSolarReturnAscendantRulerEvidence,
  formatSolarReturnAspectEvidence,
  formatSolarReturnElementEvidence,
  formatSolarReturnNatalContactEvidence,
  formatSolarReturnPositionEvidence,
  mentionsSolarReturnNode,
} from "./evidence";
import { createSampleSolarReturnEngineInput } from "./sample";

const DEGREE_OR_ORB = /\d+\s*°|\borbe\b|\borb\b/i;

function run() {
  const input = createSampleSolarReturnEngineInput();
  const { solarReturn } = input;
  const evidence = buildSolarReturnEvidence({
    natalChart: input.natalChart,
    solarReturn,
  });
  const allowed = createEvidenceWhitelist(evidence);

  const venus = solarReturn.positions.find((item) => item.point === "venus")!;
  const ascendant = solarReturn.positions.find(
    (item) => item.point === "ascendant",
  )!;
  const midheaven = solarReturn.positions.find(
    (item) => item.point === "midheaven",
  )!;

  assert.equal(
    formatSolarReturnPositionEvidence(venus),
    "Venus RS en Capricornio — Casa RS 10 — Casa natal 2",
  );
  assert.equal(
    formatSolarReturnPositionEvidence(ascendant),
    "Ascendente RS en Tauro — Casa natal 6",
  );
  assert.equal(
    formatSolarReturnPositionEvidence(midheaven),
    "Medio Cielo RS en Capricornio — Casa natal 2",
  );
  assert.equal(
    formatSolarReturnAscendantRulerEvidence("Venus"),
    "Regente del Ascendente RS: Venus",
  );
  assert.equal(
    formatSolarReturnAspectEvidence(solarReturn.aspects[0]!),
    "Venus RS conjunción Marte RS",
  );
  assert.equal(
    formatSolarReturnNatalContactEvidence(solarReturn.natalContacts[0]!),
    "Venus RS conjunción Saturno natal",
  );
  assert.equal(
    formatSolarReturnNatalContactEvidence(solarReturn.natalContacts[1]!),
    "Sol RS trígono Nodo Norte natal",
  );
  assert.equal(formatSolarReturnElementEvidence("fire", 2), "Fuego: 2");
  assert.equal(formatSolarReturnElementEvidence("earth", 5), "Tierra: 5");
  assert.equal(formatSolarReturnElementEvidence("air", 1), "Aire: 1");
  assert.equal(formatSolarReturnElementEvidence("water", 3), "Agua: 3");

  assert.equal(
    allowed.has("Venus RS en Capricornio — Casa RS 10 — Casa natal 2"),
    true,
  );
  assert.equal(allowed.has("Ascendente RS en Tauro — Casa natal 6"), true);
  assert.equal(
    allowed.has("Medio Cielo RS en Capricornio — Casa natal 2"),
    true,
  );
  assert.equal(allowed.has("Regente del Ascendente RS: Venus"), true);
  assert.equal(allowed.has("Venus RS conjunción Marte RS"), true);
  assert.equal(allowed.has("Venus RS conjunción Saturno natal"), true);
  assert.equal(allowed.has("Sol RS trígono Nodo Norte natal"), true);
  assert.equal(allowed.has("Fuego: 2"), true);
  assert.equal(allowed.has("Tierra: 5"), true);
  assert.equal(allowed.has("Aire: 1"), true);
  assert.equal(allowed.has("Agua: 3"), true);
  assert.equal(allowed.has("Sol en Leo — Casa 5"), true);
  assert.equal(allowed.has("Nodo Norte en Libra — Casa 7"), true);

  assert.equal(allowed.has("Nodo Norte RS en Libra — Casa natal 7"), false);
  assert.equal(allowed.has("Nodo Sur RS en Aries — Casa natal 1"), false);
  assert.equal(
    allowed.has("Venus RS en Acuario — Casa RS 10 — Casa natal 2"),
    false,
  );
  assert.equal(
    allowed.has("Venus RS en Capricornio — Casa RS 9 — Casa natal 2"),
    false,
  );
  assert.equal(
    allowed.has("Venus RS en Capricornio — Casa RS 10 — Casa natal 3"),
    false,
  );
  assert.equal(allowed.has("Marte RS conjunción Venus RS"), false);
  assert.equal(allowed.has("Venus RS oposición Saturno natal"), false);
  assert.equal(
    allowed.has("Venus RS en Capricornio — Casa RS 10 — Casa natal 2 a 12°"),
    false,
  );
  assert.equal(allowed.has("orbe 2°"), false);

  for (const item of evidence) {
    assert.equal(DEGREE_OR_ORB.test(item), false, `unexpected degree/orb: ${item}`);
    assert.equal(
      mentionsSolarReturnNode(item),
      false,
      `nodes must not appear on RS side: ${item}`,
    );
  }
}

run();
console.log("solar return evidence tests ok");
