import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  EXISTING_TRANSIT_REPORTS_EDIT_NOTICE_BODY,
  shouldShowExistingTransitReportsEditNotice,
} from "./existing-reports-edit-notice";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIRNAME, "../../../..");

function run() {
  assert.equal(shouldShowExistingTransitReportsEditNotice(0), false);
  assert.equal(shouldShowExistingTransitReportsEditNotice(1), true);
  assert.equal(shouldShowExistingTransitReportsEditNotice(3), true);
  assert.equal(
    EXISTING_TRANSIT_REPORTS_EDIT_NOTICE_BODY,
    "Los cambios en los datos de Tránsitos no modifican los análisis ya generados. Si querés reflejar los cambios, generá un nuevo análisis.",
  );

  const editPage = readFileSync(
    path.join(
      ROOT,
      "src/app/clients/[id]/transits/[transitAnalysisId]/edit/page.tsx",
    ),
    "utf8",
  );
  assert.ok(editPage.includes("shouldShowExistingTransitReportsEditNotice"));
  assert.ok(editPage.includes("EXISTING_TRANSIT_REPORTS_EDIT_NOTICE_BODY"));
  assert.ok(editPage.includes("countTransitAnalysisReports"));
}

run();
console.log("existing transit reports edit notice tests ok");
