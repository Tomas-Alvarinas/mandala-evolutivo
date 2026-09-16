import "server-only";

import { formatProfessionalPdfCreditLine } from "@/lib/constants";
import { escapeHtml } from "@/lib/pdf/html";
import { pdfClientReportFooterTemplate } from "@/lib/pdf/page-layout";
import { renderCoverAndBodyPdf } from "@/lib/pdf/render-cover-body";
import { renderSolarReturnClientReportHtmlParts } from "./pdf-html";
import type { SolarReturnClientReport } from "./types";

export {
  PdfGenerationError,
  isPdfGenerationError,
} from "@/lib/pdf/errors";

export async function generateSolarReturnClientReportPdf(input: {
  report: SolarReturnClientReport;
  clientName: string;
  periodStart: string;
  periodEnd: string;
}): Promise<Buffer> {
  const { coverHtml, bodyHtml, clientName } =
    await renderSolarReturnClientReportHtmlParts(input);

  return renderCoverAndBodyPdf({
    coverHtml,
    bodyHtml,
    footerName: clientName,
    footerHtml: pdfClientReportFooterTemplate(
      escapeHtml(formatProfessionalPdfCreditLine()),
    ),
    kind: "solar_client",
  });
}
