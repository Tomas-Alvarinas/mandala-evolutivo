import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  NATAL_CHART_REPORT_SECTION_IDS,
  NATAL_CHART_REPORT_VERSION,
} from "@/lib/reports";
import { geminiNatalChartReportSchema } from "@/lib/ai/natal-chart/schema";
import {
  createEvidenceWhitelist,
  formatAngleEvidence,
  formatPositionEvidence,
} from "@/lib/ai/natal-chart/evidence";
import { buildNatalChartSystemInstruction } from "@/lib/ai/natal-chart/prompt";
import { PAULA_LENS, PAULA_LENS_NAME, PAULA_LENS_VERSION } from "./paula-lens";
import {
  ASTROLOGY_REFERENCE_LENSES,
  ASTROLOGY_REFERENCE_LENSES_ENABLED,
} from "./astrology-reference-lenses";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

const AUTHOR_NAMES = [
  "Stephen Arroyo",
  "Liz Greene",
  "Howard Sasportas",
  "Pablo Flores",
  "Mia Astral",
] as const;

function sectionAfter(source: string, heading: string): string {
  const start = source.indexOf(heading);
  assert.ok(start >= 0, `missing heading: ${heading}`);
  const rest = source.slice(start + heading.length);
  const next = rest.search(/\n## /);
  return next === -1 ? rest : rest.slice(0, next);
}

function run() {
  assert.equal(ASTROLOGY_REFERENCE_LENSES_ENABLED, true);
  assert.equal(PAULA_LENS_VERSION, "1.3");
  assert.equal(NATAL_CHART_REPORT_VERSION, "1.1");

  const instruction = buildNatalChartSystemInstruction();

  assert.ok(instruction.includes(PAULA_LENS));
  assert.ok(instruction.includes(ASTROLOGY_REFERENCE_LENSES));
  assert.ok(
    instruction.indexOf(PAULA_LENS) <
      instruction.indexOf(ASTROLOGY_REFERENCE_LENSES),
  );
  assert.ok(instruction.includes("NatalChartReport"));
  assert.ok(instruction.includes("26 secciones"));

  for (const name of AUTHOR_NAMES) {
    assert.ok(
      ASTROLOGY_REFERENCE_LENSES.includes(name),
      `experimental layer missing ${name}`,
    );
    assert.ok(instruction.includes(name), `system instruction missing ${name}`);
  }

  const miaHeading = "## Lente específica — Nodo Norte y Nodo Sur (Mia Astral)";
  const miaSection = sectionAfter(ASTROLOGY_REFERENCE_LENSES, miaHeading);
  assert.ok(miaSection.includes("Nodo Norte"));
  assert.ok(miaSection.includes("Nodo Sur"));
  assert.ok(miaSection.includes("Eje nodal") || miaSection.includes("eje nodal"));
  assert.ok(
    ASTROLOGY_REFERENCE_LENSES.includes(
      "únicamente cuando la carta incluye Nodo Norte y Nodo Sur",
    ),
  );
  assert.ok(
    ASTROLOGY_REFERENCE_LENSES.includes(
      "No usarla para el resto del informe como marco general",
    ),
  );

  assert.ok(
    ASTROLOGY_REFERENCE_LENSES.includes("## Lente general — Stephen Arroyo"),
  );
  assert.ok(ASTROLOGY_REFERENCE_LENSES.includes("## Lente general — Liz Greene"));
  assert.ok(
    ASTROLOGY_REFERENCE_LENSES.includes("## Lente general — Howard Sasportas"),
  );
  assert.ok(
    ASTROLOGY_REFERENCE_LENSES.includes("## Lente general — Pablo Flores"),
  );
  assert.equal(
    ASTROLOGY_REFERENCE_LENSES.includes("## Lente general — Mia Astral"),
    false,
  );

  assert.ok(ASTROLOGY_REFERENCE_LENSES.includes("No inventar citas"));
  assert.ok(ASTROLOGY_REFERENCE_LENSES.includes("doctrinas atribuidas"));
  assert.ok(ASTROLOGY_REFERENCE_LENSES.includes("según X autor"));
  assert.ok(
    ASTROLOGY_REFERENCE_LENSES.includes("No inventar su metodología"),
  );

  const knowledgeSafety = sectionAfter(
    ASTROLOGY_REFERENCE_LENSES,
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
      "no como una base documental verificable",
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
    ASTROLOGY_REFERENCE_LENSES.includes(
      "No mencionar autores, libros o escuelas en el informe",
    ),
  );
  assert.ok(
    ASTROLOGY_REFERENCE_LENSES.includes("No nombrarlo en el informe") ||
      ASTROLOGY_REFERENCE_LENSES.includes("No nombrarla en el informe"),
  );
  assert.ok(
    ASTROLOGY_REFERENCE_LENSES.includes(
      "La voz del informe es Cristal Paula",
    ),
  );

  assert.ok(ASTROLOGY_REFERENCE_LENSES.includes("No reemplaza Cristal Paula"));
  assert.ok(
    ASTROLOGY_REFERENCE_LENSES.includes(
      "Metodología Cristal Paula (voz, secuencia y límites del informe)",
    ),
  );
  assert.ok(instruction.includes(PAULA_LENS_NAME));
  assert.ok(
    instruction.indexOf(PAULA_LENS_NAME) <
      instruction.indexOf("Lentes astrológicas complementarias"),
  );

  assert.equal(NATAL_CHART_REPORT_SECTION_IDS.length, 26);
  assert.deepEqual(Object.keys(geminiNatalChartReportSchema.shape), [
    ...NATAL_CHART_REPORT_SECTION_IDS,
  ]);

  const allowed = createEvidenceWhitelist([
    "Sol en Leo — Casa 5",
    "Ascendente en Cáncer",
  ]);
  assert.equal(allowed.has("Sol en Leo — Casa 5"), true);
  assert.equal(allowed.has("Sol en Leo en casa 5"), false);
  assert.equal(
    formatPositionEvidence({
      point: "sun",
      sign: "leo",
      house: 5,
    }),
    "Sol en Leo — Casa 5",
  );
  assert.equal(formatAngleEvidence("ascendant", "cancer"), "Ascendente en Cáncer");

  const promptSource = readFileSync(
    path.join(DIRNAME, "../natal-chart/prompt.ts"),
    "utf8",
  );
  assert.ok(promptSource.includes("ASTROLOGY_REFERENCE_LENSES"));
  assert.ok(promptSource.includes("ASTROLOGY_REFERENCE_LENSES_ENABLED"));
  assert.equal(promptSource.includes("Stephen Arroyo"), false);
}

run();
console.log("astrology reference lenses tests ok");
