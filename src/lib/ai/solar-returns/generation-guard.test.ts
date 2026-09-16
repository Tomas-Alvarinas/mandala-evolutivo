import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  decideSolarReturnGenerationFromClientLoad,
  decideSolarReturnGenerationFromSolarReturnLoad,
  shouldCallGeminiForSolarReturnGeneration,
} from "./generation-guard";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

function run() {
  const natalFailed = decideSolarReturnGenerationFromClientLoad("error");
  assert.deepEqual(natalFailed, { kind: "fail", code: "load_error" });
  assert.equal(
    shouldCallGeminiForSolarReturnGeneration(natalFailed, {
      kind: "proceed",
    }),
    false,
  );

  const natalOk = decideSolarReturnGenerationFromClientLoad("ok");
  assert.deepEqual(natalOk, { kind: "proceed" });
  assert.equal(shouldCallGeminiForSolarReturnGeneration(natalOk), false);

  const solarFailed = decideSolarReturnGenerationFromSolarReturnLoad("error");
  assert.deepEqual(solarFailed, {
    kind: "fail",
    code: "solar_return_load_error",
  });
  assert.equal(
    shouldCallGeminiForSolarReturnGeneration(natalOk, solarFailed),
    false,
  );

  const solarOk = decideSolarReturnGenerationFromSolarReturnLoad("ok");
  assert.equal(
    shouldCallGeminiForSolarReturnGeneration(natalOk, solarOk),
    true,
  );

  const actionSource = readFileSync(path.join(DIRNAME, "actions.ts"), "utf8");
  const clientGuardIndex = actionSource.indexOf(
    "const clientDecision = decideSolarReturnGenerationFromClientLoad",
  );
  const clientFailIndex = actionSource.indexOf(
    'clientDecision.kind === "fail"',
  );
  const solarGuardIndex = actionSource.indexOf(
    "const solarReturnDecision = decideSolarReturnGenerationFromSolarReturnLoad",
  );
  const solarFailIndex = actionSource.indexOf(
    'solarReturnDecision.kind === "fail"',
  );
  const geminiIndex = actionSource.indexOf("generateSolarReturnReport(");
  const persistCheckIndex = actionSource.indexOf("listSolarReturnReports(");
  const saveIndex = actionSource.indexOf("createSolarReturnReport(");

  assert.ok(clientGuardIndex >= 0);
  assert.ok(clientFailIndex > clientGuardIndex);
  assert.ok(solarGuardIndex > clientFailIndex);
  assert.ok(solarFailIndex > solarGuardIndex);
  assert.ok(persistCheckIndex > solarFailIndex);
  assert.ok(geminiIndex > persistCheckIndex);
  assert.ok(saveIndex > geminiIndex);
}

run();
console.log("solar return generation guard tests ok");
