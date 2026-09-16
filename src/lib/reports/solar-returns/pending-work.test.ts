import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  classifyPendingSolarReturnWork,
  getPendingSolarReturnWorkHref,
} from "./pending-work";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

function run() {
  assert.equal(
    classifyPendingSolarReturnWork({
      status: "draft",
      hasClientReport: false,
    }),
    "draft",
  );
  assert.equal(
    classifyPendingSolarReturnWork({
      status: "reviewed",
      hasClientReport: false,
    }),
    "reviewed",
  );
  assert.equal(
    classifyPendingSolarReturnWork({
      status: "ready",
      hasClientReport: false,
    }),
    "ready_without_client_report",
  );
  assert.equal(
    classifyPendingSolarReturnWork({
      status: "ready",
      hasClientReport: true,
    }),
    null,
  );

  assert.equal(
    getPendingSolarReturnWorkHref({
      clientId: "client-1",
      solarReturnId: "solar-1",
      reportId: "report-1",
    }),
    "/clients/client-1/solar-returns/solar-1/reports/report-1",
  );

  const repository = readFileSync(
    path.join(DIRNAME, "repository.ts"),
    "utf8",
  );
  assert.ok(repository.includes("updatedAt: row.updated_at"));
  assert.ok(repository.includes("formatSolarReturnPeriodYears"));
}

run();
console.log("pending solar return work tests ok");
