import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  TRANSIT_ANALYSIS_REPORT_SECTION_IDS,
  TRANSIT_ANALYSIS_REPORT_VERSION,
  TRANSIT_METHODOLOGY_VERSION,
} from "@/lib/reports";
import { PAULA_LENS_VERSION } from "../methodology/paula-lens";
import { TRANSIT_REFERENCE_LENSES } from "../methodology/transit-reference-lenses";
import { TRANSIT_ANALYSIS_INSTRUCTIONS } from "./instructions";
import { geminiTransitAnalysisReportSchema } from "./schema";
import {
  formatTransitAspectEvidence,
  formatTransitEclipseEvidence,
  formatTransitPositionEvidence,
} from "./evidence";
import { createSampleTransitEngineInput } from "./sample";
import { buildTransitAnalysisUserPrompt } from "./prompt";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

const AUTHOR_NAMES = [
  "Eloy Dumón",
  "Daniel Dancourt",
  "Stephen Arroyo",
  "Howard Sasportas",
  "Tracy Marks",
] as const;

function run() {
  assert.equal(TRANSIT_METHODOLOGY_VERSION, "1.1");
  assert.equal(TRANSIT_ANALYSIS_REPORT_VERSION, "1.0");
  assert.equal(PAULA_LENS_VERSION, "1.3");
  assert.deepEqual([...TRANSIT_ANALYSIS_REPORT_SECTION_IDS], [
    "mandalaImpact",
    "activatedAreas",
    "evolutionaryChallenges",
    "availableResources",
    "opportunities",
    "learnings",
  ]);
  assert.deepEqual(Object.keys(geminiTransitAnalysisReportSchema.shape), [
    ...TRANSIT_ANALYSIS_REPORT_SECTION_IDS,
  ]);

  assert.ok(TRANSIT_ANALYSIS_INSTRUCTIONS.includes("Ejemplos concretos y observables"));
  assert.ok(
    TRANSIT_ANALYSIS_INSTRUCTIONS.includes(
      "¿Cómo podría darme cuenta de que esto está ocurriendo en mi vida?",
    ),
  );
  assert.ok(
    TRANSIT_ANALYSIS_INSTRUCTIONS.includes("Esto podría verse, por ejemplo, en…"),
  );
  assert.ok(
    TRANSIT_ANALYSIS_INSTRUCTIONS.includes("uno o dos ejemplos cotidianos observables"),
  );

  assert.ok(TRANSIT_ANALYSIS_INSTRUCTIONS.includes("## Ámbito laboral"));
  assert.ok(TRANSIT_ANALYSIS_INSTRUCTIONS.includes("En el ámbito laboral podría aparecer como…"));
  assert.ok(TRANSIT_ANALYSIS_INSTRUCTIONS.includes("## Ámbito económico"));
  assert.ok(TRANSIT_ANALYSIS_INSTRUCTIONS.includes("En lo económico podría sentirse como…"));
  assert.ok(TRANSIT_ANALYSIS_INSTRUCTIONS.includes("## Ámbito vincular"));
  assert.ok(TRANSIT_ANALYSIS_INSTRUCTIONS.includes("En los vínculos podría manifestarse como…"));

  assert.ok(TRANSIT_ANALYSIS_INSTRUCTIONS.includes("## No forzar los tres ámbitos"));
  assert.ok(
    TRANSIT_ANALYSIS_INSTRUCTIONS.includes(
      "No incluir laboral + económico + vincular de forma mecánica",
    ),
  );
  assert.ok(
    TRANSIT_ANALYSIS_INSTRUCTIONS.includes(
      "no inventar un ejemplo para cubrirla",
    ),
  );

  assert.ok(TRANSIT_ANALYSIS_INSTRUCTIONS.includes("No predecir hechos"));
  assert.ok(TRANSIT_ANALYSIS_INSTRUCTIONS.includes("Los ejemplos son posibilidades"));
  assert.ok(TRANSIT_ANALYSIS_INSTRUCTIONS.includes("vas a cambiar de trabajo"));
  assert.ok(TRANSIT_ANALYSIS_INSTRUCTIONS.includes("va a entrar dinero"));
  assert.ok(TRANSIT_ANALYSIS_INSTRUCTIONS.includes("vas a perder dinero"));
  assert.ok(TRANSIT_ANALYSIS_INSTRUCTIONS.includes("asesoramiento financiero"));
  assert.ok(TRANSIT_ANALYSIS_INSTRUCTIONS.includes("eventos vinculares concretos"));
  assert.ok(TRANSIT_ANALYSIS_INSTRUCTIONS.includes("No diagnostiques. No predijas."));

  assert.ok(
    TRANSIT_ANALYSIS_INSTRUCTIONS.includes("No inventes situaciones reales"),
  );
  assert.ok(
    TRANSIT_ANALYSIS_INSTRUCTIONS.includes(
      "No pueden asumir que una situación concreta ya está ocurriendo",
    ),
  );
  assert.ok(
    TRANSIT_ANALYSIS_INSTRUCTIONS.includes(
      "Actualmente estás teniendo conflictos con tu jefe",
    ),
  );

  const input = createSampleTransitEngineInput();
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

  const evidenceSource = readFileSync(path.join(DIRNAME, "evidence.ts"), "utf8");
  assert.ok(evidenceSource.includes("formatTransitPositionEvidence"));
  assert.ok(evidenceSource.includes("buildNatalChartEvidence"));
  assert.equal(evidenceSource.includes("ámbito laboral"), false);

  for (const name of AUTHOR_NAMES) {
    assert.equal(
      TRANSIT_ANALYSIS_INSTRUCTIONS.includes(name),
      false,
      `instructions named ${name}`,
    );
    assert.ok(TRANSIT_REFERENCE_LENSES.includes(name));
  }
  assert.ok(TRANSIT_REFERENCE_LENSES.includes("AUTHOR KNOWLEDGE SAFETY"));
  assert.ok(
    TRANSIT_ANALYSIS_INSTRUCTIONS.includes(
      "No mencionar autores, libros o escuelas en el informe",
    ),
  );

  const userPrompt = buildTransitAnalysisUserPrompt("CONTEXTO");
  assert.ok(userPrompt.includes("ejemplos cotidianos posibles"));
  assert.ok(userPrompt.includes("sin predecir hechos"));
  assert.ok(userPrompt.includes("No agregues “natal”"));
  assert.ok(
    TRANSIT_ANALYSIS_INSTRUCTIONS.includes(
      "EVIDENCIA PERMITIDA PARA astrologicalBasis",
    ),
  );
  assert.ok(
    TRANSIT_ANALYSIS_INSTRUCTIONS.includes(
      "No agregar la palabra “natal” si no está en la cadena canónica",
    ),
  );
  assert.ok(
    TRANSIT_ANALYSIS_INSTRUCTIONS.includes(
      "La misma evidencia canónica puede repetirse en más de una sección",
    ),
  );
}

run();
console.log("transit analysis concreteness tests ok");
