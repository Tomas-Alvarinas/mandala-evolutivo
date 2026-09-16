import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  SOLAR_RETURN_METHODOLOGY_VERSION,
  SOLAR_RETURN_REPORT_DETAIL_COLUMNS,
  SOLAR_RETURN_REPORT_SECTION_IDS,
  SOLAR_RETURN_REPORT_SUMMARY_COLUMNS,
  SOLAR_RETURN_REPORT_VERSION,
  getLatestSolarReturnReportSummary,
  isLatestSolarReturnReportSummary,
  mapSolarReturnReportRow,
  parseStoredSolarReturnReport,
  solarReturnReportOwnershipMatches,
  sortSolarReturnReportSummariesLatestFirst,
  type SolarReturnReportSummary,
} from "@/lib/reports";
import { createSampleSolarReturnReport } from "./sample";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIRNAME, "../../../..");
const MIGRATION_NAME = "20260907200000_create_solar_return_reports.sql";

function summary(input: {
  id: string;
  generatedAt: string;
}): SolarReturnReportSummary {
  return {
    id: input.id,
    clientId: "ffffffff-1111-4222-8333-444444444444",
    solarReturnId: "bbbbbbbb-cccc-4ddd-8eee-ffffffffffff",
    reportVersion: SOLAR_RETURN_REPORT_VERSION,
    methodologyVersion: SOLAR_RETURN_METHODOLOGY_VERSION,
    generatedAt: input.generatedAt,
    createdAt: input.generatedAt,
    status: "draft",
  };
}

