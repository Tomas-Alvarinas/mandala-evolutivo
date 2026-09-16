import type { SolarReturnReportStatus } from "../status";

export function shouldOfferPrepareSolarReturnClientReport(input: {
  status: SolarReturnReportStatus;
  hasClientReport: boolean;
}) {
  return input.status === "ready" && !input.hasClientReport;
}

export function getSolarReturnProfessionalReportNextStep(input: {
  status: SolarReturnReportStatus;
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
