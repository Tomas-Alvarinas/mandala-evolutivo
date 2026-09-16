import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  TRANSIT_ANALYSIS_REPORT_DEFAULT_STATUS,
  TRANSIT_ANALYSIS_REPORT_STATUSES,
  TRANSIT_ANALYSIS_REPORT_STATUS_LABELS,
  TRANSIT_ANALYSIS_REPORT_SUMMARY_COLUMNS,
  TRANSIT_ANALYSIS_REPORT_DETAIL_COLUMNS,
  getTransitAnalysisReportStatusLabel,
  isTransitAnalysisReportStatus,
} from "@/lib/reports";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIRNAME, "../../../..");
const CREATE_MIGRATION = "20260902183000_create_transit_analysis_reports.sql";
const EDITORIAL_MIGRATION =
  "20260902191500_add_generated_report_and_status_to_transit_analysis_reports.sql";

function run() {
  assert.deepEqual([...TRANSIT_ANALYSIS_REPORT_STATUSES], [
    "draft",
    "reviewed",
    "ready",
  ]);
  assert.equal(TRANSIT_ANALYSIS_REPORT_DEFAULT_STATUS, "draft");
  assert.equal(TRANSIT_ANALYSIS_REPORT_STATUS_LABELS.draft, "Borrador");
  assert.equal(TRANSIT_ANALYSIS_REPORT_STATUS_LABELS.reviewed, "Revisado");
  assert.equal(TRANSIT_ANALYSIS_REPORT_STATUS_LABELS.ready, "Listo para entregar");
  assert.equal(getTransitAnalysisReportStatusLabel("ready"), "Listo para entregar");
  assert.equal(isTransitAnalysisReportStatus("draft"), true);
  assert.equal(isTransitAnalysisReportStatus("published"), false);

  assert.ok(
    (TRANSIT_ANALYSIS_REPORT_SUMMARY_COLUMNS as readonly string[]).includes(
      "status",
    ),
  );
  assert.equal(
    (TRANSIT_ANALYSIS_REPORT_SUMMARY_COLUMNS as readonly string[]).includes(
      "report",
    ),
    false,
  );
  assert.equal(
    (TRANSIT_ANALYSIS_REPORT_SUMMARY_COLUMNS as readonly string[]).includes(
      "generated_report",
    ),
    false,
  );
  assert.ok(
    (TRANSIT_ANALYSIS_REPORT_DETAIL_COLUMNS as readonly string[]).includes(
      "generated_report",
    ),
  );

  const createMigration = readFileSync(
    path.join(ROOT, "supabase/migrations", CREATE_MIGRATION),
    "utf8",
  );
  const migration = readFileSync(
    path.join(ROOT, "supabase/migrations", EDITORIAL_MIGRATION),
    "utf8",
  );
  const repository = readFileSync(path.join(DIRNAME, "repository.ts"), "utf8");
  const editorial = readFileSync(path.join(DIRNAME, "editorial.ts"), "utf8");
  const editorSource = readFileSync(
    path.join(ROOT, "src/components/reports/TransitAnalysisReportEditor.tsx"),
    "utf8",
  );
  const professionalPage = readFileSync(
    path.join(
      ROOT,
      "src/app/clients/[id]/transits/[transitAnalysisId]/reports/[reportId]/page.tsx",
    ),
    "utf8",
  );
  const professionalActions = readFileSync(
    path.join(
      ROOT,
      "src/components/reports/TransitProfessionalReportActions.tsx",
    ),
    "utf8",
  );
  const originalPage = readFileSync(
    path.join(
      ROOT,
      "src/app/clients/[id]/transits/[transitAnalysisId]/reports/[reportId]/original/page.tsx",
    ),
    "utf8",
  );
  const editPage = readFileSync(
    path.join(
      ROOT,
      "src/app/clients/[id]/transits/[transitAnalysisId]/reports/[reportId]/edit/page.tsx",
    ),
    "utf8",
  );
  const historySource = readFileSync(
    path.join(ROOT, "src/components/reports/TransitAnalysisReportsSection.tsx"),
    "utf8",
  );
  const natalRepository = readFileSync(
    path.join(ROOT, "src/lib/reports/natal-chart/repository.ts"),
    "utf8",
  );
  const natalActions = readFileSync(
    path.join(ROOT, "src/lib/reports/natal-chart/actions.ts"),
    "utf8",
  );
  const natalEditorial = readFileSync(
    path.join(ROOT, "src/lib/reports/natal-chart/editorial.ts"),
    "utf8",
  );

  assert.equal(createMigration.includes("generated_report"), false);
  assert.ok(migration.includes("ADD COLUMN generated_report jsonb"));
  assert.ok(migration.includes("SET generated_report = report"));
  assert.ok(migration.includes("ALTER COLUMN generated_report SET NOT NULL"));
  assert.ok(migration.includes("ADD COLUMN status text NOT NULL DEFAULT 'draft'"));
  assert.ok(migration.includes("CHECK (status IN ('draft', 'reviewed', 'ready'))"));
  assert.ok(
    migration.includes("protect_transit_analysis_report_generation"),
  );
  assert.ok(migration.includes("NEW.generated_report IS DISTINCT FROM OLD.generated_report"));
  assert.ok(migration.includes("NEW.report_version IS DISTINCT FROM OLD.report_version"));
  assert.ok(
    migration.includes("NEW.methodology_version IS DISTINCT FROM OLD.methodology_version"),
  );
  assert.ok(migration.includes("NEW.generated_at IS DISTINCT FROM OLD.generated_at"));
  assert.ok(migration.includes("FOR UPDATE"));
  assert.ok(migration.includes("GRANT UPDATE"));
  assert.equal(migration.includes("service_role"), false);
  assert.equal(createMigration.includes(EDITORIAL_MIGRATION), false);

  assert.ok(repository.includes("generated_report: parsed.data"));
  assert.ok(repository.includes("status: TRANSIT_ANALYSIS_REPORT_DEFAULT_STATUS"));
  assert.ok(repository.includes("export async function updateTransitAnalysisProfessionalReport"));
  assert.ok(repository.includes("export async function updateTransitAnalysisReportStatus"));
  assert.ok(repository.includes("applyTransitAnalysisProfessionalEdits"));
  assert.ok(
    repository.includes("status: TRANSIT_ANALYSIS_REPORT_DEFAULT_STATUS"),
  );

  const saveIndex = repository.indexOf("export async function saveTransitAnalysisReport");
  const updateIndex = repository.indexOf(
    "export async function updateTransitAnalysisProfessionalReport",
  );
  const insertIndex = repository.indexOf(".insert({");
  assert.ok(saveIndex >= 0);
  assert.ok(insertIndex > saveIndex);
  assert.ok(updateIndex > insertIndex);
  assert.equal(repository.slice(saveIndex, insertIndex + 40).includes(".update("), false);

  const professionalUpdate = repository.slice(
    updateIndex,
    repository.indexOf("export async function updateTransitAnalysisReportStatus"),
  );
  assert.ok(professionalUpdate.includes("report: parsed.data"));
  assert.ok(professionalUpdate.includes("status: TRANSIT_ANALYSIS_REPORT_DEFAULT_STATUS"));
  assert.equal(professionalUpdate.includes("generated_report:"), false);
  assert.ok(professionalUpdate.includes("previousStatus"));
  assert.ok(professionalUpdate.includes("professional_edit_success"));

  const statusUpdate = repository.slice(
    repository.indexOf("export async function updateTransitAnalysisReportStatus"),
  );
  assert.ok(statusUpdate.includes("status: input.status"));
  assert.ok(statusUpdate.includes("status_change"));
  assert.ok(statusUpdate.includes("from: stored.data.status"));
  assert.equal(statusUpdate.includes("generated_report"), false);

  assert.ok(editorial.includes("astrologicalBasis: original[sectionId].astrologicalBasis"));
  assert.ok(editorial.includes("content:"));
  assert.ok(editorial.includes("metadata: original.metadata"));

  assert.ok(editorSource.includes("Texto profesional"));
  assert.ok(editorSource.includes("Solo lectura. No se edita."));
  assert.equal(editorSource.includes("astrologicalBasis: event.target.value"), false);
  assert.ok(editorSource.includes("content: event.target.value"));
  assert.ok(editorSource.includes("Guardando..."));
  assert.ok(editorSource.includes("disabled={isSaving}"));

  assert.ok(professionalPage.includes("stored.report"));
  assert.ok(professionalPage.includes("TransitAnalysisReportStatusSelect"));
  assert.ok(professionalPage.includes("TransitProfessionalReportActions"));
  assert.ok(professionalPage.includes("getTransitClientReportByProfessionalReportId"));
  assert.equal(professionalPage.includes("stored.generatedReport"), false);
  assert.equal(professionalPage.includes("DownloadReportPdfButton"), false);

  assert.ok(professionalActions.includes("Editar informe"));
  assert.ok(professionalActions.includes("shouldOfferPrepareTransitClientReport"));
  assert.ok(professionalActions.includes("CreateTransitClientReportButton"));
  assert.ok(professionalActions.includes("DownloadReportPdfButton"));
  assert.ok(professionalActions.includes("PROFESSIONAL_PDF_DOWNLOAD_LABEL"));

  assert.ok(originalPage.includes("stored.generatedReport"));
  assert.equal(originalPage.includes("TransitAnalysisReportEditor"), false);
  assert.equal(originalPage.includes("TransitAnalysisReportStatusSelect"), false);
  assert.ok(originalPage.includes("ORIGINAL_VERSION_NOTICE_TITLE"));

  assert.ok(editPage.includes("TransitAnalysisReportEditor"));
  assert.ok(editPage.includes("vuelve a Borrador"));
  assert.ok(editPage.includes("report={stored.report}"));

  assert.ok(historySource.includes("TransitAnalysisReportStatusBadge"));
  assert.ok(historySource.includes("summary.status"));
  assert.equal(historySource.includes("summary.report."), false);

  assert.equal(natalRepository.includes("transit_analysis_reports"), false);
  assert.equal(natalActions.includes("updateTransitAnalysisProfessionalReport"), false);
  assert.equal(natalEditorial.includes("applyTransitAnalysisProfessionalEdits"), false);
}

run();
console.log("transit analysis report editorial flow tests ok");