function run() {
  const report = createSampleSolarReturnReport();
  const parsed = parseStoredSolarReturnReport(report);
  assert.ok(parsed);
  assert.equal(parsed.metadata.reportVersion, SOLAR_RETURN_REPORT_VERSION);
  assert.equal(
    parsed.metadata.methodologyVersion,
    SOLAR_RETURN_METHODOLOGY_VERSION,
  );
  assert.deepEqual(Object.keys(parsed).filter((key) => key !== "metadata"), [
    ...SOLAR_RETURN_REPORT_SECTION_IDS,
  ]);

  const mapped = mapSolarReturnReportRow({
    id: "cccccccc-dddd-4eee-8fff-000000000000",
    client_id: "ffffffff-1111-4222-8333-444444444444",
    solar_return_id: "bbbbbbbb-cccc-4ddd-8eee-ffffffffffff",
    report,
    report_version: report.metadata.reportVersion,
    methodology_version: report.metadata.methodologyVersion,
    generated_at: report.metadata.generatedAt,
    created_at: "2026-09-07T18:01:00.000Z",
    generated_report: report,
    status: "draft",
  });
  assert.ok(mapped);
  assert.equal(mapped.report.metadata.generatedAt, report.metadata.generatedAt);
  assert.deepEqual(mapped.generatedReport, mapped.report);
  assert.equal(mapped.status, "draft");

  assert.equal(parseStoredSolarReturnReport({ annualTheme: "no" }), null);

  const first = summary({
    id: "11111111-1111-4111-8111-111111111111",
    generatedAt: "2026-09-07T10:00:00.000Z",
  });
  const second = summary({
    id: "22222222-2222-4222-8222-222222222222",
    generatedAt: "2026-09-07T12:00:00.000Z",
  });
  const third = summary({
    id: "33333333-3333-4333-8333-333333333333",
    generatedAt: "2026-09-07T11:00:00.000Z",
  });
  const ordered = sortSolarReturnReportSummariesLatestFirst([
    first,
    second,
    third,
  ]);
  assert.deepEqual(
    ordered.map((item) => item.id),
    [second.id, third.id, first.id],
  );
  assert.equal(getLatestSolarReturnReportSummary(ordered)?.id, second.id);
  assert.equal(isLatestSolarReturnReportSummary(second, ordered), true);
  assert.equal(isLatestSolarReturnReportSummary(first, ordered), false);

  assert.equal(
    solarReturnReportOwnershipMatches({
      reportClientId: first.clientId,
      reportSolarReturnId: first.solarReturnId,
      expectedClientId: first.clientId,
      expectedSolarReturnId: first.solarReturnId,
    }),
    true,
  );
  assert.equal(
    solarReturnReportOwnershipMatches({
      reportClientId: first.clientId,
      reportSolarReturnId: first.solarReturnId,
      expectedClientId: "99999999-9999-4999-8999-999999999999",
      expectedSolarReturnId: first.solarReturnId,
    }),
    false,
  );

  assert.equal(
    (SOLAR_RETURN_REPORT_SUMMARY_COLUMNS as readonly string[]).includes("report"),
    false,
  );
  assert.ok(
    (SOLAR_RETURN_REPORT_DETAIL_COLUMNS as readonly string[]).includes("report"),
  );
  assert.ok(
    (SOLAR_RETURN_REPORT_DETAIL_COLUMNS as readonly string[]).includes("status"),
  );
  assert.ok(
    (SOLAR_RETURN_REPORT_DETAIL_COLUMNS as readonly string[]).includes(
      "generated_report",
    ),
  );

  const migration = readFileSync(
    path.join(ROOT, "supabase/migrations", MIGRATION_NAME),
    "utf8",
  );
  const previousMigration = readFileSync(
    path.join(
      ROOT,
      "supabase/migrations/20260907120000_create_solar_returns.sql",
    ),
    "utf8",
  );
  const repository = readFileSync(path.join(DIRNAME, "repository.ts"), "utf8");
  const actionSource = readFileSync(
    path.join(ROOT, "src/lib/ai/solar-returns/actions.ts"),
    "utf8",
  );
  const generateSource = readFileSync(
    path.join(ROOT, "src/lib/ai/solar-returns/generate.ts"),
    "utf8",
  );
  const panelSource = readFileSync(
    path.join(ROOT, "src/components/reports/SolarReturnAnalysisPanel.tsx"),
    "utf8",
  );
  const historySource = readFileSync(
    path.join(ROOT, "src/components/reports/SolarReturnReportsSection.tsx"),
    "utf8",
  );
  const detailSource = readFileSync(
    path.join(
      ROOT,
      "src/app/clients/[id]/solar-returns/[solarReturnId]/reports/[reportId]/page.tsx",
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
  const transitRepository = readFileSync(
    path.join(ROOT, "src/lib/reports/transits/repository.ts"),
    "utf8",
  );
  const transitActions = readFileSync(
    path.join(ROOT, "src/lib/ai/transits/actions.ts"),
    "utf8",
  );

  assert.ok(migration.includes("CREATE TABLE public.solar_return_reports"));
  assert.ok(
    migration.includes("REFERENCES public.clients (id) ON DELETE CASCADE"),
  );
  assert.ok(
    migration.includes("REFERENCES public.solar_returns (id) ON DELETE CASCADE"),
  );
  assert.ok(migration.includes("(solar_return_id, generated_at DESC)"));
  assert.ok(migration.includes("(client_id, generated_at DESC)"));
  assert.equal(migration.includes("UNIQUE (solar_return_id)"), false);
  assert.ok(migration.includes("ENABLE ROW LEVEL SECURITY"));
  assert.ok(migration.includes("FOR SELECT"));
  assert.ok(migration.includes("FOR INSERT"));
  assert.ok(migration.includes("FOR DELETE"));
  assert.equal(migration.includes("FOR UPDATE"), false);
  assert.ok(migration.includes("clients.user_id = auth.uid()"));
  assert.ok(
    migration.includes("solar_returns.client_id = solar_return_reports.client_id"),
  );
  assert.ok(migration.includes("REVOKE ALL ON TABLE"));
  assert.ok(migration.includes("GRANT SELECT, INSERT, DELETE"));
  assert.equal(migration.includes("service_role"), false);
  assert.ok(!migration.includes("TO anon;"));
  assert.equal(migration.includes("generated_report"), false);
  assert.equal(migration.includes("status text"), false);
  assert.ok(previousMigration.includes("CREATE TABLE public.solar_returns"));
  assert.equal(previousMigration.includes("solar_return_reports"), false);

  assert.ok(repository.includes("export async function createSolarReturnReport"));
  assert.ok(repository.includes("export async function getPendingSolarReturnWork"));
  assert.ok(repository.includes("export async function listSolarReturnReports"));
  assert.ok(repository.includes("export async function getSolarReturnReportById"));
  assert.ok(repository.includes('.order("generated_at", { ascending: false })'));
  assert.ok(repository.includes(".eq(\"client_id\", input.clientId)"));
  assert.ok(repository.includes(".eq(\"solar_return_id\", input.solarReturnId)"));
  assert.ok(repository.includes("generated_report: parsed.data"));
  assert.ok(repository.includes("status: SOLAR_RETURN_REPORT_DEFAULT_STATUS"));
  assert.equal(repository.includes("createSupabaseBrowserClient"), false);
  assert.ok(repository.includes('from("solar_returns")'));

  assert.equal(generateSource.includes("createSolarReturnReport"), false);
  assert.equal(generateSource.includes('from("solar_return_reports")'), false);

  const persistCheckIndex = actionSource.indexOf("listSolarReturnReports(");
  const geminiIndex = actionSource.indexOf("generateSolarReturnReport(");
  const saveIndex = actionSource.indexOf("createSolarReturnReport(");
  const failSaveIndex = actionSource.indexOf('fail("save_error"');
  const catchIndex = actionSource.indexOf("} catch (error) {");

  assert.ok(persistCheckIndex >= 0);
  assert.ok(geminiIndex > persistCheckIndex);
  assert.ok(catchIndex > geminiIndex);
  assert.ok(saveIndex > catchIndex);
  assert.ok(failSaveIndex > saveIndex);
  assert.ok(actionSource.includes("/reports/${saved.data}"));

  assert.ok(panelSource.includes("Generar nuevo informe"));
  assert.ok(panelSource.includes("disabled={isPending}"));
  assert.ok(historySource.includes("Más reciente"));
  assert.ok(historySource.includes("Ver informe →"));
  assert.ok(historySource.includes("Todavía no hay informes generados."));
  assert.ok(historySource.includes("SolarReturnReportStatusBadge"));
  assert.equal(historySource.includes("summary.report."), false);

  assert.ok(detailSource.includes("SolarReturnReportView"));
  assert.ok(detailSource.includes("getSolarReturnReportById"));
  assert.ok(detailSource.includes("stored.report"));
  assert.equal(detailSource.includes("NatalChartReportEditor"), false);
  assert.equal(detailSource.includes("DownloadReportPdfButton"), false);
  assert.ok(detailSource.includes("getSolarReturnClientReportByProfessionalReportId"));
  assert.equal(detailSource.includes("/client/edit"), false);

  assert.equal(natalRepository.includes("solar_return_reports"), false);
  assert.equal(natalActions.includes("createSolarReturnReport"), false);
  assert.equal(transitRepository.includes("solar_return_reports"), false);
  assert.equal(transitActions.includes("createSolarReturnReport"), false);
}

run();
console.log("solar return report persistence tests ok");
