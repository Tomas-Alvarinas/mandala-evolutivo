import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  SOLAR_RETURN_REPORT_DEFAULT_STATUS,
  SOLAR_RETURN_REPORT_DETAIL_COLUMNS,
  SOLAR_RETURN_REPORT_STATUSES,
  SOLAR_RETURN_REPORT_STATUS_LABELS,
  SOLAR_RETURN_REPORT_SUMMARY_COLUMNS,
  getSolarReturnReportStatusLabel,
  isSolarReturnReportStatus,
} from "@/lib/reports";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIRNAME, "../../../..");
const CREATE_MIGRATION = "20260907200000_create_solar_return_reports.sql";
const EDITORIAL_MIGRATION =
  "20260908120000_add_generated_report_and_status_to_solar_return_reports.sql";

function run() {
  assert.deepEqual([...SOLAR_RETURN_REPORT_STATUSES], [
    "draft",
    "reviewed",
    "ready",
  ]);
  assert.equal(SOLAR_RETURN_REPORT_DEFAULT_STATUS, "draft");
  assert.equal(SOLAR_RETURN_REPORT_STATUS_LABELS.draft, "Borrador");
  assert.equal(SOLAR_RETURN_REPORT_STATUS_LABELS.reviewed, "Revisado");
  assert.equal(SOLAR_RETURN_REPORT_STATUS_LABELS.ready, "Listo para entregar");
  assert.equal(getSolarReturnReportStatusLabel("ready"), "Listo para entregar");
  assert.equal(isSolarReturnReportStatus("draft"), true);
  assert.equal(isSolarReturnReportStatus("published"), false);

  assert.ok(
    (SOLAR_RETURN_REPORT_SUMMARY_COLUMNS as readonly string[]).includes("status"),
  );
  assert.equal(
    (SOLAR_RETURN_REPORT_SUMMARY_COLUMNS as readonly string[]).includes("report"),
    false,
  );
  assert.equal(
    (SOLAR_RETURN_REPORT_SUMMARY_COLUMNS as readonly string[]).includes(
      "generated_report",
    ),
    false,
  );
  assert.ok(
    (SOLAR_RETURN_REPORT_DETAIL_COLUMNS as readonly string[]).includes(
      "generated_report",
    ),
  );
  assert.ok(
    (SOLAR_RETURN_REPORT_DETAIL_COLUMNS as readonly string[]).includes("status"),
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
  const actions = readFileSync(path.join(DIRNAME, "actions.ts"), "utf8");
  const editorSource = readFileSync(
    path.join(ROOT, "src/components/reports/SolarReturnReportEditor.tsx"),
    "utf8",
  );
  const professionalPage = readFileSync(
    path.join(
      ROOT,
      "src/app/clients/[id]/solar-returns/[solarReturnId]/reports/[reportId]/page.tsx",
    ),
    "utf8",
  );
  const professionalActions = readFileSync(
    path.join(ROOT, "src/components/reports/SolarReturnProfessionalReportActions.tsx"),
    "utf8",
  );
  const originalPage = readFileSync(
    path.join(
      ROOT,
      "src/app/clients/[id]/solar-returns/[solarReturnId]/reports/[reportId]/original/page.tsx",
    ),
    "utf8",
  );
  const editPage = readFileSync(
    path.join(
      ROOT,
      "src/app/clients/[id]/solar-returns/[solarReturnId]/reports/[reportId]/edit/page.tsx",
    ),
    "utf8",
  );
  const historySource = readFileSync(
    path.join(ROOT, "src/components/reports/SolarReturnReportsSection.tsx"),
    "utf8",
  );
  const generateAction = readFileSync(
    path.join(ROOT, "src/lib/ai/solar-returns/actions.ts"),
    "utf8",
  );
  const generateSource = readFileSync(
    path.join(ROOT, "src/lib/ai/solar-returns/generate.ts"),
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
  const transitRepository = readFileSync(
    path.join(ROOT, "src/lib/reports/transits/repository.ts"),
    "utf8",
  );
  const transitActions = readFileSync(
    path.join(ROOT, "src/lib/reports/transits/actions.ts"),
    "utf8",
  );
  const versionNav = readFileSync(
    path.join(ROOT, "src/components/reports/SolarReturnReportVersionNav.tsx"),
    "utf8",
  );

  assert.equal(createMigration.includes("generated_report"), false);
  assert.equal(createMigration.includes("status text"), false);
  assert.equal(createMigration.includes("updated_at"), false);
  assert.equal(createMigration.includes("FOR UPDATE"), false);
  assert.ok(migration.includes("ADD COLUMN generated_report jsonb"));
  assert.ok(migration.includes("SET generated_report = report"));
  assert.ok(migration.includes("ALTER COLUMN generated_report SET NOT NULL"));
  assert.ok(migration.includes("ADD COLUMN status text NOT NULL DEFAULT 'draft'"));
  assert.ok(migration.includes("CHECK (status IN ('draft', 'reviewed', 'ready'))"));
  assert.ok(migration.includes("ADD COLUMN updated_at timestamptz"));
  assert.ok(migration.includes("SET updated_at = created_at"));
  assert.ok(migration.includes("protect_solar_return_report_generation"));
  assert.ok(
    migration.includes("NEW.generated_report IS DISTINCT FROM OLD.generated_report"),
  );
  assert.ok(
    migration.includes("NEW.report_version IS DISTINCT FROM OLD.report_version"),
  );
  assert.ok(
    migration.includes(
      "NEW.methodology_version IS DISTINCT FROM OLD.methodology_version",
    ),
  );
  assert.ok(migration.includes("NEW.generated_at IS DISTINCT FROM OLD.generated_at"));
  assert.ok(migration.includes("NEW.client_id IS DISTINCT FROM OLD.client_id"));
  assert.ok(
    migration.includes("NEW.solar_return_id IS DISTINCT FROM OLD.solar_return_id"),
  );
  assert.ok(migration.includes("solar_return_reports_set_updated_at"));
  assert.ok(migration.includes("public.set_updated_at()"));
  assert.ok(migration.includes("FOR UPDATE"));
  assert.ok(migration.includes("GRANT UPDATE"));
  assert.equal(migration.includes("service_role"), false);
  assert.equal(migration.includes("TO anon"), false);
  assert.equal(createMigration.includes(EDITORIAL_MIGRATION), false);
  assert.equal(migration.includes("CREATE TABLE"), false);

  assert.ok(repository.includes("generated_report: parsed.data"));
  assert.ok(repository.includes("status: SOLAR_RETURN_REPORT_DEFAULT_STATUS"));
  assert.ok(repository.includes("export async function updateSolarReturnProfessionalReport"));
  assert.ok(repository.includes("export async function updateSolarReturnReportStatus"));
  assert.ok(repository.includes("applySolarReturnProfessionalEdits"));

  const saveIndex = repository.indexOf("export async function createSolarReturnReport");
  const updateIndex = repository.indexOf(
    "export async function updateSolarReturnProfessionalReport",
  );
  const insertIndex = repository.indexOf(".insert({");
  assert.ok(saveIndex >= 0);
  assert.ok(insertIndex > saveIndex);
  assert.ok(updateIndex > insertIndex);
  assert.equal(repository.slice(saveIndex, insertIndex + 40).includes(".update("), false);

  const professionalUpdate = repository.slice(
    updateIndex,
    repository.indexOf("export async function updateSolarReturnReportStatus"),
  );
  assert.ok(professionalUpdate.includes("report: parsed.data"));
  assert.ok(professionalUpdate.includes("status: SOLAR_RETURN_REPORT_DEFAULT_STATUS"));
  assert.equal(professionalUpdate.includes("generated_report:"), false);
  assert.ok(professionalUpdate.includes("previousStatus"));
  assert.ok(professionalUpdate.includes("professional_edit_success"));
  assert.ok(professionalUpdate.includes("stored.data.generatedReport"));
  assert.equal(professionalUpdate.includes("generateSolarReturnReport"), false);

  const statusUpdate = repository.slice(
    repository.indexOf("export async function updateSolarReturnReportStatus"),
  );
  assert.ok(statusUpdate.includes("status: input.status"));
  assert.ok(statusUpdate.includes("status_change"));
  assert.ok(statusUpdate.includes("from: stored.data.status"));
  assert.equal(statusUpdate.includes("generated_report"), false);
  assert.equal(statusUpdate.includes("generateSolarReturnReport"), false);

  assert.ok(editorial.includes("astrologicalBasis: original[sectionId].astrologicalBasis"));
  assert.ok(editorial.includes("content:"));
  assert.ok(editorial.includes("metadata: original.metadata"));

  assert.ok(actions.includes("updateSolarReturnProfessionalReport"));
  assert.ok(actions.includes("updateSolarReturnReportStatus"));
  assert.equal(actions.includes("generateSolarReturnReport"), false);
  assert.equal(actions.includes("createGeminiClient"), false);
  assert.ok(actions.includes("revalidatePath"));
  assert.ok(actions.includes("/original"));
  assert.ok(actions.includes("/edit"));

  assert.ok(editorSource.includes("Texto profesional"));
  assert.ok(editorSource.includes("Solo lectura. No se edita."));
  assert.equal(editorSource.includes("astrologicalBasis: event.target.value"), false);
  assert.ok(editorSource.includes("content: event.target.value"));
  assert.ok(editorSource.includes("Guardando..."));
  assert.ok(editorSource.includes("disabled={isSaving}"));

  assert.ok(professionalPage.includes("stored.report"));
  assert.ok(professionalPage.includes("SolarReturnReportStatusSelect"));
  assert.ok(professionalPage.includes("SolarReturnProfessionalReportActions"));
  assert.equal(professionalPage.includes("stored.generatedReport"), false);
  assert.equal(professionalPage.includes("DownloadReportPdfButton"), false);
  assert.equal(professionalPage.includes("CreateTransitClientReportButton"), false);
  assert.equal(professionalPage.includes("/client/edit"), false);
  assert.ok(
    professionalPage.includes("getSolarReturnClientReportByProfessionalReportId"),
  );
  assert.equal(
    professionalPage.includes("CreateSolarReturnClientReportButton"),
    false,
  );

  assert.ok(professionalActions.includes("Editar informe"));
  assert.ok(professionalActions.includes("DownloadReportPdfButton"));
  assert.ok(professionalActions.includes("PROFESSIONAL_PDF_DOWNLOAD_LABEL"));
  assert.equal(professionalActions.includes("CreateTransitClientReportButton"), false);
  assert.ok(professionalActions.includes("CreateSolarReturnClientReportButton"));
  assert.ok(professionalActions.includes("shouldOfferPrepareSolarReturnClientReport"));

  assert.ok(originalPage.includes("stored.generatedReport"));
  assert.equal(originalPage.includes("SolarReturnReportEditor"), false);
  assert.equal(originalPage.includes("SolarReturnReportStatusSelect"), false);
  assert.ok(originalPage.includes("ORIGINAL_VERSION_NOTICE_TITLE"));
  assert.equal(originalPage.includes("Editar informe"), false);

  assert.ok(editPage.includes("SolarReturnReportEditor"));
  assert.ok(editPage.includes("vuelve a Borrador"));
  assert.ok(editPage.includes("report={stored.report}"));

  assert.ok(historySource.includes("SolarReturnReportStatusBadge"));
  assert.ok(historySource.includes("summary.status"));
  assert.ok(historySource.includes("Más reciente"));
  assert.ok(historySource.includes("Ver informe →"));
  assert.equal(historySource.includes("summary.report."), false);
  assert.equal(historySource.includes("/original"), false);

  assert.ok(versionNav.includes("Informe profesional"));
  assert.ok(versionNav.includes("ORIGINAL_VERSION_TAB_LABEL"));
  assert.ok(versionNav.includes("ClientVersionTab"));
  assert.ok(versionNav.includes("hasClientReport"));

  assert.equal(generateAction.includes("generated_report"), false);
  assert.ok(generateSource.includes("assembleSolarReturnReportFromModelOutput"));
  assert.equal(generateSource.includes("updateSolarReturnProfessionalReport"), false);

  assert.equal(natalRepository.includes("solar_return_reports"), false);
  assert.equal(natalActions.includes("updateSolarReturnProfessionalReport"), false);
  assert.equal(natalEditorial.includes("applySolarReturnProfessionalEdits"), false);
  assert.equal(transitRepository.includes("solar_return_reports"), false);
  assert.equal(transitActions.includes("updateSolarReturnProfessionalReport"), false);
}

run();
console.log("solar return report editorial flow tests ok");
