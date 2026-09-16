import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "path";
import { fileURLToPath } from "node:url";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIRNAME, "../../../..");

function run() {
  const actionSource = readFileSync(path.join(DIRNAME, "actions.ts"), "utf8");
  const panelSource = readFileSync(
    path.join(ROOT, "src/components/reports/SolarReturnAnalysisPanel.tsx"),
    "utf8",
  );
  const generateSource = readFileSync(path.join(DIRNAME, "generate.ts"), "utf8");

  assert.ok(panelSource.includes('name="clientId"'));
  assert.ok(panelSource.includes('name="solarReturnId"'));
  assert.equal(panelSource.includes("natalChart"), false);
  assert.equal(panelSource.includes("positions"), false);
  assert.equal(panelSource.includes("JSON.stringify"), false);
  assert.ok(panelSource.includes("disabled={isPending}"));
  assert.ok(panelSource.includes("submitLockRef"));
  assert.ok(panelSource.includes("Generar nuevo informe"));
  assert.ok(panelSource.includes("generateSolarReturnAnalysisAction"));

  const formDataReads = [
    ...actionSource.matchAll(/formData\.get\("([^"]+)"\)/g),
  ].map((match) => match[1]);
  assert.deepEqual(formDataReads, ["clientId", "solarReturnId"]);

  assert.ok(actionSource.includes("getClientById"));
  assert.ok(actionSource.includes("getSolarReturnById"));
  assert.ok(
    actionSource.includes(
      "loadedSolarReturn.data.clientId !== loadedClient.data.id",
    ),
  );
  assert.ok(actionSource.includes("createSolarReturnReport"));
  assert.ok(actionSource.includes("revalidatePath"));
  assert.ok(actionSource.includes('from "@/lib/reports/solar-returns/repository"'));
  assert.equal(actionSource.includes("formData.get(\"report\")"), false);
  assert.equal(actionSource.includes("formData.get(\"natalChart\")"), false);

  const catchIndex = actionSource.indexOf("} catch (error) {");
  const saveIndex = actionSource.indexOf("createSolarReturnReport(");
  const geminiIndex = actionSource.indexOf("generateSolarReturnReport(");
  assert.ok(catchIndex > geminiIndex);
  assert.ok(saveIndex > catchIndex);

  assert.equal(generateSource.includes("createSolarReturnReport"), false);
  assert.equal(generateSource.includes("revalidatePath"), false);
  assert.ok(generateSource.includes("metadata: {") === false);
  assert.ok(generateSource.includes("assembleSolarReturnReportFromModelOutput"));
}

run();
console.log("solar return action contract tests ok");
