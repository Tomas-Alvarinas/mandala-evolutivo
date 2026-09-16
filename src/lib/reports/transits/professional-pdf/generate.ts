import "server-only";

import { renderCoverAndBodyPdf } from "@/lib/pdf/render-cover-body";
import { renderTransitAnalysisProfessionalReportHtmlParts } from "./html";
import type { TransitAnalysisReport } from "../types";

export {
  PdfGenerationError,
  isPdfGenerationError,
} from "@/lib/pdf/errors";

export async function generateTransitAnalysisProfessionalReportPdf(input: {
  report: TransitAnalysisReport;
  clientName: string;
}): Promise<Buffer> {
  const { coverHtml, bodyHtml, footerName } =
    await renderTransitAnalysisProfessionalReportHtmlParts(input);

  return renderCoverAndBodyPdf({
    coverHtml,
    bodyHtml,
    footerName,
    kind: "transit_professional",
  });
}
