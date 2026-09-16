import assert from "node:assert/strict";
import { shouldShowExistingReportsEditNotice } from "./existing-reports-edit-notice";

function run() {
  assert.equal(shouldShowExistingReportsEditNotice(0), false);
  assert.equal(shouldShowExistingReportsEditNotice(1), true);
  assert.equal(shouldShowExistingReportsEditNotice(3), true);
}

run();
console.log("existing reports edit notice tests ok");
