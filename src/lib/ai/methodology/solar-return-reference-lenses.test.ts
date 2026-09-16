import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  NATAL_CHART_REPORT_VERSION,
  SOLAR_RETURN_METHODOLOGY_VERSION,
  SOLAR_RETURN_REPORT_SECTION_IDS,
  SOLAR_RETURN_REPORT_VERSION,
  TRANSIT_ANALYSIS_REPORT_VERSION,
  TRANSIT_METHODOLOGY_VERSION,
} from "@/lib/reports";
import { CRISTAL_PAULA_CORE, PAULA_LENS_NAME, PAULA_LENS_VERSION } from "./paula-lens";
import {
  SOLAR_RETURN_METHODOLOGY_NAME,
  SOLAR_RETURN_REFERENCE_LENSES,
  SOLAR_RETURN_REFERENCE_LENSES_ENABLED,
} from "./solar-return-reference-lenses";
import { TRANSIT_REFERENCE_LENSES } from "./transit-reference-lenses";
import { ASTROLOGY_REFERENCE_LENSES } from "./astrology-reference-lenses";
import { buildSolarReturnSystemInstruction } from "../solar-returns/prompt";
import { SOLAR_RETURN_ANALYSIS_INSTRUCTIONS } from "../solar-returns/instructions";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

const AUTHOR_NAMES = [
  "Tito Maciá",
  "Stephen Arroyo",
  "Howard Sasportas",
  "Tracy Marks",
] as const;

function run() {
  assert.equal(SOLAR_RETURN_REFERENCE_LENSES_ENABLED, true);
  assert.equal(PAULA_LENS_VERSION, "1.3");
  assert.equal(NATAL_CHART_REPORT_VERSION, "1.1");
  assert.equal(TRANSIT_ANALYSIS_REPORT_VERSION, "1.0");
  assert.equal(TRANSIT_METHODOLOGY_VERSION, "1.1");
  assert.equal(SOLAR_RETURN_REPORT_VERSION, "1.0");
  assert.equal(SOLAR_RETURN_METHODOLOGY_VERSION, "1.0");
  assert.equal(
    SOLAR_RETURN_METHODOLOGY_NAME,
    "Cristal Paula — Revolución Solar",
  );

  const instruction = buildSolarReturnSystemInstruction();

  assert.ok(instruction.includes(CRISTAL_PAULA_CORE));
  assert.ok(instruction.includes(SOLAR_RETURN_REFERENCE_LENSES));
  assert.ok(instruction.includes(SOLAR_RETURN_ANALYSIS_INSTRUCTIONS));
  assert.ok(
    instruction.indexOf(CRISTAL_PAULA_CORE) <
      instruction.indexOf(SOLAR_RETURN_REFERENCE_LENSES),
  );
  assert.ok(
    instruction.indexOf(SOLAR_RETURN_REFERENCE_LENSES) <
      instruction.indexOf(SOLAR_RETURN_ANALYSIS_INSTRUCTIONS),
  );
  assert.equal(instruction.includes(ASTROLOGY_REFERENCE_LENSES), false);
  assert.equal(instruction.includes(TRANSIT_REFERENCE_LENSES), false);
  assert.ok(instruction.includes(PAULA_LENS_NAME));
  assert.equal(instruction.includes("NatalChartReport"), false);
  assert.equal(instruction.includes("26 secciones"), false);
  assert.equal(instruction.includes("mandalaImpact"), false);

  for (const name of AUTHOR_NAMES) {
    assert.ok(
      SOLAR_RETURN_REFERENCE_LENSES.includes(name),
      `solar return layer missing ${name}`,
    );
    assert.ok(instruction.includes(name), `system instruction missing ${name}`);
    assert.equal(
      SOLAR_RETURN_ANALYSIS_INSTRUCTIONS.includes(name),
      false,
      `output instructions named ${name}`,
    );
  }

  assert.ok(instruction.includes("AUTHOR KNOWLEDGE SAFETY"));
  assert.ok(
    SOLAR_RETURN_REFERENCE_LENSES.includes(
      "Si el modelo no tiene conocimiento suficientemente confiable sobre Tito Maciá, debe ignorar esa lente antes que inventarla.",
    ),
  );
  assert.ok(
    SOLAR_RETURN_ANALYSIS_INSTRUCTIONS.includes(
      "No mencionar autores, libros o escuelas en el informe",
    ),
  );
  assert.equal(SOLAR_RETURN_REPORT_SECTION_IDS.length, 12);

  const promptSource = readFileSync(
    path.join(DIRNAME, "../solar-returns/prompt.ts"),
    "utf8",
  );
  assert.ok(promptSource.includes("SOLAR_RETURN_REFERENCE_LENSES"));
  assert.ok(promptSource.includes("CRISTAL_PAULA_CORE"));
  assert.equal(promptSource.includes("ASTROLOGY_REFERENCE_LENSES"), false);
  assert.equal(promptSource.includes("Tito Maciá"), false);
  assert.equal(promptSource.includes("PAULA_LENS"), false);
}

run();
console.log("solar return reference lenses tests ok");
