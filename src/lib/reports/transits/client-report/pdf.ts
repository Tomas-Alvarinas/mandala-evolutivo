import "server-only";

import { formatProfessionalPdfCreditLine } from "@/lib/constants";
import { escapeHtml } from "@/lib/pdf/html";
import { pdfClientReportFooterTemplate } from "@/lib/pdf/page-layout";
import { renderCoverAndBodyPdf } from "@/lib/pdf/render-cover-body";
import { renderTransitClientReportHtmlParts } from "./pdf-html";
import type { TransitClientReport } from "./types";

export {
  PdfGenerationError,
  isPdfGenerationError,
} from "@/lib/pdf/errors";

export async function generateTransitClientReportPdf(input: {
  report: TransitClientReport;
  clientName: string;
  analysisDate: string;
}): Promise<Buffer> {
  const { coverHtml, bodyHtml, clientName } =
    await renderTransitClientReportHtmlParts(input);

  return renderCoverAndBodyPdf({
    coverHtml,
    bodyHtml,
    footerName: clientName,
    footerHtml: pdfClientReportFooterTemplate(
      escapeHtml(formatProfessionalPdfCreditLine()),
    ),
    kind: "transit_client",
  });
}
