import { createElement } from "react";
import {
  SolarReturnClientReportBodyDocument,
  SolarReturnClientReportCoverDocument,
} from "@/components/reports/pdf/SolarReturnClientReportDocument";
import { wrapPdfDocumentHtml } from "@/lib/pdf/html";
import { normalizePdfText } from "@/lib/reports/natal-chart/client-report/normalize-pdf-text";
import { SOLAR_RETURN_CLIENT_PDF_COVER_TITLE } from "./pdf-constants";
import { prepareSolarReturnClientReportForPdf } from "./prepare-pdf";
import type { SolarReturnClientReport } from "./types";

export async function renderSolarReturnClientReportHtmlParts(input: {
  report: SolarReturnClientReport;
  clientName: string;
  periodStart: string;
  periodEnd: string;
}) {
  const prepared = prepareSolarReturnClientReportForPdf(input.report);
  const clientName = normalizePdfText(input.clientName);
  const { renderToStaticMarkup } = await import("react-dom/server");

  return {
    coverHtml: wrapPdfDocumentHtml(
      SOLAR_RETURN_CLIENT_PDF_COVER_TITLE,
      renderToStaticMarkup(
        createElement(SolarReturnClientReportCoverDocument, {
          clientName,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
        }),
      ),
      "cover",
    ),
    bodyHtml: wrapPdfDocumentHtml(
      SOLAR_RETURN_CLIENT_PDF_COVER_TITLE,
      renderToStaticMarkup(
        createElement(SolarReturnClientReportBodyDocument, {
          report: prepared,
        }),
      ),
      "body",
    ),
    clientName,
  };
}
