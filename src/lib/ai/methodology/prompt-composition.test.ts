import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  NATAL_CHART_REPORT_SECTION_IDS,
  SOLAR_RETURN_REPORT_SECTION_IDS,
  SOLAR_RETURN_REPORT_SECTION_LABELS,
  TRANSIT_ANALYSIS_REPORT_SECTION_IDS,
  TRANSIT_ANALYSIS_REPORT_SECTION_LABELS,
} from "@/lib/reports";
import { NATAL_CHART_ANALYSIS_INSTRUCTIONS } from "@/lib/ai/natal-chart/instructions";
import { buildNatalChartSystemInstruction } from "@/lib/ai/natal-chart/prompt";
import { TRANSIT_ANALYSIS_INSTRUCTIONS } from "@/lib/ai/transits/instructions";
import { buildTransitAnalysisSystemInstruction } from "@/lib/ai/transits/prompt";
import { SOLAR_RETURN_ANALYSIS_INSTRUCTIONS } from "@/lib/ai/solar-returns/instructions";
import { buildSolarReturnSystemInstruction } from "@/lib/ai/solar-returns/prompt";
import {
  CRISTAL_PAULA_CORE,
  NATAL_CHART_PAULA_REPORT_CONTRACT,
  NATAL_CHART_PAULA_REPORT_INSTRUCTIONS,
  PAULA_LENS,
  PAULA_LENS_NAME,
  PAULA_LENS_VERSION,
} from "./paula-lens";
import { ASTROLOGY_REFERENCE_LENSES } from "./astrology-reference-lenses";
import { TRANSIT_REFERENCE_LENSES } from "./transit-reference-lenses";
import { SOLAR_RETURN_REFERENCE_LENSES } from "./solar-return-reference-lenses";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

const NATAL_PAULA_LENS_SHA256 =
  "d1ac5eb86863037cc7a9328a0ab448402dd31fe8baf47d0df8ebd93d0ce7ebcb";

const TRANSIT_AUTHOR_NAMES = [
  "Eloy Dumón",
  "Daniel Dancourt",
  "Stephen Arroyo",
  "Howard Sasportas",
  "Tracy Marks",
] as const;

