import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  TRANSIT_ANALYSIS_REPORT_DETAIL_COLUMNS,
  TRANSIT_ANALYSIS_REPORT_SUMMARY_COLUMNS,
  TRANSIT_ANALYSIS_REPORT_VERSION,
  TRANSIT_METHODOLOGY_VERSION,
  getLatestTransitAnalysisReportSummary,
  isLatestTransitAnalysisReportSummary,
  mapTransitAnalysisReportRow,
  parseStoredTransitAnalysisReport,
  shouldShowExistingTransitReportsEditNotice,
  sortTransitAnalysisReportSummariesLatestFirst,
  transitAnalysisReportOwnershipMatches,
  type TransitAnalysisReportSummary,
} from "@/lib/reports";
import { createSampleTransitAnalysisReport } from "./sample";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIRNAME, "../../../..");
const MIGRATION_NAME = "20260902183000_create_transit_analysis_reports.sql";

function summary(input: {
  id: string;
  generatedAt: string;
}): TransitAnalysisReportSummary {
  return {
    id: input.id,
    clientId: "ffffffff-1111-4222-8333-444444444444",
    transitAnalysisId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
    reportVersion: TRANSIT_ANALYSIS_REPORT_VERSION,
    methodologyVersion: TRANSIT_METHODOLOGY_VERSION,
    generatedAt: input.generatedAt,
    createdAt: input.generatedAt,
    status: "draft",
  };
}

