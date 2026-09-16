import assert from "node:assert/strict";
import {
  SOLAR_RETURN_REPORT_SECTION_IDS,
  SOLAR_RETURN_REPORT_VERSION,
  SOLAR_RETURN_METHODOLOGY_VERSION,
} from "@/lib/reports";
import { PAULA_LENS_VERSION } from "../methodology/paula-lens";
import { SOLAR_RETURN_REFERENCE_LENSES } from "../methodology/solar-return-reference-lenses";
import { SOLAR_RETURN_ANALYSIS_INSTRUCTIONS } from "./instructions";
import { geminiSolarReturnReportSchema } from "./schema";
import { buildSolarReturnUserPrompt } from "./prompt";

const AUTHOR_NAMES = [
  "Tito Maciá",
  "Stephen Arroyo",
  "Howard Sasportas",
  "Tracy Marks",
] as const;

function run() {
  assert.equal(SOLAR_RETURN_METHODOLOGY_VERSION, "1.0");
  assert.equal(SOLAR_RETURN_REPORT_VERSION, "1.0");
  assert.equal(PAULA_LENS_VERSION, "1.3");
  assert.equal(SOLAR_RETURN_REPORT_SECTION_IDS.length, 12);
  assert.deepEqual(Object.keys(geminiSolarReturnReportSchema.shape), [
    ...SOLAR_RETURN_REPORT_SECTION_IDS,
  ]);

  assert.ok(SOLAR_RETURN_ANALYSIS_INSTRUCTIONS.includes("No predecir hechos"));
  assert.ok(SOLAR_RETURN_ANALYSIS_INSTRUCTIONS.includes("No calcular astrología"));
  assert.ok(
    SOLAR_RETURN_ANALYSIS_INSTRUCTIONS.includes(
      "La Carta Natal es siempre la matriz de referencia",
    ),
  );
  assert.ok(
    SOLAR_RETURN_ANALYSIS_INSTRUCTIONS.includes(
      "de un cumpleaños al cumpleaños siguiente",
    ),
  );
  assert.ok(SOLAR_RETURN_ANALYSIS_INSTRUCTIONS.includes("No diagnostiques. No predijas."));
  assert.ok(SOLAR_RETURN_ANALYSIS_INSTRUCTIONS.includes("asesoramiento financiero"));
  assert.ok(SOLAR_RETURN_ANALYSIS_INSTRUCTIONS.includes("consejo médico"));
  assert.ok(SOLAR_RETURN_ANALYSIS_INSTRUCTIONS.includes("menor de 18 años"));
  assert.ok(SOLAR_RETURN_ANALYSIS_INSTRUCTIONS.includes("podría"));
  assert.ok(SOLAR_RETURN_ANALYSIS_INSTRUCTIONS.includes("puede manifestarse como"));
  assert.ok(SOLAR_RETURN_ANALYSIS_INSTRUCTIONS.includes("cambio de trabajo seguro"));
  assert.ok(SOLAR_RETURN_ANALYSIS_INSTRUCTIONS.includes("va a entrar dinero"));
  assert.ok(SOLAR_RETURN_ANALYSIS_INSTRUCTIONS.includes("eventos vinculares concretos"));
  assert.ok(
    SOLAR_RETURN_ANALYSIS_INSTRUCTIONS.includes(
      "No mencionar autores, libros o escuelas en el informe",
    ),
  );

  for (const name of AUTHOR_NAMES) {
    assert.equal(
      SOLAR_RETURN_ANALYSIS_INSTRUCTIONS.includes(name),
      false,
      `instructions named ${name}`,
    );
    assert.ok(SOLAR_RETURN_REFERENCE_LENSES.includes(name));
  }

  const userPrompt = buildSolarReturnUserPrompt("CONTEXTO");
  assert.ok(userPrompt.includes("No calcules astrología"));
  assert.ok(userPrompt.includes("sin predecir hechos"));
  assert.ok(userPrompt.includes("No interpretes la Revolución Solar como carta aislada"));
}

run();
console.log("solar return instruction tests ok");
