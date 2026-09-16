import "server-only";

import { renderCoverAndBodyPdf } from "@/lib/pdf/render-cover-body";
import { renderNatalChartProfessionalReportHtmlParts } from "./html";
import type { NatalChartReport } from "@/lib/reports/natal-chart/types";
import type { ProfessionalPdfTechnical } from "@/components/reports/pdf/NatalChartProfessionalReportDocument";

export {
  PdfGenerationError,
  isPdfGenerationError,
} from "@/lib/pdf/errors";

export async function generateNatalChartProfessionalReportPdf(input: {
  report: NatalChartReport;
  clientName: string;
  technical?: ProfessionalPdfTechnical;
}): Promise<Buffer> {
  const { coverHtml, bodyHtml, footerName } =
    await renderNatalChartProfessionalReportHtmlParts(input);

  return renderCoverAndBodyPdf({
    coverHtml,
    bodyHtml,
    footerName,
    kind: "natal_professional",
  });
}
