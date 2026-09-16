import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  decideNatalChartGenerationFromClientLoad,
  shouldCallGeminiForNatalChartGeneration,
} from "./generation-guard";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

function run() {
  const loadFailed = decideNatalChartGenerationFromClientLoad("error");
  assert.deepEqual(loadFailed, { kind: "fail", code: "load_error" });
  assert.equal(shouldCallGeminiForNatalChartGeneration(loadFailed), false);

  const loaded = decideNatalChartGenerationFromClientLoad("ok");
  assert.deepEqual(loaded, { kind: "proceed" });
  assert.equal(shouldCallGeminiForNatalChartGeneration(loaded), true);

  const actionSource = readFileSync(path.join(DIRNAME, "actions.ts"), "utf8");
  const formDataReads = [
    ...actionSource.matchAll(/formData\.get\("([^"]+)"\)/g),
  ].map((match) => match[1]);
  assert.deepEqual(formDataReads, ["clientId"]);
  assert.ok(actionSource.includes("getClientById"));
  assert.ok(actionSource.includes("saveNatalChartReport"));
  const guardIndex = actionSource.indexOf(
    "decideNatalChartGenerationFromClientLoad",
  );
  const failIndex = actionSource.indexOf('clientDecision.kind === "fail"');
  const geminiIndex = actionSource.indexOf("generateNatalChartReport(");
  const saveIndex = actionSource.indexOf("saveNatalChartReport(");

  assert.ok(guardIndex >= 0);
  assert.ok(failIndex > guardIndex);
  assert.ok(geminiIndex > failIndex);
  assert.ok(saveIndex > geminiIndex);
}

run();
console.log("natal chart generation guard tests ok");
