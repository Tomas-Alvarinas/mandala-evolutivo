import type { TransitAnalysisReportStatus } from "../status";

export function shouldOfferPrepareTransitClientReport(input: {
  status: TransitAnalysisReportStatus;
  hasClientReport: boolean;
}) {
  return input.status === "ready" && !input.hasClientReport;
}

export function getTransitProfessionalReportNextStep(input: {
  status: TransitAnalysisReportStatus;
  hasClientReport: boolean;
}) {
  if (input.status === "draft" || input.status === "reviewed") {
    return "Marcá el informe profesional como Listo para entregar antes de preparar la versión consultante.";
  }

  if (!input.hasClientReport) {
    return "Prepará la versión consultante.";
  }

  return "La versión consultante está disponible.";
}
