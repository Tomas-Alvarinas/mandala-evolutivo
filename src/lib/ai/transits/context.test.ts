import assert from "node:assert/strict";
import { ASTROLOGICAL_BODIES } from "@/lib/astrology";
import { GeminiEngineError } from "../gemini/errors";
import {
  assertTransitAnalysisEngineInput,
  buildTransitAnalysisContext,
} from "./context";
import {
  formatNatalBodyInHouseEvidence,
  formatTransitAspectEvidence,
  formatTransitEclipseEvidence,
  formatTransitPositionEvidence,
} from "./evidence";
import { createSampleTransitEngineInput } from "./sample";

function run() {
  const input = createSampleTransitEngineInput();
  const context = buildTransitAnalysisContext(input);
  const { natalChart, transitAnalysis } = input;

  for (const heading of [
    "CONSULTANTE",
    "MANDALA NATAL",
    "POSICIONES NATALES",
    "ÁNGULOS",
    "ASPECTOS NATALES",
    "REGENTES",
    "CONFIGURACIONES",
    "TRÁNSITOS ACTUALES",
    "ASPECTOS DE TRÁNSITO",
    "ECLIPSES",
    "FECHA DEL ANÁLISIS",
  ]) {
    assert.ok(context.includes(heading), `missing heading ${heading}`);
  }

  assert.ok(context.includes("Paula Prueba"));
  assert.ok(context.includes("Edad: 41"));
  assert.ok(context.includes("2 de septiembre de 2026"));

  assert.equal(natalChart.positions.length, ASTROLOGICAL_BODIES.length);
  assert.ok(context.includes("Marte en Aries — Casa 1"));
  assert.ok(context.includes("Venus en Tauro — Casa 2"));
  assert.ok(context.includes("Regente de Casa 5: Sol en Leo"));

  const transitLines = transitAnalysis.positions.map(
    formatTransitPositionEvidence,
  );
  assert.equal(transitLines.length, 2);
  for (const line of transitLines) {
    assert.ok(context.includes(line), `missing transit ${line}`);
  }
  assert.ok(context.includes("Júpiter en tránsito en Leo por Casa 5"));
  assert.ok(context.includes("Saturno en tránsito en Piscis por Casa 12"));

  for (const line of transitAnalysis.aspects.map(formatTransitAspectEvidence)) {
    assert.ok(context.includes(line), `missing transit aspect ${line}`);
  }
  assert.ok(context.includes("Júpiter en tránsito cuadratura Venus natal"));
  assert.ok(context.includes("Saturno en tránsito conjunción Neptuno natal"));

  for (const line of transitAnalysis.eclipses.map(formatTransitEclipseEvidence)) {
    assert.ok(context.includes(line), `missing eclipse ${line}`);
  }
  assert.ok(
    context.includes("Eclipse solar: Leo Casa 1 ↔ Acuario Casa 7"),
  );

  assert.ok(
    context.includes(formatNatalBodyInHouseEvidence("Marte", 1)),
  );
  assert.ok(
    context.includes(formatNatalBodyInHouseEvidence("Nodo Sur", 1)),
  );
  assert.ok(
    context.includes(formatNatalBodyInHouseEvidence("Nodo Norte", 7)),
  );

  assert.equal(context.includes(transitAnalysis.id), false);
  assert.equal(context.includes(transitAnalysis.clientId), false);
  assert.equal(context.includes("professionalNotes"), false);
  assert.equal(context.includes("informe natal"), false);
  assert.equal(context.includes("evolutionaryMandalaSummary"), false);
  assert.equal(context.includes("NatalChartReport"), false);

  const empty = {
    ...input,
    transitAnalysis: {
      ...transitAnalysis,
      positions: [],
      aspects: [],
      eclipses: [],
    },
  };

  assert.throws(
    () => assertTransitAnalysisEngineInput(empty),
    (error: unknown) =>
      error instanceof GeminiEngineError && error.code === "invalid_input",
  );
}

run();
console.log("transit analysis context tests ok");
