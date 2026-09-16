import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NARRATIVE_NATAL_CHART_REPORT_SECTION_IDS } from "./constants";
import { applyProfessionalEdits } from "./editorial";
import { createProfessionalPdfSampleReport } from "./professional-pdf/sample";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

function run() {
  const original = createProfessionalPdfSampleReport();
  const edited = structuredClone(original);
  edited.metadata = {
    version: "9.9",
    generatedAt: "2099-01-01T00:00:00.000Z",
  };
  edited.identity = {
    content: "Identidad editada por la profesional.",
    astrologicalBasis: ["Evidencia inventada en Casa 99"],
  };

  const next = applyProfessionalEdits(original, edited);

  assert.deepEqual(next.metadata, original.metadata);
  assert.notDeepEqual(next.metadata, edited.metadata);
  assert.equal(next.identity.content, "Identidad editada por la profesional.");
  assert.deepEqual(
    next.identity.astrologicalBasis,
    original.identity.astrologicalBasis,
  );

  for (const sectionId of NARRATIVE_NATAL_CHART_REPORT_SECTION_IDS) {
    assert.deepEqual(
      next[sectionId].astrologicalBasis,
      original[sectionId].astrologicalBasis,
    );
  }

  const natalActions = readFileSync(path.join(DIRNAME, "actions.ts"), "utf8");
  const professionalUpdate = natalActions.slice(
    natalActions.indexOf("export async function updateNatalChartProfessionalReport"),
    natalActions.indexOf("export async function updateNatalChartReportStatus"),
  );
  const statusUpdate = natalActions.slice(
    natalActions.indexOf("export async function updateNatalChartReportStatus"),
  );

  assert.ok(professionalUpdate.includes("revalidateNatalChartReportPaths"));
  assert.ok(statusUpdate.includes("revalidateNatalChartReportPaths"));
  assert.ok(natalActions.includes("${reportBase}/original"));
  assert.ok(
    natalActions.includes(
      "revalidatePath(`${reportBase}/original`)",
    ),
  );
}

run();
console.log("professional editorial tests ok");
