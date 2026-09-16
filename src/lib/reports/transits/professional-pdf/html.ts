import { createElement } from "react";
import {
  TransitAnalysisProfessionalReportBodyDocument,
  TransitAnalysisProfessionalReportCoverDocument,
} from "@/components/reports/pdf/TransitAnalysisProfessionalReportDocument";
import { wrapPdfDocumentHtml } from "@/lib/pdf/html";
import { normalizePdfText } from "@/lib/reports/natal-chart/client-report/normalize-pdf-text";
import { TRANSIT_ANALYSIS_PROFESSIONAL_PDF_COVER_TITLE } from "./constants";
import { prepareTransitAnalysisProfessionalReportForPdf } from "./prepare";
import type { TransitAnalysisReport } from "../types";

export async function renderTransitAnalysisProfessionalReportHtmlParts(input: {
  report: TransitAnalysisReport;
  clientName: string;
}) {
  const prepared = prepareTransitAnalysisProfessionalReportForPdf(input.report);
  const clientName = normalizePdfText(input.clientName);
  const { renderToStaticMarkup } = await import("react-dom/server");

  return {
    coverHtml: wrapPdfDocumentHtml(
      TRANSIT_ANALYSIS_PROFESSIONAL_PDF_COVER_TITLE,
      renderToStaticMarkup(
        createElement(TransitAnalysisProfessionalReportCoverDocument, {
          clientName,
          analysisDate: prepared.metadata.analysisDate,
        }),
      ),
      "cover",
    ),
    bodyHtml: wrapPdfDocumentHtml(
      TRANSIT_ANALYSIS_PROFESSIONAL_PDF_COVER_TITLE,
      renderToStaticMarkup(
        createElement(TransitAnalysisProfessionalReportBodyDocument, {
          report: prepared,
        }),
      ),
      "body",
    ),
    footerName: clientName,
  };
}