function run() {
  const report = createSampleTransitAnalysisReport();
  const parsed = parseStoredTransitAnalysisReport(report);
  assert.ok(parsed);
  assert.equal(parsed.metadata.reportVersion, TRANSIT_ANALYSIS_REPORT_VERSION);
  assert.equal(
    parsed.metadata.methodologyVersion,
    TRANSIT_METHODOLOGY_VERSION,
  );
  assert.deepEqual(Object.keys(parsed).filter((key) => key !== "metadata"), [
    "mandalaImpact",
    "activatedAreas",
    "evolutionaryChallenges",
    "availableResources",
    "opportunities",
    "learnings",
  ]);

  const mapped = mapTransitAnalysisReportRow({
    id: "bbbbbbbb-cccc-4ddd-8eee-ffffffffffff",
    client_id: "ffffffff-1111-4222-8333-444444444444",
    transit_analysis_id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
    report,
    generated_report: report,
    report_version: report.metadata.reportVersion,
    methodology_version: report.metadata.methodologyVersion,
    generated_at: report.metadata.generatedAt,
    created_at: "2026-09-02T18:01:00.000Z",
    status: "draft",
  });
  assert.ok(mapped);
  assert.equal(mapped.report.metadata.generatedAt, report.metadata.generatedAt);
  assert.deepEqual(mapped.generatedReport, mapped.report);
  assert.equal(mapped.status, "draft");

  assert.equal(parseStoredTransitAnalysisReport({ mandalaImpact: "no" }), null);

  const first = summary({
    id: "11111111-1111-4111-8111-111111111111",
    generatedAt: "2026-09-02T10:00:00.000Z",
  });
  const second = summary({
    id: "22222222-2222-4222-8222-222222222222",
    generatedAt: "2026-09-02T12:00:00.000Z",
  });
  const third = summary({
    id: "33333333-3333-4333-8333-333333333333",
    generatedAt: "2026-09-02T11:00:00.000Z",
  });
  const ordered = sortTransitAnalysisReportSummariesLatestFirst([
    first,
    second,
    third,
  ]);
  assert.deepEqual(
    ordered.map((item) => item.id),
    [second.id, third.id, first.id],
  );
  assert.equal(getLatestTransitAnalysisReportSummary(ordered)?.id, second.id);
  assert.equal(isLatestTransitAnalysisReportSummary(second, ordered), true);
  assert.equal(isLatestTransitAnalysisReportSummary(first, ordered), false);

  assert.equal(
    transitAnalysisReportOwnershipMatches({
      reportClientId: first.clientId,
      reportTransitAnalysisId: first.transitAnalysisId,
      expectedClientId: first.clientId,
      expectedTransitAnalysisId: first.transitAnalysisId,
    }),
    true,
  );
  assert.equal(
    transitAnalysisReportOwnershipMatches({
      reportClientId: first.clientId,
      reportTransitAnalysisId: first.transitAnalysisId,
      expectedClientId: "99999999-9999-4999-8999-999999999999",
      expectedTransitAnalysisId: first.transitAnalysisId,
    }),
    false,
  );

  assert.equal(shouldShowExistingTransitReportsEditNotice(0), false);
  assert.equal(shouldShowExistingTransitReportsEditNotice(1), true);
  assert.equal(shouldShowExistingTransitReportsEditNotice(3), true);

  assert.equal(
    (TRANSIT_ANALYSIS_REPORT_SUMMARY_COLUMNS as readonly string[]).includes(
      "report",
    ),
    false,
  );
  assert.ok(
    (TRANSIT_ANALYSIS_REPORT_DETAIL_COLUMNS as readonly string[]).includes(
      "report",
    ),
  );

  const migration = readFileSync(
    path.join(ROOT, "supabase/migrations", MIGRATION_NAME),
    "utf8",
  );
  const previousMigration = readFileSync(
    path.join(
      ROOT,
      "supabase/migrations/20260901195300_create_transit_analyses.sql",
    ),
    "utf8",
  );
  const repository = readFileSync(path.join(DIRNAME, "repository.ts"), "utf8");
  const actionSource = readFileSync(
    path.join(ROOT, "src/lib/ai/transits/actions.ts"),
    "utf8",
  );
  const generateSource = readFileSync(
    path.join(ROOT, "src/lib/ai/transits/generate.ts"),
    "utf8",
  );
  const panelSource = readFileSync(
    path.join(ROOT, "src/components/reports/TransitAnalysisPanel.tsx"),
    "utf8",
  );
  const historySource = readFileSync(
    path.join(ROOT, "src/components/reports/TransitAnalysisReportsSection.tsx"),
    "utf8",
  );
  const detailSource = readFileSync(
    path.join(
      ROOT,
      "src/app/clients/[id]/transits/[transitAnalysisId]/reports/[reportId]/page.tsx",
    ),
    "utf8",
  );
  const editSource = readFileSync(
    path.join(
      ROOT,
      "src/app/clients/[id]/transits/[transitAnalysisId]/edit/page.tsx",
    ),
    "utf8",
  );
  const natalRepository = readFileSync(
    path.join(ROOT, "src/lib/reports/natal-chart/repository.ts"),
    "utf8",
  );
  const natalActions = readFileSync(
    path.join(ROOT, "src/lib/ai/natal-chart/actions.ts"),
    "utf8",
  );
  const natalMigration = readFileSync(
    path.join(
      ROOT,
      "supabase/migrations/20260827211000_create_natal_chart_reports.sql",
    ),
    "utf8",
  );

  assert.ok(migration.includes("CREATE TABLE public.transit_analysis_reports"));
  assert.ok(
    migration.includes("REFERENCES public.clients (id) ON DELETE CASCADE"),
  );
  assert.ok(
    migration.includes(
      "REFERENCES public.transit_analyses (id) ON DELETE CASCADE",
    ),
  );
  assert.ok(
    migration.includes(
      "(transit_analysis_id, generated_at DESC)",
    ),
  );
  assert.ok(migration.includes("(client_id, generated_at DESC)"));
  assert.equal(migration.includes("UNIQUE (transit_analysis_id)"), false);
  assert.ok(migration.includes("ENABLE ROW LEVEL SECURITY"));
  assert.ok(migration.includes("FOR SELECT"));
  assert.ok(migration.includes("FOR INSERT"));
  assert.ok(migration.includes("FOR DELETE"));
  assert.equal(migration.includes("FOR UPDATE"), false);
  assert.ok(migration.includes("clients.user_id = auth.uid()"));
  assert.ok(
    migration.includes(
      "transit_analyses.client_id = transit_analysis_reports.client_id",
    ),
  );
  assert.ok(migration.includes("REVOKE ALL ON TABLE"));
  assert.ok(migration.includes("GRANT SELECT, INSERT, DELETE"));
  assert.equal(migration.includes("service_role"), false);
  assert.ok(!migration.includes("TO anon;"));
  assert.ok(migration.includes("No hay snapshot"));
  assert.equal(previousMigration.includes("transit_analysis_reports"), false);

  assert.ok(repository.includes("export async function saveTransitAnalysisReport"));
  assert.ok(repository.includes("export async function listTransitAnalysisReports"));
  assert.ok(repository.includes("export async function getTransitAnalysisReportById"));
  assert.ok(repository.includes("export async function getLatestTransitAnalysisReport"));
  assert.ok(repository.includes("export async function deleteTransitAnalysisReport"));
  assert.ok(repository.includes("export async function countTransitAnalysisReports"));
  assert.ok(repository.includes("TRANSIT_ANALYSIS_REPORT_SUMMARY_SELECT"));
  assert.ok(repository.includes("TRANSIT_ANALYSIS_REPORT_FULL_SELECT"));
  assert.ok(repository.includes('.order("generated_at", { ascending: false })'));
  assert.ok(repository.includes(".limit(1)"));
  assert.ok(repository.includes(".eq(\"client_id\", input.clientId)"));
  assert.ok(repository.includes(".eq(\"transit_analysis_id\", input.transitAnalysisId)"));
  assert.ok(repository.includes("report_version: parsed.data.metadata.reportVersion"));
  assert.ok(
    repository.includes(
      "methodology_version: parsed.data.metadata.methodologyVersion",
    ),
  );
  assert.ok(repository.includes("generated_report: parsed.data"));
  assert.ok(repository.includes("status: TRANSIT_ANALYSIS_REPORT_DEFAULT_STATUS"));
  assert.equal(repository.includes("createSupabaseBrowserClient"), false);
  assert.ok(repository.includes('from("transit_analyses")'));

  const listSelectIndex = repository.indexOf(
    "select(TRANSIT_ANALYSIS_REPORT_SUMMARY_SELECT)",
  );
  const detailSelectIndex = repository.indexOf(
    "getTransitAnalysisReportById",
  );
  const latestSelectIndex = repository.indexOf(
    "getLatestTransitAnalysisReport",
  );
  assert.ok(listSelectIndex >= 0);
  assert.ok(detailSelectIndex > listSelectIndex);
  assert.ok(repository.includes("TRANSIT_ANALYSIS_REPORT_FULL_SELECT"));
  assert.ok(latestSelectIndex >= 0);

  assert.equal(generateSource.includes("saveTransitAnalysisReport"), false);
  assert.equal(generateSource.includes('from("transit_analysis_reports")'), false);

  const persistCheckIndex = actionSource.indexOf("listTransitAnalysisReports(");
  const geminiIndex = actionSource.indexOf("generateTransitAnalysisReport(");
  const saveIndex = actionSource.indexOf("saveTransitAnalysisReport(");
  const failSaveIndex = actionSource.indexOf('fail("save_error"');
  const successLogIndex = actionSource.indexOf('stage: "success"');
  const redirectIndex = actionSource.lastIndexOf("redirect(");

  assert.ok(persistCheckIndex >= 0);
  assert.ok(geminiIndex > persistCheckIndex);
  assert.ok(saveIndex > geminiIndex);
  assert.ok(failSaveIndex > saveIndex);
  assert.ok(successLogIndex > saveIndex);
  assert.ok(redirectIndex > saveIndex);
  assert.ok(redirectIndex > failSaveIndex);
  assert.ok(actionSource.includes("/reports/${saved.data}"));
  assert.ok(actionSource.includes("reportId: saved.data"));
  assert.ok(actionSource.includes("transitAnalysisId: loadedTransit.data.id"));
  assert.equal(actionSource.includes("firstName"), true);
  const successLogBlock = actionSource.slice(successLogIndex, successLogIndex + 420);
  assert.equal(successLogBlock.includes("firstName"), false);
  assert.equal(successLogBlock.includes("natalChart"), false);
  assert.equal(successLogBlock.includes("content"), false);

  const catchIndex = actionSource.indexOf("} catch (error) {");
  assert.ok(catchIndex > geminiIndex);
  assert.ok(saveIndex > catchIndex);

  assert.ok(panelSource.includes("disabled={isPending}"));
  assert.ok(panelSource.includes("Generando informe..."));
  assert.ok(panelSource.includes("submitLockRef"));
  assert.equal(panelSource.includes("TransitAnalysisReportView"), false);
  assert.ok(panelSource.includes("Generar nuevo informe"));
  assert.equal(panelSource.includes("<Card"), false);

  assert.ok(panelSource.includes("Informes generados"));
  assert.ok(historySource.includes("Más reciente"));
  assert.ok(historySource.includes("Ver informe →"));
  assert.ok(historySource.includes("TransitAnalysisPanel"));
  assert.equal(historySource.includes("summary.report."), false);

  assert.ok(detailSource.includes("TransitAnalysisReportView"));
  assert.ok(detailSource.includes("getTransitAnalysisReportById"));
  assert.equal(detailSource.includes("NatalChartReportEditor"), false);
  assert.equal(detailSource.includes("DownloadReportPdfButton"), false);
  assert.equal(detailSource.includes("NatalChartReportStatus"), false);

  assert.ok(editSource.includes("shouldShowExistingTransitReportsEditNotice"));
  assert.ok(editSource.includes("EXISTING_TRANSIT_REPORTS_EDIT_NOTICE_BODY"));
  assert.ok(editSource.includes("countTransitAnalysisReports"));

  assert.equal(natalRepository.includes("transit_analysis_reports"), false);
  assert.equal(natalActions.includes("saveTransitAnalysisReport"), false);
  assert.equal(natalMigration.includes("transit_analysis_reports"), false);
  assert.ok(natalRepository.includes("saveNatalChartReport"));
}

run();
console.log("transit analysis report persistence tests ok");
