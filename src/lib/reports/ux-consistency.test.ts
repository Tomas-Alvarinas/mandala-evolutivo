import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "path";
import { fileURLToPath } from "node:url";
import {
  CLIENT_VERSION_TAB_LABEL,
  ORIGINAL_VERSION_NOTICE_BODY,
  ORIGINAL_VERSION_NOTICE_TITLE,
  ORIGINAL_VERSION_TAB_LABEL,
  NATAL_CHART_REPORT_STATUS_LABELS,
  SOLAR_RETURN_REPORT_STATUS_LABELS,
  TRANSIT_ANALYSIS_REPORT_STATUS_LABELS,
} from "@/lib/reports";
import { getPendingSolarReturnWorkHref } from "@/lib/reports/solar-returns/pending-work";
import {
  getPendingWorkActionLabel,
  getPendingWorkModuleLabel,
} from "@/lib/home/pending-work";
import { formatGeneratedOnEs, formatLongDateEs } from "@/lib/dates";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIRNAME, "../../..");

function readRepo(...parts: string[]) {
  return readFileSync(path.join(ROOT, ...parts), "utf8");
}

function run() {
  assert.equal(ORIGINAL_VERSION_TAB_LABEL, "Original generado");
  assert.equal(ORIGINAL_VERSION_NOTICE_TITLE, "Original generado");
  assert.equal(
    ORIGINAL_VERSION_NOTICE_BODY.includes("Gemini"),
    false,
  );
  assert.equal(CLIENT_VERSION_TAB_LABEL, "Versión consultante");
  assert.deepEqual(NATAL_CHART_REPORT_STATUS_LABELS, {
    draft: "Borrador",
    reviewed: "Revisado",
    ready: "Listo para entregar",
  });
  assert.deepEqual(
    TRANSIT_ANALYSIS_REPORT_STATUS_LABELS,
    NATAL_CHART_REPORT_STATUS_LABELS,
  );
  assert.deepEqual(
    SOLAR_RETURN_REPORT_STATUS_LABELS,
    NATAL_CHART_REPORT_STATUS_LABELS,
  );
  assert.equal(getPendingWorkModuleLabel("solar"), "Revolución Solar");
  assert.equal(
    getPendingSolarReturnWorkHref({
      clientId: "client-1",
      solarReturnId: "sr-1",
      reportId: "report-1",
    }),
    "/clients/client-1/solar-returns/sr-1/reports/report-1",
  );

  const natalNav = readRepo("src/components/reports/ReportVersionNav.tsx");
  const transitNav = readRepo(
    "src/components/reports/TransitAnalysisReportVersionNav.tsx",
  );
  const solarNav = readRepo(
    "src/components/reports/SolarReturnReportVersionNav.tsx",
  );
  assert.ok(natalNav.includes("ORIGINAL_VERSION_TAB_LABEL"));
  assert.ok(transitNav.includes("ORIGINAL_VERSION_TAB_LABEL"));
  assert.ok(solarNav.includes("ORIGINAL_VERSION_TAB_LABEL"));
  assert.equal(natalNav.includes("Original Gemini"), false);
  assert.equal(transitNav.includes("Original Gemini"), false);
  assert.equal(solarNav.includes("Original Gemini"), false);

  const natalGenerate = readRepo(
    "src/components/reports/NatalChartAnalysisPanel.tsx",
  );
  const transitGenerate = readRepo(
    "src/components/reports/TransitAnalysisPanel.tsx",
  );
  const solarGenerate = readRepo(
    "src/components/reports/SolarReturnAnalysisPanel.tsx",
  );
  assert.ok(natalGenerate.includes("Generar nuevo informe"));
  assert.ok(transitGenerate.includes("Generar nuevo informe"));
  assert.ok(solarGenerate.includes("Generar nuevo informe"));
  assert.equal(transitGenerate.includes("<Card"), false);
  assert.ok(transitGenerate.includes("Informes generados"));
  assert.ok(solarGenerate.includes("Informes generados"));

  const natalHistory = readRepo(
    "src/components/reports/NatalChartReportsSection.tsx",
  );
  const transitHistory = readRepo(
    "src/components/reports/TransitAnalysisReportsSection.tsx",
  );
  const solarHistory = readRepo(
    "src/components/reports/SolarReturnReportsSection.tsx",
  );
  assert.ok(natalHistory.includes("Ver informe →"));
  assert.ok(transitHistory.includes("Ver informe →"));
  assert.ok(solarHistory.includes("Ver informe →"));
  assert.ok(transitHistory.includes("TransitAnalysisPanel"));
  assert.equal(transitHistory.includes("methodologyVersion"), false);
  assert.equal(solarHistory.includes("methodologyVersion"), false);

  const homePage = readRepo("src/app/page.tsx");
  const homePending = readRepo("src/components/home/HomePendingWork.tsx");
  assert.ok(homePage.includes("getPendingSolarReturnWork"));
  assert.ok(homePage.includes("Herramienta profesional para organizar consultantes"));
  assert.ok(homePage.includes("EmptyState"));
  assert.ok(homePending.includes("ReportStatusBadge"));
  assert.ok(homePending.includes("contextLabel"));

  const loginForm = readRepo("src/components/auth/LoginForm.tsx");
  const loginPage = readRepo("src/app/login/page.tsx");
  assert.ok(loginForm.includes("Correo electrónico"));
  assert.equal(loginForm.includes('label="Email"'), false);
  assert.ok(loginPage.includes("<Card"));
  assert.equal(loginPage.includes(".env.example"), false);

  const hub = readRepo("src/components/clients/ClientFichaHub.tsx");
  assert.equal(hub.includes("uppercase"), false);
  assert.ok(hub.includes("getClientFichaHubHref"));
  assert.equal(hub.includes("href={`#${item.id}`}"), false);

  const transitsSection = readRepo(
    "src/components/transits/TransitAnalysesSection.tsx",
  );
  assert.ok(transitsSection.includes("Tránsitos y Eclipses"));
  assert.ok(transitsSection.includes("FICHA_PREVIEW_LIMIT = 3"));

  const natalOriginal = readRepo(
    "src/app/clients/[id]/reports/[reportId]/original/page.tsx",
  );
  const transitOriginal = readRepo(
    "src/app/clients/[id]/transits/[transitAnalysisId]/reports/[reportId]/original/page.tsx",
  );
  const solarOriginal = readRepo(
    "src/app/clients/[id]/solar-returns/[solarReturnId]/reports/[reportId]/original/page.tsx",
  );
  assert.ok(natalOriginal.includes("ORIGINAL_VERSION_NOTICE_TITLE"));
  assert.ok(transitOriginal.includes("ORIGINAL_VERSION_NOTICE_TITLE"));
  assert.ok(solarOriginal.includes("ORIGINAL_VERSION_NOTICE_TITLE"));
  assert.equal(natalOriginal.includes("Gemini"), false);
  assert.equal(transitOriginal.includes("Gemini"), false);
  assert.equal(solarOriginal.includes("Gemini"), false);
  assert.ok(natalOriginal.includes('variant="original"'));
  assert.ok(transitOriginal.includes('variant="original"'));
  assert.ok(solarOriginal.includes('variant="original"'));

  assert.equal(getPendingWorkActionLabel("draft"), "Continuar informe");
  assert.equal(getPendingWorkActionLabel("reviewed"), "Continuar informe");
  assert.equal(
    getPendingWorkActionLabel("ready_without_client_report"),
    "Continuar informe",
  );
  assert.ok(homePending.includes("Continuar informe") === false);
  assert.ok(homePending.includes("getPendingWorkActionLabel"));

  const natalView = readRepo("src/components/reports/NatalChartReportView.tsx");
  const transitView = readRepo(
    "src/components/reports/TransitAnalysisReportView.tsx",
  );
  const solarView = readRepo("src/components/reports/SolarReturnReportView.tsx");
  const natalClientView = readRepo(
    "src/components/reports/NatalChartClientReportView.tsx",
  );
  assert.equal(natalView.includes("Datos técnicos"), false);
  assert.equal(transitView.includes("Datos técnicos"), false);
  assert.equal(solarView.includes("Datos técnicos"), false);
  assert.equal(natalClientView.includes("Datos técnicos"), false);
  assert.equal(natalView.includes("geminiModel"), false);
  assert.equal(transitView.includes("geminiModel"), false);
  assert.equal(natalView.includes("Gemini"), false);
  assert.equal(transitView.includes("Gemini"), false);
  assert.equal(solarView.includes("Gemini"), false);

  const natalWorkspace = readRepo(
    "src/components/reports/NatalChartReportWorkspace.tsx",
  );
  const transitWorkspace = readRepo(
    "src/components/reports/TransitAnalysisReportWorkspace.tsx",
  );
  const solarWorkspace = readRepo(
    "src/components/reports/SolarReturnReportWorkspace.tsx",
  );
  assert.ok(natalWorkspace.includes("formatGeneratedOnEs"));
  assert.ok(transitWorkspace.includes("formatGeneratedOnEs"));
  assert.ok(solarWorkspace.includes("formatGeneratedOnEs"));
  assert.ok(natalWorkspace.includes("lg:ml-auto"));
  assert.ok(transitWorkspace.includes("lg:ml-auto"));
  assert.ok(solarWorkspace.includes("lg:ml-auto"));
  assert.equal(natalWorkspace.includes("formatDateTimeEs"), false);
  assert.equal(transitWorkspace.includes("formatDateTimeEs"), false);
  assert.equal(solarWorkspace.includes("formatDateTimeEs"), false);

  const natalClientActions = readRepo(
    "src/components/reports/ClientReportActions.tsx",
  );
  const transitClientActions = readRepo(
    "src/components/reports/TransitClientReportActions.tsx",
  );
  const solarClientActions = readRepo(
    "src/components/reports/SolarReturnClientReportActions.tsx",
  );
  assert.ok(natalClientActions.includes('variant="primary"'));
  assert.ok(transitClientActions.includes('variant="primary"'));
  assert.ok(solarClientActions.includes('variant="primary"'));
  assert.ok(natalClientActions.includes("Editar versión consultante"));
  assert.ok(transitClientActions.includes("Editar versión consultante"));
  assert.ok(solarClientActions.includes("Editar versión consultante"));
  assert.equal(natalClientActions.includes("Descargar PDF profesional"), false);
  const natalProfessionalActions = readRepo(
    "src/components/reports/ProfessionalReportActions.tsx",
  );
  assert.equal(
    natalProfessionalActions.includes("Descargar PDF profesional"),
    false,
  );
  assert.ok(natalProfessionalActions.includes("PROFESSIONAL_PDF_DOWNLOAD_LABEL"));
  assert.ok(natalProfessionalActions.includes("variant={hierarchy.pdfVariant}"));
  assert.ok(natalProfessionalActions.includes("Editar informe"));

  const transitClientView = readRepo(
    "src/components/reports/TransitClientReportView.tsx",
  );
  const solarClientView = readRepo(
    "src/components/reports/SolarReturnClientReportView.tsx",
  );
  assert.equal(natalClientView.includes("Versión consultante"), false);
  assert.equal(transitClientView.includes("Versión consultante"), false);
  assert.equal(solarClientView.includes("Versión consultante"), false);
  assert.equal(transitClientView.includes("uppercase"), false);
  assert.equal(solarClientView.includes("uppercase"), false);

  const fichaPage = readRepo("src/app/clients/[id]/page.tsx");
  assert.ok(fichaPage.includes("Editar consultante"));
  assert.equal(fichaPage.includes("NatalChartSection"), false);
  assert.equal(fichaPage.includes("NatalChartReportsSection"), false);
  assert.equal(fichaPage.includes("TransitAnalysesSection"), false);
  assert.equal(fichaPage.includes("SolarReturnsSection"), false);

  const solarListPage = readRepo("src/app/clients/[id]/solar-returns/page.tsx");
  const solarDetailPage = readRepo(
    "src/app/clients/[id]/solar-returns/[solarReturnId]/page.tsx",
  );
  assert.ok(solarListPage.includes("showDelete"));
  assert.ok(solarDetailPage.includes("DeleteSolarReturnControl"));

  const transitPendingRepo = readRepo(
    "src/lib/reports/transits/repository.ts",
  );
  assert.ok(transitPendingRepo.includes("transit_analyses!inner(analysis_date)"));
  assert.ok(homePage.includes("contextLabel: item.contextLabel"));

  assert.equal(hub.includes("hasNatalChart"), false);
  assert.equal(hub.includes("mt-auto"), false);
  assert.equal(hub.includes("Ver →"), false);
  assert.ok(hub.includes("FichaNatalIcon"));
  assert.equal(hub.includes("FichaReportsIcon"), false);
  assert.ok(hub.includes("FichaTransitsIcon"));
  assert.ok(hub.includes("FichaSolarIcon"));
  assert.ok(hub.includes('aria-hidden="true"'));

  const generated = formatGeneratedOnEs("2026-09-08T16:42:00.000Z");
  assert.equal(generated.startsWith("Generado el "), true);
  assert.equal(generated.includes("/"), false);
  assert.equal(formatLongDateEs("2026-09-08T16:42:00.000Z").includes("septiembre"), true);

  const natalGenerateAction = readRepo("src/lib/ai/natal-chart/actions.ts");
  const transitGenerateAction = readRepo("src/lib/ai/transits/actions.ts");
  const solarGenerateAction = readRepo("src/lib/ai/solar-returns/actions.ts");
  assert.equal(natalGenerateAction.includes("Gemini no pudo"), false);
  assert.equal(transitGenerateAction.includes("Gemini no pudo"), false);
  assert.equal(solarGenerateAction.includes("Gemini no pudo"), false);
  assert.equal(natalGenerateAction.includes("Falta configurar Supabase"), false);
  assert.equal(transitGenerateAction.includes("Falta configurar Supabase"), false);
  assert.equal(solarGenerateAction.includes("Falta configurar Supabase"), false);
}

run();
console.log("ux consistency tests ok");
