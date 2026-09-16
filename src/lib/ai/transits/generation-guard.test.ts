import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  decideTransitGenerationFromClientLoad,
  decideTransitGenerationFromTransitLoad,
  shouldCallGeminiForTransitGeneration,
} from "./generation-guard";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

function run() {
  const natalFailed = decideTransitGenerationFromClientLoad("error");
  assert.deepEqual(natalFailed, { kind: "fail", code: "load_error" });
  assert.equal(
    shouldCallGeminiForTransitGeneration(natalFailed, {
      kind: "proceed",
    }),
    false,
  );

  const natalOk = decideTransitGenerationFromClientLoad("ok");
  assert.deepEqual(natalOk, { kind: "proceed" });
  assert.equal(shouldCallGeminiForTransitGeneration(natalOk), false);

  const transitFailed = decideTransitGenerationFromTransitLoad("error");
  assert.deepEqual(transitFailed, {
    kind: "fail",
    code: "transit_load_error",
  });
  assert.equal(
    shouldCallGeminiForTransitGeneration(natalOk, transitFailed),
    false,
  );

  const transitOk = decideTransitGenerationFromTransitLoad("ok");
  assert.equal(
    shouldCallGeminiForTransitGeneration(natalOk, transitOk),
    true,
  );

  const actionSource = readFileSync(path.join(DIRNAME, "actions.ts"), "utf8");
  const clientGuardIndex = actionSource.indexOf(
    "const clientDecision = decideTransitGenerationFromClientLoad",
  );
  const clientFailIndex = actionSource.indexOf(
    'clientDecision.kind === "fail"',
  );
  const transitGuardIndex = actionSource.indexOf(
    "const transitDecision = decideTransitGenerationFromTransitLoad",
  );
  const transitFailIndex = actionSource.indexOf(
    'transitDecision.kind === "fail"',
  );
  const geminiIndex = actionSource.indexOf("generateTransitAnalysisReport(");
  const persistCheckIndex = actionSource.indexOf("listTransitAnalysisReports(");
  const saveIndex = actionSource.indexOf("saveTransitAnalysisReport(");

  assert.ok(clientGuardIndex >= 0);
  assert.ok(clientFailIndex > clientGuardIndex);
  assert.ok(transitGuardIndex > clientFailIndex);
  assert.ok(transitFailIndex > transitGuardIndex);
  assert.ok(persistCheckIndex > transitFailIndex);
  assert.ok(geminiIndex > persistCheckIndex);
  assert.ok(saveIndex > geminiIndex);
}

run();
console.log("transit analysis generation guard tests ok");
