import type { NatalChartReportStatus } from "./status";

export function shouldOfferPrepareClientReport(input: {
  status: NatalChartReportStatus;
  hasClientReport: boolean;
}) {
  return input.status === "ready" && !input.hasClientReport;
}

export function getProfessionalReportNextStep(input: {
  status: NatalChartReportStatus;
  hasClientReport: boolean;
}) {
  if (input.status === "draft") {
    return "Revisá el informe profesional y cambiá el estado cuando esté listo.";
  }

  if (input.status === "reviewed") {
    return "Marcá el informe como Listo para entregar para preparar la versión consultante.";
  }

  if (!input.hasClientReport) {
    return "Prepará la versión consultante. El PDF de este informe profesional se puede descargar ahora.";
  }

  return "Podés descargar el PDF de este informe profesional. La versión consultante tiene su propia descarga.";
}
