import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  NATAL_CHART_REPORT_STATUS_LABELS,
  TRANSIT_ANALYSIS_REPORT_STATUS_LABELS,
  SOURCE_OUTDATED_BODY,
  SOURCE_OUTDATED_MARK_READY,
  SOURCE_OUTDATED_TITLE,
  CLIENT_VERSION_UNPREPARED_LABEL,
  getNatalChartReportStatusLabel,
  getTransitAnalysisReportStatusLabel,
  isLatestNatalChartReportSummary,
} from "@/lib/reports";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIRNAME, "../../..");

function readRepo(...parts: string[]) {
  return readFileSync(path.join(ROOT, ...parts), "utf8");
}

function run() {
  assert.equal(NATAL_CHART_REPORT_STATUS_LABELS.ready, "Listo para entregar");
  assert.equal(TRANSIT_ANALYSIS_REPORT_STATUS_LABELS.ready, "Listo para entregar");
  assert.equal(getNatalChartReportStatusLabel("ready"), "Listo para entregar");
  assert.equal(
    getTransitAnalysisReportStatusLabel("ready"),
    "Listo para entregar",
  );

  assert.equal(
    SOURCE_OUTDATED_TITLE,
    "El informe profesional cambió después de preparar esta versión consultante.",
  );
  assert.equal(
    SOURCE_OUTDATED_BODY,
    "La versión consultante no se actualiza automáticamente para evitar sobrescribir cambios manuales.",
  );
  assert.equal(
    SOURCE_OUTDATED_MARK_READY,
    "Marcá primero el informe profesional como Listo para entregar.",
  );
  assert.equal(CLIENT_VERSION_UNPREPARED_LABEL, "Todavía no preparada");

  const natalAlert = readRepo("src/components/reports/SourceOutdatedAlert.tsx");
  const transitAlert = readRepo(
    "src/components/reports/TransitSourceOutdatedAlert.tsx",
  );
  const solarAlert = readRepo(
    "src/components/reports/SolarReturnSourceOutdatedAlert.tsx",
  );
  assert.ok(natalAlert.includes("SOURCE_OUTDATED_TITLE"));
  assert.ok(natalAlert.includes("SOURCE_OUTDATED_BODY"));
  assert.ok(natalAlert.includes("SOURCE_OUTDATED_MARK_READY"));
  assert.ok(transitAlert.includes("SourceOutdatedAlert"));
  assert.ok(solarAlert.includes("SourceOutdatedAlert"));

  const natalNav = readRepo("src/components/reports/ReportVersionNav.tsx");
  assert.ok(natalNav.includes("CLIENT_VERSION_UNPREPARED_LABEL"));
  assert.ok(natalNav.includes("aria-describedby"));
  assert.ok(natalNav.includes("aria-disabled"));

  const natalActions = readRepo(
    "src/components/reports/ProfessionalReportActions.tsx",
  );
  const transitActions = readRepo(
    "src/components/reports/TransitProfessionalReportActions.tsx",
  );
  const solarActions = readRepo(
    "src/components/reports/SolarReturnProfessionalReportActions.tsx",
  );
  assert.ok(natalActions.includes("getProfessionalActionHierarchy"));
  assert.ok(transitActions.includes("getProfessionalActionHierarchy"));
  assert.ok(solarActions.includes("getProfessionalActionHierarchy"));
  assert.ok(natalActions.includes("PROFESSIONAL_PDF_DOWNLOAD_LABEL"));
  assert.ok(transitActions.includes("PROFESSIONAL_PDF_DOWNLOAD_LABEL"));
  assert.ok(solarActions.includes("PROFESSIONAL_PDF_DOWNLOAD_LABEL"));
  assert.ok(solarActions.includes("DownloadReportPdfButton"));
  assert.ok(natalActions.includes("variant={hierarchy.pdfVariant}"));
  assert.ok(transitActions.includes("variant={hierarchy.pdfVariant}"));
  assert.ok(solarActions.includes("variant={hierarchy.pdfVariant}"));
  assert.ok(natalActions.includes("hierarchy.prepareVariant"));
  assert.ok(transitActions.includes("hierarchy.prepareVariant"));
  assert.ok(solarActions.includes("hierarchy.prepareVariant"));

  const natalHistory = readRepo(
    "src/components/reports/NatalChartReportsSection.tsx",
  );
  const natalGenerate = readRepo(
    "src/components/reports/NatalChartAnalysisPanel.tsx",
  );
  assert.ok(natalHistory.includes("Más reciente"));
  assert.ok(natalHistory.includes("isLatestNatalChartReportSummary"));
  assert.ok(natalHistory.includes("Ver informe →"));
  assert.ok(natalHistory.includes("Todavía no hay informes generados."));
  assert.equal(natalHistory.includes("geminiModel"), false);
  assert.equal(natalHistory.includes("PAULA_LENS_NAME"), false);
  assert.equal(natalHistory.includes("paulaLensVersion"), false);
  assert.ok(natalGenerate.includes("Informes de Carta Natal"));
  assert.ok(natalGenerate.includes("Generar nuevo informe"));
  assert.ok(natalGenerate.includes("generateNatalChartAnalysisAction"));
  assert.equal(
    natalGenerate.includes("Cada generación crea un informe nuevo"),
    false,
  );
  assert.equal(natalGenerate.includes("<Card"), false);

  assert.equal(
    isLatestNatalChartReportSummary(
      { id: "new", createdAt: "2026-09-02T00:00:00.000Z" },
      [
        { id: "old", createdAt: "2026-08-01T00:00:00.000Z" },
        { id: "new", createdAt: "2026-09-02T00:00:00.000Z" },
      ],
    ),
    true,
  );

  const transitPanel = readRepo(
    "src/components/reports/TransitAnalysisPanel.tsx",
  );
  const transitHistory = readRepo(
    "src/components/reports/TransitAnalysisReportsSection.tsx",
  );
  const transitSection = readRepo(
    "src/components/transits/TransitAnalysesSection.tsx",
  );
  assert.ok(transitPanel.includes("Generar nuevo informe"));
  assert.ok(transitPanel.includes("Generando informe..."));
  assert.equal(transitPanel.includes("Generar análisis"), false);
  assert.ok(transitPanel.includes("Informes generados"));
  assert.ok(transitHistory.includes("Ver informe →"));
  assert.ok(transitHistory.includes("TransitAnalysisPanel"));
  assert.equal(transitHistory.includes("Historial de análisis"), false);
  assert.ok(transitSection.includes("Nuevo período de tránsitos"));
  assert.equal(transitSection.includes("Nuevo análisis"), false);

  const homePage = readRepo("src/app/page.tsx");
  const homePending = readRepo("src/components/home/HomePendingWork.tsx");
  assert.ok(homePage.includes("getPendingNatalChartWork"));
  assert.ok(homePage.includes("getPendingTransitAnalysisWork"));
  assert.ok(homePage.includes("getPendingSolarReturnWork"));
  assert.ok(homePage.includes("mergePendingWork"));
  assert.ok(homePending.includes("getPendingWorkModuleLabel"));
  assert.ok(homePending.includes("No tenés informes pendientes en este momento."));
  assert.ok(homePending.includes("items.length === 0"));

  const ficha = readRepo("src/app/clients/[id]/page.tsx");
  assert.ok(ficha.includes("ClientFichaHub"));
  assert.equal(ficha.includes("NatalChartSection"), false);
  assert.equal(ficha.includes("NatalChartReportsSection"), false);
  assert.equal(ficha.includes("SolarReturnsSection"), false);
  assert.equal(ficha.includes("NatalChartDetails"), false);
  assert.equal(ficha.includes("NatalChartAnalysisPanel"), false);
  assert.equal(ficha.includes("Análisis de Carta Natal"), false);
  const natalPage = readRepo("src/app/clients/[id]/natal-chart/page.tsx");
  assert.ok(natalPage.includes("NatalChartReportsSection"));
  assert.equal(ficha.includes("getPendingSolarReturn"), false);

  const natalProfessional = readRepo(
    "src/app/clients/[id]/reports/[reportId]/page.tsx",
  );
  const transitProfessional = readRepo(
    "src/app/clients/[id]/transits/[transitAnalysisId]/reports/[reportId]/page.tsx",
  );
  const solarProfessional = readRepo(
    "src/app/clients/[id]/solar-returns/[solarReturnId]/reports/[reportId]/page.tsx",
  );
  assert.ok(natalProfessional.includes("GO_TO_CLIENT_VERSION_LABEL"));
  assert.ok(transitProfessional.includes("GO_TO_CLIENT_VERSION_LABEL"));
  assert.ok(solarProfessional.includes("GO_TO_CLIENT_VERSION_LABEL"));
  assert.equal(
    natalProfessional.includes("refreshNatalChartClientReportFromProfessional"),
    false,
  );
  assert.equal(
    transitProfessional.includes("refreshTransitClientReportFromProfessional"),
    false,
  );
  assert.equal(
    solarProfessional.includes("refreshSolarReturnClientReportFromProfessional"),
    false,
  );
}

run();
console.log("ux stage 0 tests ok");
