import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  classifyPendingTransitAnalysisWork,
  getPendingTransitAnalysisWorkHref,
} from "./pending-work";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

function run() {
  assert.equal(
    classifyPendingTransitAnalysisWork({
      status: "draft",
      hasClientReport: false,
    }),
    "draft",
  );
  assert.equal(
    classifyPendingTransitAnalysisWork({
      status: "reviewed",
      hasClientReport: false,
    }),
    "reviewed",
  );
  assert.equal(
    classifyPendingTransitAnalysisWork({
      status: "ready",
      hasClientReport: false,
    }),
    "ready_without_client_report",
  );
  assert.equal(
    classifyPendingTransitAnalysisWork({
      status: "ready",
      hasClientReport: true,
    }),
    null,
  );

  assert.equal(
    getPendingTransitAnalysisWorkHref({
      clientId: "client-1",
      transitAnalysisId: "analysis-1",
      reportId: "report-1",
    }),
    "/clients/client-1/transits/analysis-1/reports/report-1",
  );

  const repository = readFileSync(
    path.join(DIRNAME, "repository.ts"),
    "utf8",
  );
  assert.ok(repository.includes("updatedAt: row.created_at"));
  assert.ok(repository.includes("formatIsoDateOnlyEs"));
  assert.ok(repository.includes("transit_analyses!inner(analysis_date)"));
}

run();
console.log("pending transit analysis work tests ok");
