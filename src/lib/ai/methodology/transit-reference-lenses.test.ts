import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  NATAL_CHART_REPORT_VERSION,
  TRANSIT_ANALYSIS_REPORT_SECTION_IDS,
  TRANSIT_ANALYSIS_REPORT_VERSION,
  TRANSIT_METHODOLOGY_VERSION,
} from "@/lib/reports";
import { CRISTAL_PAULA_CORE, PAULA_LENS_NAME, PAULA_LENS_VERSION } from "./paula-lens";
import {
  TRANSIT_METHODOLOGY_NAME,
  TRANSIT_REFERENCE_LENSES,
  TRANSIT_REFERENCE_LENSES_ENABLED,
} from "./transit-reference-lenses";
import { buildTransitAnalysisSystemInstruction } from "../transits/prompt";
import { TRANSIT_ANALYSIS_INSTRUCTIONS } from "../transits/instructions";
import { ASTROLOGY_REFERENCE_LENSES } from "./astrology-reference-lenses";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

const AUTHOR_NAMES = [
  "Eloy Dumón",
  "Daniel Dancourt",
  "Stephen Arroyo",
  "Howard Sasportas",
  "Tracy Marks",
] as const;

function sectionAfter(source: string, heading: string): string {
  const start = source.indexOf(heading);
  assert.ok(start >= 0, `missing heading: ${heading}`);
  const rest = source.slice(start + heading.length);
  const next = rest.search(/\n## /);
  return next === -1 ? rest : rest.slice(0, next);
}

function run() {
  assert.equal(TRANSIT_REFERENCE_LENSES_ENABLED, true);
  assert.equal(PAULA_LENS_VERSION, "1.3");
  assert.equal(NATAL_CHART_REPORT_VERSION, "1.1");
  assert.equal(TRANSIT_ANALYSIS_REPORT_VERSION, "1.0");
  assert.equal(TRANSIT_METHODOLOGY_VERSION, "1.1");
  assert.equal(TRANSIT_METHODOLOGY_NAME, "Cristal Paula — Tránsitos");

  const instruction = buildTransitAnalysisSystemInstruction();

  assert.ok(instruction.includes(CRISTAL_PAULA_CORE));
  assert.ok(instruction.includes(TRANSIT_REFERENCE_LENSES));
  assert.ok(instruction.includes(TRANSIT_ANALYSIS_INSTRUCTIONS));
  assert.ok(
    instruction.indexOf(CRISTAL_PAULA_CORE) <
      instruction.indexOf(TRANSIT_REFERENCE_LENSES),
  );
  assert.ok(
    instruction.indexOf(TRANSIT_REFERENCE_LENSES) <
      instruction.indexOf(TRANSIT_ANALYSIS_INSTRUCTIONS),
  );
  assert.equal(instruction.includes(ASTROLOGY_REFERENCE_LENSES), false);
  assert.ok(instruction.includes(PAULA_LENS_NAME));
  assert.equal(instruction.includes("NatalChartReport"), false);
  assert.equal(instruction.includes("26 secciones"), false);
  assert.equal(instruction.includes("evolutionaryMandalaSummary"), false);

  for (const name of AUTHOR_NAMES) {
    assert.ok(
      TRANSIT_REFERENCE_LENSES.includes(name),
      `transit layer missing ${name}`,
    );
    assert.ok(instruction.includes(name), `system instruction missing ${name}`);
    assert.equal(
      TRANSIT_ANALYSIS_INSTRUCTIONS.includes(name),
      false,
      `output instructions named ${name}`,
    );
  }

  const knowledgeSafety = sectionAfter(
    TRANSIT_REFERENCE_LENSES,
    "## AUTHOR KNOWLEDGE SAFETY",
  );
  assert.ok(instruction.includes("AUTHOR KNOWLEDGE SAFETY"));
  assert.ok(
    knowledgeSafety.includes(
      "únicamente como orientación metodológica interna",
    ),
  );
  assert.ok(
    knowledgeSafety.includes("inventar una teoría atribuida a un autor"),
  );
  assert.ok(
    knowledgeSafety.includes(
      "inventar conceptos, libros, citas o terminología",
    ),
  );
  assert.ok(
    knowledgeSafety.includes(
      "completar de memoria una doctrina cuando exista incertidumbre",
    ),
  );
  assert.ok(
    knowledgeSafety.includes(
      "presentar una interpretación como propia de un autor",
    ),
  );
  assert.ok(
    knowledgeSafety.includes(
      "mezclar ideas de distintos autores y atribuir el resultado a uno de ellos",
    ),
  );
  assert.ok(knowledgeSafety.includes("NO utilizar la atribución"));
  assert.ok(
    knowledgeSafety.includes(
      "La ausencia de información es preferible a una atribución posiblemente falsa",
    ),
  );
  assert.ok(
    knowledgeSafety.includes("NO constituye evidencia bibliográfica"),
  );
  assert.ok(
    knowledgeSafety.includes(
      "Si el modelo no tiene conocimiento suficientemente confiable sobre Eloy Dumón o Daniel Dancourt, debe ignorar esa lente antes que inventarla.",
    ),
  );
  assert.ok(
    knowledgeSafety.includes(
      "sin mencionar a estos autores por defecto",
    ),
  );
  for (const name of AUTHOR_NAMES) {
    assert.ok(
      knowledgeSafety.includes(name),
      `AUTHOR KNOWLEDGE SAFETY missing ${name}`,
    );
  }

  assert.ok(
    TRANSIT_REFERENCE_LENSES.includes(
      "No mencionar autores, libros o escuelas en el informe",
    ),
  );
  assert.ok(
    TRANSIT_ANALYSIS_INSTRUCTIONS.includes(
      "No mencionar autores, libros o escuelas en el informe",
    ),
  );
  assert.ok(
    TRANSIT_REFERENCE_LENSES.includes("La voz del informe es Cristal Paula"),
  );
  assert.equal(TRANSIT_ANALYSIS_REPORT_SECTION_IDS.length, 6);

  const promptSource = readFileSync(
    path.join(DIRNAME, "../transits/prompt.ts"),
    "utf8",
  );
  assert.ok(promptSource.includes("TRANSIT_REFERENCE_LENSES"));
  assert.ok(promptSource.includes("CRISTAL_PAULA_CORE"));
  assert.equal(promptSource.includes("ASTROLOGY_REFERENCE_LENSES"), false);
  assert.equal(promptSource.includes("Stephen Arroyo"), false);
  assert.equal(promptSource.includes("PAULA_LENS"), false);
}

run();
console.log("transit reference lenses tests ok");
