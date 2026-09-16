import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  NATAL_CHART_REPORT_DEFAULT_STATUS,
  NATAL_CHART_REPORT_STATUS_LABELS,
  NATAL_CHART_REPORT_STATUSES,
} from "./status";
import { shouldOfferPrepareClientReport } from "./primary-action";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIRNAME, "../../../..");
const EDITORIAL_MIGRATION =
  "20260827220000_add_generated_report_to_natal_chart_reports.sql";

function readRepo(...parts: string[]) {
  return readFileSync(path.join(ROOT, ...parts), "utf8");
}

function run() {
  assert.deepEqual([...NATAL_CHART_REPORT_STATUSES], [
    "draft",
    "reviewed",
    "ready",
  ]);
  assert.equal(NATAL_CHART_REPORT_DEFAULT_STATUS, "draft");
  assert.equal(NATAL_CHART_REPORT_STATUS_LABELS.draft, "Borrador");
  assert.equal(NATAL_CHART_REPORT_STATUS_LABELS.reviewed, "Revisado");
  assert.equal(NATAL_CHART_REPORT_STATUS_LABELS.ready, "Listo para entregar");

  assert.equal(
    shouldOfferPrepareClientReport({ status: "draft", hasClientReport: false }),
    false,
  );
  assert.equal(
    shouldOfferPrepareClientReport({
      status: "reviewed",
      hasClientReport: false,
    }),
    false,
  );
  assert.equal(
    shouldOfferPrepareClientReport({ status: "ready", hasClientReport: true }),
    false,
  );
  assert.equal(
    shouldOfferPrepareClientReport({ status: "ready", hasClientReport: false }),
    true,
  );

  const migration = readRepo("supabase/migrations", EDITORIAL_MIGRATION);
  assert.ok(migration.includes("ADD COLUMN generated_report jsonb"));
  assert.ok(
    migration.includes("protect_natal_chart_report_generation") ||
      migration.includes("NEW.generated_report IS DISTINCT FROM OLD.generated_report"),
  );

  const repository = readRepo("src/lib/reports/natal-chart/repository.ts");
  const saveIndex = repository.indexOf(
    "export async function saveNatalChartReport",
  );
  const updateIndex = repository.indexOf(
    "export async function updateNatalChartReport(",
  );
  const statusIndex = repository.indexOf(
    "export async function updateNatalChartReportStatus",
  );
  assert.ok(saveIndex >= 0);
  assert.ok(updateIndex > saveIndex);
  assert.ok(statusIndex > updateIndex);

  const saveFn = repository.slice(saveIndex, updateIndex);
  assert.ok(saveFn.includes("generated_report: parsed.data"));
  assert.ok(saveFn.includes("report: parsed.data"));
  assert.ok(saveFn.includes("status: NATAL_CHART_REPORT_DEFAULT_STATUS"));

  const professionalUpdate = repository.slice(updateIndex, statusIndex);
  assert.ok(professionalUpdate.includes("report: parsed.data"));
  assert.equal(professionalUpdate.includes("generated_report"), false);
  assert.ok(professionalUpdate.includes("applyProfessionalEdits"));

  const statusUpdate = repository.slice(
    statusIndex,
    repository.indexOf("function mapSummaryRow"),
  );
  assert.ok(statusUpdate.includes(".update({ status: input.status })"));
  assert.equal(statusUpdate.includes("generated_report"), false);
  assert.equal(statusUpdate.includes("report:"), false);

  const editorialActions = readRepo("src/lib/reports/natal-chart/actions.ts");
  assert.equal(editorialActions.includes("@google/genai"), false);
  assert.equal(editorialActions.includes("generateNatalChartReport"), false);

  const originalPage = readRepo(
    "src/app/clients/[id]/reports/[reportId]/original/page.tsx",
  );
  const professionalPage = readRepo(
    "src/app/clients/[id]/reports/[reportId]/page.tsx",
  );
  assert.ok(originalPage.includes("stored.generatedReport"));
  assert.equal(originalPage.includes("stored.report"), false);
  assert.ok(professionalPage.includes("stored.report"));

  const professionalPdfRoute = readRepo(
    "src/app/api/clients/[id]/reports/[reportId]/pdf/route.ts",
  );
  const clientPdfRoute = readRepo(
    "src/app/api/clients/[id]/reports/[reportId]/client/pdf/route.ts",
  );
  assert.ok(professionalPdfRoute.includes("reportResult.data.report"));
  assert.equal(professionalPdfRoute.includes("generatedReport"), false);
  assert.equal(professionalPdfRoute.includes("clientReport"), false);
  assert.ok(clientPdfRoute.includes("stored.data.clientReport"));
  assert.equal(clientPdfRoute.includes("generatedReport"), false);
  assert.equal(clientPdfRoute.includes("sourceOutdated"), false);
  assert.equal(clientPdfRoute.includes("@google/genai"), false);
}

run();
console.log("natal chart editorial flow tests ok");
