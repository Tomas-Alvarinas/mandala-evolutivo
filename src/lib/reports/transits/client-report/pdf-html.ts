import { createElement } from "react";
import {
  TransitClientReportBodyDocument,
  TransitClientReportCoverDocument,
} from "@/components/reports/pdf/TransitClientReportDocument";
import { wrapPdfDocumentHtml } from "@/lib/pdf/html";
import { normalizePdfText } from "@/lib/reports/natal-chart/client-report/normalize-pdf-text";
import { TRANSIT_CLIENT_PDF_COVER_TITLE } from "./pdf-constants";
import { prepareTransitClientReportForPdf } from "./prepare-pdf";
import type { TransitClientReport } from "./types";

export async function renderTransitClientReportHtmlParts(input: {
  report: TransitClientReport;
  clientName: string;
  analysisDate: string;
}) {
  const prepared = prepareTransitClientReportForPdf(input.report);
  const clientName = normalizePdfText(input.clientName);
  const { renderToStaticMarkup } = await import("react-dom/server");

  return {
    coverHtml: wrapPdfDocumentHtml(
      TRANSIT_CLIENT_PDF_COVER_TITLE,
      renderToStaticMarkup(
        createElement(TransitClientReportCoverDocument, {
          clientName,
          analysisDate: input.analysisDate,
        }),
      ),
      "cover",
    ),
    bodyHtml: wrapPdfDocumentHtml(
      TRANSIT_CLIENT_PDF_COVER_TITLE,
      renderToStaticMarkup(
        createElement(TransitClientReportBodyDocument, {
          report: prepared,
        }),
      ),
      "body",
    ),
    clientName,
  };
}
