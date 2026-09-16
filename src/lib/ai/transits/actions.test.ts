import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "path";
import { fileURLToPath } from "node:url";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIRNAME, "../../../..");

function run() {
  const actionSource = readFileSync(path.join(DIRNAME, "actions.ts"), "utf8");
  const panelSource = readFileSync(
    path.join(ROOT, "src/components/reports/TransitAnalysisPanel.tsx"),
    "utf8",
  );
  const generateSource = readFileSync(path.join(DIRNAME, "generate.ts"), "utf8");

  assert.ok(panelSource.includes('name="clientId"'));
  assert.ok(panelSource.includes('name="transitAnalysisId"'));
  assert.equal(panelSource.includes("natalChart"), false);
  assert.equal(panelSource.includes("positions"), false);
  assert.equal(panelSource.includes("eclipses"), false);
  assert.equal(panelSource.includes("JSON.stringify"), false);
  assert.ok(panelSource.includes("disabled={isPending}"));
  assert.ok(panelSource.includes("submitLockRef"));

  const formDataReads = [
    ...actionSource.matchAll(/formData\.get\("([^"]+)"\)/g),
  ].map((match) => match[1]);
  assert.deepEqual(formDataReads, ["clientId", "transitAnalysisId"]);

  assert.ok(actionSource.includes("saveTransitAnalysisReport"));
  assert.ok(
    actionSource.includes("loadedTransit.data.clientId !== loadedClient.data.id"),
  );
  assert.ok(actionSource.includes("revalidatePath"));
  assert.ok(actionSource.includes('from "@/lib/reports/transits/repository"'));
  assert.equal(actionSource.includes("formData.get(\"report\")"), false);

  assert.equal(generateSource.includes("saveNatalChartReport"), false);
  assert.equal(generateSource.includes("saveTransitAnalysisReport"), false);
  assert.equal(generateSource.includes("revalidatePath"), false);
  assert.ok(generateSource.includes("metadata: {"));
  assert.ok(generateSource.includes("TRANSIT_ANALYSIS_REPORT_VERSION"));
  assert.ok(generateSource.includes("TRANSIT_METHODOLOGY_VERSION"));
}

run();
console.log("transit analysis action contract tests ok");
