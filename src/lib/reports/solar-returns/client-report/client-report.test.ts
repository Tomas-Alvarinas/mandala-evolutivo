import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  SOLAR_RETURN_METHODOLOGY_VERSION,
  SOLAR_RETURN_REPORT_VERSION,
} from "../constants";
import { applySolarReturnClientReportEdits } from "./editorial";
import { toSolarReturnClientReport } from "./from-professional";
import { createSampleSolarReturnReport } from "../sample";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIRNAME, "../../../../..");
const MIGRATION_NAME = "20260908140000_create_solar_return_client_reports.sql";
const PREVIOUS_MIGRATION =
  "20260908120000_add_generated_report_and_status_to_solar_return_reports.sql";

function readRepo(...parts: string[]) {
  return readFileSync(path.join(ROOT, ...parts), "utf8");
}

function run() {
  assert.equal(SOLAR_RETURN_REPORT_VERSION, "1.0");
  assert.equal(SOLAR_RETURN_METHODOLOGY_VERSION, "1.0");

  const migration = readRepo("supabase/migrations", MIGRATION_NAME);
  const previousMigration = readRepo("supabase/migrations", PREVIOUS_MIGRATION);
  const createReportsMigration = readRepo(
    "supabase/migrations",
    "20260907200000_create_solar_return_reports.sql",
  );
  const natalClientMigration = readRepo(
    "supabase/migrations",
    "20260827234000_create_natal_chart_client_reports.sql",
  );
  const transitClientMigration = readRepo(
    "supabase/migrations",
    "20260902200000_create_transit_analysis_client_reports.sql",
  );
  const repository = readFileSync(path.join(DIRNAME, "repository.ts"), "utf8");
  const actions = readFileSync(path.join(DIRNAME, "actions.ts"), "utf8");
  const fromProfessional = readFileSync(
    path.join(DIRNAME, "from-professional.ts"),
    "utf8",
  );
  const professionalPage = readRepo(
    "src/app/clients/[id]/solar-returns/[solarReturnId]/reports/[reportId]/page.tsx",
  );
  const clientPage = readRepo(
    "src/app/clients/[id]/solar-returns/[solarReturnId]/reports/[reportId]/client/page.tsx",
  );
  const clientEditPage = readRepo(
    "src/app/clients/[id]/solar-returns/[solarReturnId]/reports/[reportId]/client/edit/page.tsx",
  );
  const versionNav = readRepo(
    "src/components/reports/SolarReturnReportVersionNav.tsx",
  );
  const clientView = readRepo(
    "src/components/reports/SolarReturnClientReportView.tsx",
  );
  const clientEditor = readRepo(
    "src/components/reports/SolarReturnClientReportEditor.tsx",
  );
  const refreshControl = readRepo(
    "src/components/reports/RefreshSolarReturnClientReportFromProfessionalControl.tsx",
  );
  const professionalActions = readRepo(
    "src/components/reports/SolarReturnProfessionalReportActions.tsx",
  );
  const natalClientRepository = readRepo(
    "src/lib/reports/natal-chart/client-report/repository.ts",
  );
  const natalClientActions = readRepo(
    "src/lib/reports/natal-chart/client-report/actions.ts",
  );
  const natalClientFromProfessional = readRepo(
    "src/lib/reports/natal-chart/client-report/from-professional.ts",
  );
  const natalClientPage = readRepo(
    "src/app/clients/[id]/reports/[reportId]/client/page.tsx",
  );
  const transitClientRepository = readRepo(
    "src/lib/reports/transits/client-report/repository.ts",
  );
  const transitClientActions = readRepo(
    "src/lib/reports/transits/client-report/actions.ts",
  );
  const homePage = readRepo("src/app/page.tsx");
  const pendingWork = readRepo("src/lib/home/pending-work.ts");

  assert.equal(previousMigration.includes("solar_return_client_reports"), false);
  assert.equal(
    createReportsMigration.includes("solar_return_client_reports"),
    false,
  );
  assert.ok(migration.includes("CREATE TABLE public.solar_return_client_reports"));
  assert.ok(migration.includes("UNIQUE"));
  assert.ok(migration.includes("professional_report_id uuid NOT NULL UNIQUE"));
  assert.ok(
    migration.includes(
      "REFERENCES public.solar_return_reports (id) ON DELETE CASCADE",
    ),
  );
  assert.ok(
    migration.includes("REFERENCES public.clients (id) ON DELETE CASCADE"),
  );
  assert.ok(
    migration.includes("REFERENCES public.solar_returns (id) ON DELETE CASCADE"),
  );
  assert.ok(migration.includes("source_report jsonb NOT NULL"));
  assert.ok(migration.includes("client_report jsonb NOT NULL"));
  assert.ok(migration.includes("ENABLE ROW LEVEL SECURITY"));
  assert.ok(migration.includes("FOR SELECT"));
  assert.ok(migration.includes("FOR INSERT"));
  assert.ok(migration.includes("FOR UPDATE"));
  assert.ok(migration.includes("FOR DELETE"));
  assert.ok(migration.includes("clients.user_id = auth.uid()"));
  assert.equal(migration.includes("service_role"), false);
  assert.ok(!migration.includes("TO anon;"));
  assert.ok(migration.includes("GRANT SELECT, INSERT, UPDATE, DELETE"));
  assert.ok(migration.includes("status = 'ready'"));
  assert.ok(migration.includes("enforce_solar_return_client_report_insert"));
  assert.ok(migration.includes("protect_solar_return_client_report_source"));
  assert.ok(
    migration.includes("NEW.source_report IS DISTINCT FROM OLD.source_report"),
  );
  assert.ok(
    migration.includes(
      "NEW.professional_report_id IS DISTINCT FROM OLD.professional_report_id",
    ),
  );
  assert.ok(migration.includes("NEW.client_id IS DISTINCT FROM OLD.client_id"));
  assert.ok(
    migration.includes("NEW.solar_return_id IS DISTINCT FROM OLD.solar_return_id"),
  );
  assert.ok(migration.includes("NEW.created_at IS DISTINCT FROM OLD.created_at"));
  assert.ok(migration.includes("BEFORE INSERT"));
  assert.equal(
    migration.includes("BEFORE UPDATE ON public.solar_return_reports"),
    false,
  );
  assert.equal(migration.includes("DROP TABLE"), false);
  assert.equal(migration.includes("UNIQUE (solar_return_id)"), false);
  assert.ok(
    migration.includes(
      "CREATE OR REPLACE FUNCTION public.refresh_solar_return_client_report_from_professional",
    ),
  );
  assert.ok(migration.includes("SECURITY INVOKER"));
  assert.ok(migration.includes("app.refresh_solar_return_client_report"));
  assert.ok(migration.includes("source_report = p_source_report"));
  assert.ok(migration.includes("client_report = p_client_report"));
  assert.ok(migration.includes("GRANT EXECUTE"));
  assert.ok(migration.includes("REVOKE ALL ON FUNCTION"));
  assert.ok(
    migration.includes(
      "current_setting('app.refresh_solar_return_client_report', true) IS DISTINCT FROM 'on'",
    ),
  );
  assert.ok(
    migration.includes("solar return client report identity fields are immutable"),
  );
  assert.equal(migration.includes("DROP TRIGGER"), false);
  assert.equal(previousMigration.includes("solar_return_client_reports"), false);

  assert.ok(repository.includes("export async function createSolarReturnClientReport"));
  assert.ok(
    repository.includes(
      "export async function getSolarReturnClientReportByProfessionalReportId",
    ),
  );
  assert.ok(
    repository.includes("export async function getSolarReturnClientReportById"),
  );
  assert.ok(repository.includes("export async function updateSolarReturnClientReport"));
  assert.ok(repository.includes("export async function hasSolarReturnClientReport"));
  assert.ok(
    repository.includes(
      "export async function refreshSolarReturnClientReportFromProfessional",
    ),
  );
  assert.ok(repository.includes("export async function deleteSolarReturnClientReport"));
  assert.ok(repository.includes("professional.data.report"));
  assert.equal(repository.includes("professional.data.generatedReport"), false);
  assert.ok(repository.includes('status !== "ready"'));
  assert.ok(repository.includes('.select("id")'));
  assert.ok(repository.includes("client_report: parsed.data"));
  assert.equal(repository.includes("source_report: parsed"), false);
  assert.ok(repository.includes(".update({ client_report: parsed.data })"));
  assert.ok(repository.includes('.eq("client_id", input.clientId)'));
  assert.ok(
    repository.includes('.eq("professional_report_id", input.professionalReportId)'),
  );
  assert.ok(repository.includes('error.code === "23505"'));

  const hasFn = repository.slice(
    repository.indexOf("export async function hasSolarReturnClientReport"),
    repository.indexOf("export async function updateSolarReturnClientReport"),
  );
  assert.ok(hasFn.includes('.select("id")'));
  assert.equal(hasFn.includes("source_report"), false);
  assert.equal(hasFn.includes(FULL_SELECT_SNIPPET()), false);
  assert.equal(hasFn.includes("FULL_SELECT"), false);

  const updateFn = repository.slice(
    repository.indexOf("export async function updateSolarReturnClientReport"),
    repository.indexOf(
      "export async function refreshSolarReturnClientReportFromProfessional",
    ),
  );
  assert.ok(updateFn.includes("client_report: parsed.data"));
  assert.equal(updateFn.includes("source_report:"), false);
  assert.equal(updateFn.includes("generated_report"), false);

  const refreshFn = repository.slice(
    repository.indexOf(
      "export async function refreshSolarReturnClientReportFromProfessional",
    ),
    repository.indexOf("export async function deleteSolarReturnClientReport"),
  );
  assert.ok(refreshFn.includes(".rpc("));
  assert.ok(
    refreshFn.includes("refresh_solar_return_client_report_from_professional"),
  );
  assert.ok(refreshFn.includes("professional.data.report"));
  assert.equal(refreshFn.includes("professional.data.generatedReport"), false);
  assert.equal(refreshFn.includes(".insert("), false);
  assert.equal(refreshFn.includes("saveSolarReturnReport"), false);
  assert.equal(refreshFn.includes("generateSolarReturn"), false);
  assert.ok(refreshFn.includes("p_source_report: write.source_report"));
  assert.ok(refreshFn.includes("p_client_report: write.client_report"));
  assert.equal(refreshFn.includes(".eq("), false);

  assert.ok(actions.includes("export async function prepareSolarReturnClientReport"));
  assert.ok(actions.includes("export async function updateSolarReturnClientReport"));
  assert.ok(
    actions.includes(
      "export async function refreshSolarReturnClientReportFromProfessional",
    ),
  );
  assert.ok(
    actions.includes(
      "Marcá el informe profesional como Listo para entregar antes de preparar la versión consultante.",
    ),
  );
  assert.ok(
    actions.includes(
      "Marcá primero el informe profesional como Listo para entregar para actualizar esta versión.",
    ),
  );
  assert.equal(actions.includes("source_report"), false);
  assert.equal(actions.includes("generated_report"), false);
  assert.equal(actions.includes("@/lib/ai/gemini"), false);
  assert.equal(actions.includes("generateSolarReturn"), false);
  assert.equal(fromProfessional.includes("@/lib/ai/gemini"), false);
  assert.equal(fromProfessional.includes("@google/genai"), false);
  assert.equal(repository.includes("@/lib/ai/gemini"), false);
  assert.equal(repository.includes("@google/genai"), false);

  assert.ok(
    professionalPage.includes("getSolarReturnClientReportByProfessionalReportId"),
  );
  assert.ok(professionalPage.includes("isSolarReturnClientReportSourceOutdated"));
  assert.ok(professionalPage.includes("GO_TO_CLIENT_VERSION_LABEL"));
  assert.equal(
    professionalPage.includes("refreshSolarReturnClientReportFromProfessional"),
    false,
  );
  assert.ok(
    clientPage.includes("getSolarReturnClientReportByProfessionalReportId"),
  );
  assert.ok(clientPage.includes("isSolarReturnClientReportSourceOutdated"));
  assert.ok(
    clientPage.includes("canExecuteRefreshSolarReturnClientReportFromProfessional"),
  );
  assert.ok(
    clientPage.includes("RefreshSolarReturnClientReportFromProfessionalControl"),
  );
  assert.ok(clientPage.includes("professionalResult.data.report"));
  assert.equal(clientPage.includes("generatedReport"), false);
  assert.equal(
    clientPage.includes(
      "El informe profesional cambió después de preparar esta versión consultante.",
    ),
    false,
  );
  assert.ok(
    readRepo("src/lib/reports/source-outdated-copy.ts").includes(
      "El informe profesional cambió después de preparar esta versión consultante.",
    ),
  );
  assert.ok(
    readRepo("src/components/reports/SourceOutdatedAlert.tsx").includes(
      "SOURCE_OUTDATED_TITLE",
    ),
  );
  assert.ok(
    readRepo("src/components/reports/SolarReturnSourceOutdatedAlert.tsx").includes(
      "SourceOutdatedAlert",
    ),
  );
  assert.equal(clientPage.includes("DownloadReportPdfButton"), false);
  assert.ok(
    readRepo("src/components/reports/SolarReturnClientReportActions.tsx").includes(
      "DownloadReportPdfButton",
    ),
  );
  assert.ok(
    readRepo("src/components/reports/SolarReturnClientReportActions.tsx").includes(
      "Editar versión consultante",
    ),
  );
  assert.equal(clientEditPage.includes("DownloadReportPdfButton"), false);
  assert.equal(
    clientEditPage.includes("RefreshSolarReturnClientReportFromProfessionalControl"),
    false,
  );
  assert.equal(clientEditPage.includes("astrologicalBasis"), false);
  assert.equal(clientEditPage.includes("generatedReport"), false);
  assert.equal(clientView.includes("astrologicalBasis"), false);
  assert.equal(clientView.includes("reportVersion"), false);
  assert.equal(clientView.includes("methodologyVersion"), false);
  assert.equal(clientView.includes("Datos técnicos"), false);
  assert.ok(clientEditor.includes("Guardar cambios"));
  assert.ok(clientEditor.includes("Cancelar"));
  assert.equal(clientEditor.includes("astrologicalBasis"), false);
  assert.equal(clientEditor.includes("Original Gemini"), false);

  assert.ok(versionNav.includes("ClientVersionTab"));
  assert.ok(versionNav.includes("Informe profesional"));
  assert.ok(versionNav.includes("ORIGINAL_VERSION_TAB_LABEL"));
  assert.ok(versionNav.includes("hasClientReport"));
  assert.ok(professionalActions.includes("shouldOfferPrepareSolarReturnClientReport"));
  assert.ok(professionalActions.includes("CreateSolarReturnClientReportButton"));
  assert.ok(professionalActions.includes("DownloadReportPdfButton"));
  assert.ok(professionalActions.includes("PROFESSIONAL_PDF_DOWNLOAD_LABEL"));
  assert.ok(
    readRepo("src/components/reports/CreateSolarReturnClientReportButton.tsx").includes(
      "Preparar versión consultante",
    ),
  );
  assert.equal(professionalPage.includes("DownloadReportPdfButton"), false);

  assert.ok(refreshControl.includes("Actualizar desde informe profesional"));
  assert.ok(refreshControl.includes("Cancelar"));
  assert.ok(refreshControl.includes("Actualizar versión"));
  assert.ok(
    refreshControl.includes(
      "Esta acción reemplazará el contenido actual de la versión consultante por el informe profesional actualizado. Los cambios manuales realizados en la versión consultante se perderán.",
    ),
  );
  const closeDialogFn = refreshControl.slice(
    refreshControl.indexOf("function closeDialog"),
    refreshControl.indexOf("async function handleRefresh"),
  );
  assert.equal(
    closeDialogFn.includes("refreshSolarReturnClientReportFromProfessional"),
    false,
  );
  assert.ok(refreshControl.includes("onClick={closeDialog}"));
  assert.ok(refreshControl.includes("onClick={handleRefresh}"));
  assert.ok(
    refreshControl.includes("refreshSolarReturnClientReportFromProfessional({"),
  );
  assert.equal(refreshControl.includes("source_report"), false);
  assert.equal(refreshControl.includes("client_report"), false);

  assert.ok(repository.includes('.eq("client_id", input.clientId)'));
  assert.ok(migration.includes("clients.user_id = auth.uid()"));

  const sample = createSampleSolarReturnReport();
  const built = toSolarReturnClientReport(sample);
  const edited = applySolarReturnClientReportEdits(built, {
    ...built,
    opportunities: { content: "Texto consultante editado por Paula." },
  });
  assert.equal(edited.opportunities.content, "Texto consultante editado por Paula.");
  assert.equal(edited.learnings.content, built.learnings.content);
  assert.equal("astrologicalBasis" in edited.opportunities, false);

  assert.equal(natalClientMigration.includes("solar_return_client_reports"), false);
  assert.equal(
    natalClientRepository.includes("solar_return_client_reports"),
    false,
  );
  assert.equal(
    natalClientActions.includes("prepareSolarReturnClientReport"),
    false,
  );
  assert.equal(
    natalClientFromProfessional.includes("toSolarReturnClientReport"),
    false,
  );
  assert.ok(natalClientPage.includes("getNatalChartClientReport"));
  assert.equal(natalClientPage.includes("getSolarReturnClientReport"), false);
  assert.ok(natalClientRepository.includes("natal_chart_client_reports"));
  assert.equal(
    natalClientRepository.includes(
      "refresh_solar_return_client_report_from_professional",
    ),
    false,
  );
  assert.equal(
    natalClientActions.includes("refreshSolarReturnClientReportFromProfessional"),
    false,
  );
  assert.equal(
    natalClientFromProfessional.includes(
      "canExecuteRefreshSolarReturnClientReportFromProfessional",
    ),
    false,
  );

  assert.equal(
    transitClientMigration.includes("solar_return_client_reports"),
    false,
  );
  assert.equal(
    transitClientRepository.includes("solar_return_client_reports"),
    false,
  );
  assert.equal(
    transitClientActions.includes("prepareSolarReturnClientReport"),
    false,
  );
  assert.ok(homePage.includes("getPendingSolarReturnWork"));
  assert.ok(pendingWork.includes("solar"));
}

function FULL_SELECT_SNIPPET() {
  return "source_report, client_report";
}

run();
console.log("solar return client report persistence and RLS tests ok");