const NATAL_FORMAT_MARKERS = [
  "NatalChartReport",
  "26 secciones",
  "26 áreas integradas",
  "evolutionaryMandalaSummary",
  "# Relación con NatalChartReport",
  "La sección Cuerpo, bienestar y hábitos",
  "La sección Dinero y recursos",
  "La sección Mirada sistémica y astrogenealógica",
  "En la sección Dinero y recursos, Casa 2",
] as const;

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function run() {
  assert.equal(PAULA_LENS_VERSION, "1.3");
  assert.equal(sha256(PAULA_LENS), NATAL_PAULA_LENS_SHA256);

  const natalInstruction = buildNatalChartSystemInstruction();
  const transitInstruction = buildTransitAnalysisSystemInstruction();
  const solarReturnInstruction = buildSolarReturnSystemInstruction();

  assert.ok(natalInstruction.startsWith(PAULA_LENS));
  assert.ok(natalInstruction.includes(CRISTAL_PAULA_CORE.slice(0, 80)));
  assert.ok(natalInstruction.includes(NATAL_CHART_PAULA_REPORT_CONTRACT));
  assert.ok(natalInstruction.includes(NATAL_CHART_ANALYSIS_INSTRUCTIONS));
  assert.ok(natalInstruction.includes(ASTROLOGY_REFERENCE_LENSES));
  assert.equal(NATAL_CHART_REPORT_SECTION_IDS.length, 26);
  for (const sectionId of NATAL_CHART_REPORT_SECTION_IDS) {
    assert.ok(
      natalInstruction.includes(sectionId),
      `natal instruction missing ${sectionId}`,
    );
  }
  assert.ok(
    natalInstruction.indexOf(PAULA_LENS) <
      natalInstruction.indexOf(ASTROLOGY_REFERENCE_LENSES),
  );
  assert.ok(
    natalInstruction.indexOf(ASTROLOGY_REFERENCE_LENSES) <
      natalInstruction.indexOf(NATAL_CHART_ANALYSIS_INSTRUCTIONS),
  );

  assert.ok(transitInstruction.startsWith(CRISTAL_PAULA_CORE));
  assert.ok(transitInstruction.includes(TRANSIT_REFERENCE_LENSES));
  assert.ok(transitInstruction.includes(TRANSIT_ANALYSIS_INSTRUCTIONS));
  assert.ok(transitInstruction.includes(PAULA_LENS_NAME));
  assert.equal(transitInstruction.includes(PAULA_LENS), false);
  assert.equal(transitInstruction.includes(ASTROLOGY_REFERENCE_LENSES), false);
  assert.equal(
    transitInstruction.includes(NATAL_CHART_ANALYSIS_INSTRUCTIONS),
    false,
  );
  assert.equal(
    transitInstruction.includes(NATAL_CHART_PAULA_REPORT_CONTRACT),
    false,
  );
  assert.equal(
    transitInstruction.includes(NATAL_CHART_PAULA_REPORT_INSTRUCTIONS),
    false,
  );

  assert.ok(solarReturnInstruction.startsWith(CRISTAL_PAULA_CORE));
  assert.ok(solarReturnInstruction.includes(SOLAR_RETURN_REFERENCE_LENSES));
  assert.ok(solarReturnInstruction.includes(SOLAR_RETURN_ANALYSIS_INSTRUCTIONS));
  assert.ok(solarReturnInstruction.includes(PAULA_LENS_NAME));
  assert.equal(solarReturnInstruction.includes(PAULA_LENS), false);
  assert.equal(
    solarReturnInstruction.includes(ASTROLOGY_REFERENCE_LENSES),
    false,
  );
  assert.equal(
    solarReturnInstruction.includes(NATAL_CHART_ANALYSIS_INSTRUCTIONS),
    false,
  );
  assert.equal(
    solarReturnInstruction.includes(TRANSIT_ANALYSIS_INSTRUCTIONS),
    false,
  );
  assert.equal(
    solarReturnInstruction.includes(TRANSIT_REFERENCE_LENSES),
    false,
  );
  assert.equal(SOLAR_RETURN_REPORT_SECTION_IDS.length, 12);
  for (const sectionId of SOLAR_RETURN_REPORT_SECTION_IDS) {
    assert.ok(
      solarReturnInstruction.includes(sectionId),
      `solar return instruction missing ${sectionId}`,
    );
    assert.ok(
      solarReturnInstruction.includes(
        SOLAR_RETURN_REPORT_SECTION_LABELS[sectionId],
      ),
      `solar return instruction missing label ${sectionId}`,
    );
  }
  assert.ok(
    solarReturnInstruction.indexOf(CRISTAL_PAULA_CORE) <
      solarReturnInstruction.indexOf(SOLAR_RETURN_REFERENCE_LENSES),
  );
  assert.ok(
    solarReturnInstruction.indexOf(SOLAR_RETURN_REFERENCE_LENSES) <
      solarReturnInstruction.indexOf(SOLAR_RETURN_ANALYSIS_INSTRUCTIONS),
  );
  assert.ok(SOLAR_RETURN_REFERENCE_LENSES.includes("Tito Maciá"));
  assert.equal(SOLAR_RETURN_ANALYSIS_INSTRUCTIONS.includes("Tito Maciá"), false);
  assert.ok(solarReturnInstruction.includes("Tito Maciá"));
  assert.ok(solarReturnInstruction.includes("AUTHOR KNOWLEDGE SAFETY"));
  assert.ok(solarReturnInstruction.includes("No calcular astrología"));
  assert.ok(solarReturnInstruction.includes("La Carta Natal es siempre la matriz"));
  assert.ok(
    solarReturnInstruction.includes("de un cumpleaños al cumpleaños siguiente"),
  );

  for (const marker of NATAL_FORMAT_MARKERS) {
    assert.equal(
      CRISTAL_PAULA_CORE.includes(marker),
      false,
      `core contains natal format marker: ${marker}`,
    );
    assert.equal(
      transitInstruction.includes(marker),
      false,
      `transit instruction contains natal format marker: ${marker}`,
    );
    assert.equal(
      solarReturnInstruction.includes(marker),
      false,
      `solar return instruction contains natal format marker: ${marker}`,
    );
  }

  assert.equal(TRANSIT_ANALYSIS_REPORT_SECTION_IDS.length, 6);
  for (const sectionId of TRANSIT_ANALYSIS_REPORT_SECTION_IDS) {
    assert.ok(
      transitInstruction.includes(sectionId),
      `transit instruction missing ${sectionId}`,
    );
    assert.ok(
      transitInstruction.includes(
        TRANSIT_ANALYSIS_REPORT_SECTION_LABELS[sectionId],
      ),
      `transit instruction missing label ${sectionId}`,
    );
  }

  for (const name of TRANSIT_AUTHOR_NAMES) {
    assert.ok(transitInstruction.includes(name), `missing transit author ${name}`);
  }
  assert.ok(transitInstruction.includes("AUTHOR KNOWLEDGE SAFETY"));
  assert.ok(
    transitInstruction.includes(
      "únicamente como orientación metodológica interna",
    ),
  );

  assert.ok(
    transitInstruction.indexOf(CRISTAL_PAULA_CORE) <
      transitInstruction.indexOf(TRANSIT_REFERENCE_LENSES),
  );
  assert.ok(
    transitInstruction.indexOf(TRANSIT_REFERENCE_LENSES) <
      transitInstruction.indexOf(TRANSIT_ANALYSIS_INSTRUCTIONS),
  );
  assert.equal(CRISTAL_PAULA_CORE.includes("SYMBOL"), false);
  assert.ok(CRISTAL_PAULA_CORE.includes("SÍMBOLO"));
  assert.ok(CRISTAL_PAULA_CORE.includes("HIPÓTESIS"));
  assert.ok(CRISTAL_PAULA_CORE.includes("INTERVENCIÓN"));
  assert.ok(CRISTAL_PAULA_CORE.includes("INTEGRACIÓN SIMBÓLICA"));
  assert.ok(CRISTAL_PAULA_CORE.includes("Byron Katie"));
  assert.ok(CRISTAL_PAULA_CORE.includes("Joe Dispenza"));
  assert.ok(CRISTAL_PAULA_CORE.includes("Teoría polivagal"));
  assert.ok(CRISTAL_PAULA_CORE.includes("neuroplasticidad"));
  assert.ok(CRISTAL_PAULA_CORE.includes("Psicopedagogía"));
  assert.ok(CRISTAL_PAULA_CORE.includes("Arteterapia y Mandala Evolutivo"));
  assert.ok(CRISTAL_PAULA_CORE.includes("Astrología sistémica y astrogenealogía"));

  const natalPromptSource = readFileSync(
    path.join(DIRNAME, "../natal-chart/prompt.ts"),
    "utf8",
  );
  const transitPromptSource = readFileSync(
    path.join(DIRNAME, "../transits/prompt.ts"),
    "utf8",
  );
  const solarReturnPromptSource = readFileSync(
    path.join(DIRNAME, "../solar-returns/prompt.ts"),
    "utf8",
  );
  assert.ok(natalPromptSource.includes("PAULA_LENS"));
  assert.equal(natalPromptSource.includes("CRISTAL_PAULA_CORE"), false);
  assert.ok(transitPromptSource.includes("CRISTAL_PAULA_CORE"));
  assert.equal(transitPromptSource.includes("PAULA_LENS"), false);
  assert.ok(solarReturnPromptSource.includes("CRISTAL_PAULA_CORE"));
  assert.ok(solarReturnPromptSource.includes("SOLAR_RETURN_REFERENCE_LENSES"));
  assert.equal(solarReturnPromptSource.includes("PAULA_LENS"), false);
  assert.equal(solarReturnPromptSource.includes("TRANSIT_REFERENCE_LENSES"), false);
}

run();
console.log("prompt composition tests ok");
