import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  TRANSIT_ANALYSIS_REPORT_VERSION,
  TRANSIT_METHODOLOGY_VERSION,
} from "../constants";
import { applyTransitClientReportEdits } from "./editorial";
import { toTransitClientReport } from "./from-professional";
import { createSampleTransitAnalysisReport } from "../sample";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIRNAME, "../../../../..");
const MIGRATION_NAME =
  "20260902200000_create_transit_analysis_client_reports.sql";
const REFRESH_MIGRATION_NAME =
  "20260902210000_allow_transit_client_report_source_refresh.sql";
const PREVIOUS_MIGRATION =
  "20260902191500_add_generated_report_and_status_to_transit_analysis_reports.sql";

function readRepo(...parts: string[]) {
  return readFileSync(path.join(ROOT, ...parts), "utf8");
}

function run() {
  assert.equal(TRANSIT_ANALYSIS_REPORT_VERSION, "1.0");
  assert.equal(TRANSIT_METHODOLOGY_VERSION, "1.1");

  const migration = readRepo("supabase/migrations", MIGRATION_NAME);
  const refreshMigration = readRepo("supabase/migrations", REFRESH_MIGRATION_NAME);
  const previousMigration = readRepo("supabase/migrations", PREVIOUS_MIGRATION);
  const createReportsMigration = readRepo(
    "supabase/migrations",
    "20260902183000_create_transit_analysis_reports.sql",
  );
  const natalClientMigration = readRepo(
    "supabase/migrations",
    "20260827234000_create_natal_chart_client_reports.sql",
  );
  const repository = readFileSync(path.join(DIRNAME, "repository.ts"), "utf8");
  const actions = readFileSync(path.join(DIRNAME, "actions.ts"), "utf8");
  const fromProfessional = readFileSync(
    path.join(DIRNAME, "from-professional.ts"),
    "utf8",
  );
  const professionalPage = readRepo(
    "src/app/clients/[id]/transits/[transitAnalysisId]/reports/[reportId]/page.tsx",
  );
  const clientPage = readRepo(
    "src/app/clients/[id]/transits/[transitAnalysisId]/reports/[reportId]/client/page.tsx",
  );
  const clientEditPage = readRepo(
    "src/app/clients/[id]/transits/[transitAnalysisId]/reports/[reportId]/client/edit/page.tsx",
  );
  const versionNav = readRepo(
    "src/components/reports/TransitAnalysisReportVersionNav.tsx",
  );
  const clientView = readRepo(
    "src/components/reports/TransitClientReportView.tsx",
  );
  const clientEditor = readRepo(
    "src/components/reports/TransitClientReportEditor.tsx",
  );
  const refreshControl = readRepo(
    "src/components/reports/RefreshTransitClientReportFromProfessionalControl.tsx",
  );
  const professionalActions = readRepo(
    "src/components/reports/TransitProfessionalReportActions.tsx",
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

  assert.equal(previousMigration.includes("transit_analysis_client_reports"), false);
  assert.equal(
    createReportsMigration.includes("transit_analysis_client_reports"),
    false,
  );
  assert.ok(migration.includes("CREATE TABLE public.transit_analysis_client_reports"));
  assert.ok(migration.includes("UNIQUE"));
  assert.ok(migration.includes("professional_report_id uuid NOT NULL UNIQUE"));
  assert.ok(
    migration.includes(
      "REFERENCES public.transit_analysis_reports (id) ON DELETE CASCADE",
    ),
  );
  assert.ok(
    migration.includes("REFERENCES public.clients (id) ON DELETE CASCADE"),
  );
  assert.ok(
    migration.includes(
      "REFERENCES public.transit_analyses (id) ON DELETE CASCADE",
    ),
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
  assert.ok(
    migration.includes("enforce_transit_analysis_client_report_insert"),
  );
  assert.ok(
    migration.includes("protect_transit_analysis_client_report_source"),
  );
  assert.ok(migration.includes("NEW.source_report IS DISTINCT FROM OLD.source_report"));
  assert.ok(
    migration.includes(
      "NEW.professional_report_id IS DISTINCT FROM OLD.professional_report_id",
    ),
  );
  assert.ok(migration.includes("NEW.client_id IS DISTINCT FROM OLD.client_id"));
  assert.ok(
    migration.includes(
      "NEW.transit_analysis_id IS DISTINCT FROM OLD.transit_analysis_id",
    ),
  );
  assert.ok(migration.includes("NEW.created_at IS DISTINCT FROM OLD.created_at"));
  assert.ok(migration.includes("BEFORE INSERT"));
  assert.equal(migration.includes("BEFORE UPDATE ON public.transit_analysis_reports"), false);
  assert.equal(migration.includes("DROP TABLE"), false);
  assert.equal(migration.includes("UNIQUE (transit_analysis_id)"), false);
  assert.equal(
    migration.includes("refresh_transit_client_report_from_professional"),
    false,
  );

  assert.equal(
    previousMigration.includes("refresh_transit_client_report_from_professional"),
    false,
  );
  assert.ok(
    refreshMigration.includes(
      "CREATE OR REPLACE FUNCTION public.refresh_transit_client_report_from_professional",
    ),
  );
  assert.ok(refreshMigration.includes("SECURITY INVOKER"));
  assert.ok(
    refreshMigration.includes("app.refresh_transit_client_report"),
  );
  assert.ok(refreshMigration.includes("source_report = p_source_report"));
  assert.ok(refreshMigration.includes("client_report = p_client_report"));
  assert.ok(refreshMigration.includes("status = 'ready'"));
  assert.ok(refreshMigration.includes("clients.user_id = auth.uid()"));
  assert.ok(refreshMigration.includes("GRANT EXECUTE"));
  assert.equal(refreshMigration.includes("service_role"), false);
  assert.ok(refreshMigration.includes("REVOKE ALL ON FUNCTION"));
  assert.ok(
    refreshMigration.includes(
      "current_setting('app.refresh_transit_client_report', true) IS DISTINCT FROM 'on'",
    ),
  );
  assert.ok(
    refreshMigration.includes(
      "transit analysis client report identity fields are immutable",
    ),
  );
  assert.equal(refreshMigration.includes("DROP TABLE"), false);
  assert.equal(refreshMigration.includes("DROP TRIGGER"), false);

  assert.ok(repository.includes("export async function createTransitClientReport"));
  assert.ok(
    repository.includes(
      "export async function getTransitClientReportByProfessionalReportId",
    ),
  );
  assert.ok(repository.includes("export async function updateTransitClientReport"));
  assert.ok(repository.includes("export async function hasTransitClientReport"));
  assert.ok(
    repository.includes(
      "export async function refreshTransitClientReportFromProfessional",
    ),
  );
  assert.ok(repository.includes("export async function deleteTransitClientReport"));
  assert.ok(repository.includes("professional.data.report"));
  assert.equal(
    repository.includes("professional.data.generatedReport"),
    false,
  );
  assert.ok(repository.includes('status !== "ready"'));
  assert.ok(repository.includes(".select(\"id\")"));
  assert.ok(repository.includes("client_report: parsed.data"));
  assert.equal(repository.includes("source_report: parsed"), false);
  assert.ok(repository.includes('.update({ client_report: parsed.data })'));
  assert.ok(repository.includes('.eq("client_id", input.clientId)'));
  assert.ok(
    repository.includes('.eq("professional_report_id", input.professionalReportId)'),
  );
  assert.ok(repository.includes("error.code === \"23505\""));

  const hasFn = repository.slice(
    repository.indexOf("export async function hasTransitClientReport"),
    repository.indexOf("export async function updateTransitClientReport"),
  );
  assert.ok(hasFn.includes('.select("id")'));
  assert.equal(hasFn.includes("source_report"), false);
  assert.equal(hasFn.includes(FULL_SELECT_SNIPPET()), false);
  assert.equal(hasFn.includes("FULL_SELECT"), false);

  const updateFn = repository.slice(
    repository.indexOf("export async function updateTransitClientReport"),
    repository.indexOf(
      "export async function refreshTransitClientReportFromProfessional",
    ),
  );
  assert.ok(updateFn.includes("client_report: parsed.data"));
  assert.equal(updateFn.includes("source_report:"), false);
  assert.equal(updateFn.includes("generated_report"), false);

  const refreshFn = repository.slice(
    repository.indexOf(
      "export async function refreshTransitClientReportFromProfessional",
    ),
    repository.indexOf("export async function deleteTransitClientReport"),
  );
  assert.ok(refreshFn.includes(".rpc("));
  assert.ok(refreshFn.includes("refresh_transit_client_report_from_professional"));
  assert.ok(refreshFn.includes("professional.data.report"));
  assert.equal(refreshFn.includes("professional.data.generatedReport"), false);
  assert.equal(refreshFn.includes(".insert("), false);
  assert.equal(refreshFn.includes("saveTransitAnalysisReport"), false);
  assert.equal(refreshFn.includes("generateTransit"), false);
  assert.ok(refreshFn.includes("p_source_report: write.source_report"));
  assert.ok(refreshFn.includes("p_client_report: write.client_report"));
  assert.equal(refreshFn.includes(".eq("), false);

  assert.ok(actions.includes("export async function prepareTransitClientReport"));
  assert.ok(actions.includes("export async function updateTransitClientReport"));
  assert.ok(
    actions.includes("export async function refreshTransitClientReportFromProfessional"),
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
  assert.equal(actions.includes("generateTransit"), false);
  assert.equal(fromProfessional.includes("@/lib/ai/gemini"), false);
  assert.equal(fromProfessional.includes("@google/genai"), false);
  assert.equal(repository.includes("@/lib/ai/gemini"), false);
  assert.equal(repository.includes("@google/genai"), false);

  assert.ok(professionalPage.includes("getTransitClientReportByProfessionalReportId"));
  assert.ok(professionalPage.includes("isTransitClientReportSourceOutdated"));
  assert.ok(professionalPage.includes("GO_TO_CLIENT_VERSION_LABEL"));
  assert.equal(
    professionalPage.includes("refreshTransitClientReportFromProfessional"),
    false,
  );
  assert.ok(clientPage.includes("getTransitClientReportByProfessionalReportId"));
  assert.ok(clientPage.includes("isTransitClientReportSourceOutdated"));
  assert.ok(clientPage.includes("canExecuteRefreshTransitClientReportFromProfessional"));
  assert.ok(
    clientPage.includes("RefreshTransitClientReportFromProfessionalControl"),
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
    readRepo("src/components/reports/TransitSourceOutdatedAlert.tsx").includes(
      "SourceOutdatedAlert",
    ),
  );
  assert.equal(clientPage.includes("DownloadReportPdfButton"), false);
  assert.ok(
    readRepo("src/components/reports/TransitClientReportActions.tsx").includes(
      "DownloadReportPdfButton",
    ),
  );
  assert.equal(clientEditPage.includes("DownloadReportPdfButton"), false);
  assert.equal(
    clientEditPage.includes("RefreshTransitClientReportFromProfessionalControl"),
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
  const natalVersionNav = readRepo("src/components/reports/ReportVersionNav.tsx");
  assert.ok(natalVersionNav.includes("CLIENT_VERSION_TAB_LABEL"));
  assert.ok(natalVersionNav.includes("CLIENT_VERSION_UNPREPARED_LABEL"));
  assert.ok(natalVersionNav.includes("CLIENT_VERSION_UNPREPARED_DESCRIPTION"));
  assert.ok(natalVersionNav.includes("aria-describedby"));
  assert.ok(professionalActions.includes("shouldOfferPrepareTransitClientReport"));
  assert.ok(professionalActions.includes("DownloadReportPdfButton"));
  assert.ok(professionalActions.includes("PROFESSIONAL_PDF_DOWNLOAD_LABEL"));
  assert.equal(
    professionalPage.includes("refreshTransitClientReportFromProfessional"),
    false,
  );

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
    closeDialogFn.includes("refreshTransitClientReportFromProfessional"),
    false,
  );
  assert.ok(refreshControl.includes("onClick={closeDialog}"));
  assert.ok(refreshControl.includes("onClick={handleRefresh}"));
  assert.ok(
    refreshControl.includes("refreshTransitClientReportFromProfessional({"),
  );
  assert.equal(refreshControl.includes("source_report"), false);
  assert.equal(refreshControl.includes("client_report"), false);

  assert.ok(repository.includes('.eq("client_id", input.clientId)'));
  assert.ok(refreshMigration.includes("clients.user_id = auth.uid()"));

  const sample = createSampleTransitAnalysisReport();
  const built = toTransitClientReport(sample);
  const edited = applyTransitClientReportEdits(built, {
    ...built,
    opportunities: { content: "Texto consultante editado por Paula." },
  });
  assert.equal(edited.opportunities.content, "Texto consultante editado por Paula.");
  assert.equal(edited.learnings.content, built.learnings.content);
  assert.equal("astrologicalBasis" in edited.opportunities, false);

  assert.equal(natalClientMigration.includes("transit_analysis_client_reports"), false);
  assert.equal(
    natalClientRepository.includes("transit_analysis_client_reports"),
    false,
  );
  assert.equal(
    natalClientActions.includes("prepareTransitClientReport"),
    false,
  );
  assert.equal(
    natalClientFromProfessional.includes("toTransitClientReport"),
    false,
  );
  assert.ok(natalClientPage.includes("getNatalChartClientReport"));
  assert.equal(natalClientPage.includes("getTransitClientReport"), false);
  assert.ok(natalClientRepository.includes("natal_chart_client_reports"));
  assert.equal(
    natalClientRepository.includes("refresh_transit_client_report_from_professional"),
    false,
  );
  assert.equal(
    natalClientActions.includes("refreshTransitClientReportFromProfessional"),
    false,
  );
  assert.equal(
    natalClientFromProfessional.includes(
      "canExecuteRefreshTransitClientReportFromProfessional",
    ),
    false,
  );
}

function FULL_SELECT_SNIPPET() {
  return "source_report, client_report";
}

run();
console.log("transit client report persistence and RLS tests ok");
