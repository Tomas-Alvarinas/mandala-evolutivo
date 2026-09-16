import assert from "node:assert/strict";
import { ASTROLOGICAL_BODIES } from "@/lib/astrology";
import { GeminiEngineError } from "../gemini/errors";
import {
  assertSolarReturnEngineInput,
  buildSolarReturnContext,
} from "./context";
import {
  EXPECTED_SOLAR_RETURN_POSITION_COUNT,
  formatSolarReturnAspectEvidence,
  formatSolarReturnNatalContactEvidence,
  formatSolarReturnPositionEvidence,
} from "./evidence";
import { createSampleSolarReturnEngineInput } from "./sample";

function run() {
  const input = createSampleSolarReturnEngineInput();
  const context = buildSolarReturnContext(input);
  const { natalChart, solarReturn } = input;

  for (const heading of [
    "CONSULTANTE",
    "PERÍODO",
    "CARTA NATAL",
    "POSICIONES NATALES",
    "ÁNGULOS NATALES",
    "ASPECTOS NATALES",
    "REGENTES NATALES",
    "CONFIGURACIONES NATALES",
    "REVOLUCIÓN SOLAR",
    "POSICIONES RS",
    "ASCENDENTE RS",
    "REGENTE ASCENDENTE RS",
    "MEDIO CIELO RS",
    "SUPERPOSICIONES RS → NATAL",
    "ASPECTOS INTERNOS RS",
    "CONTACTOS RS ↔ NATAL",
    "SÍNTESIS DE ELEMENTOS",
    "EVIDENCIA PERMITIDA PARA astrologicalBasis",
  ]) {
    assert.ok(context.includes(heading), `missing heading ${heading}`);
  }

  assert.ok(context.includes("Paula Prueba"));
  assert.ok(context.includes("Edad: 41"));
  assert.ok(context.includes("1 de septiembre de 2026"));
  assert.ok(context.includes("1 de septiembre de 2027"));
  assert.ok(context.includes("De un cumpleaños al cumpleaños siguiente"));

  assert.equal(natalChart.positions.length, ASTROLOGICAL_BODIES.length);
  assert.equal(
    solarReturn.positions.length,
    EXPECTED_SOLAR_RETURN_POSITION_COUNT,
  );
  assert.ok(context.includes("Marte en Aries — Casa 1"));
  assert.ok(context.includes("Venus RS en Capricornio — Casa RS 10 — Casa natal 2"));
  assert.ok(context.includes("Ascendente RS en Tauro — Casa natal 6"));
  assert.ok(context.includes("Medio Cielo RS en Capricornio — Casa natal 2"));
  assert.ok(context.includes("Regente del Ascendente RS: Venus"));
  assert.ok(context.includes("Fuego: 2"));
  assert.ok(context.includes("Tierra: 5"));

  for (const line of solarReturn.positions.map(formatSolarReturnPositionEvidence)) {
    assert.ok(context.includes(line), `missing RS position ${line}`);
  }
  for (const line of solarReturn.aspects.map(formatSolarReturnAspectEvidence)) {
    assert.ok(context.includes(line), `missing RS aspect ${line}`);
  }
  for (const line of solarReturn.natalContacts.map(
    formatSolarReturnNatalContactEvidence,
  )) {
    assert.ok(context.includes(line), `missing RS natal contact ${line}`);
  }

  assert.equal(context.includes(solarReturn.id), false);
  assert.equal(context.includes(solarReturn.clientId), false);
  assert.equal(context.includes("professionalNotes"), false);
  assert.equal(context.includes("No enviar al modelo."), false);
  assert.equal(context.includes("informe natal"), false);
  assert.equal(context.includes("NatalChartReport"), false);
  assert.equal(context.includes("mandalaImpact"), false);

  const incompleteNatal = {
    ...input,
    natalChart: {
      ...natalChart,
      positions: natalChart.positions.slice(0, 4),
    },
  };
  assert.throws(
    () => assertSolarReturnEngineInput(incompleteNatal),
    (error: unknown) =>
      error instanceof GeminiEngineError && error.code === "invalid_input",
  );

  const incompleteRs = {
    ...input,
    solarReturn: {
      ...solarReturn,
      positions: solarReturn.positions.filter((item) => item.point !== "venus"),
    },
  };
  assert.throws(
    () => assertSolarReturnEngineInput(incompleteRs),
    (error: unknown) =>
      error instanceof GeminiEngineError && error.code === "invalid_input",
  );

  const missingAscendant = {
    ...input,
    solarReturn: {
      ...solarReturn,
      positions: solarReturn.positions.filter(
        (item) => item.point !== "ascendant",
      ),
    },
  };
  assert.throws(
    () => assertSolarReturnEngineInput(missingAscendant),
    (error: unknown) =>
      error instanceof GeminiEngineError && error.code === "invalid_input",
  );

  const emptyAspectsOk = {
    ...input,
    solarReturn: {
      ...solarReturn,
      aspects: [],
      natalContacts: [],
    },
  };
  assert.doesNotThrow(() => assertSolarReturnEngineInput(emptyAspectsOk));
  const emptyContext = buildSolarReturnContext(emptyAspectsOk);
  assert.ok(emptyContext.includes("Ningún aspecto interno RS registrado."));
  assert.ok(emptyContext.includes("Ningún contacto RS ↔ Natal registrado."));
}

run();
console.log("solar return context tests ok");
