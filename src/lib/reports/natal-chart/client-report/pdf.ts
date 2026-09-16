import "server-only";

import { formatProfessionalPdfCreditLine } from "@/lib/constants";
import { escapeHtml } from "@/lib/pdf/html";
import { pdfClientReportFooterTemplate } from "@/lib/pdf/page-layout";
import { renderCoverAndBodyPdf } from "@/lib/pdf/render-cover-body";
import { renderNatalChartClientReportHtmlParts } from "./pdf-html";
import type { NatalChartClientReport } from "./types";

export {
  PdfGenerationError,
  isPdfGenerationError,
} from "@/lib/pdf/errors";

export async function generateNatalChartClientReportPdf(input: {
  report: NatalChartClientReport;
}): Promise<Buffer> {
  const { coverHtml, bodyHtml, clientName } =
    await renderNatalChartClientReportHtmlParts(input.report);

  return renderCoverAndBodyPdf({
    coverHtml,
    bodyHtml,
    footerName: clientName,
    footerHtml: pdfClientReportFooterTemplate(
      escapeHtml(formatProfessionalPdfCreditLine()),
    ),
    kind: "natal_client",
  });
}
