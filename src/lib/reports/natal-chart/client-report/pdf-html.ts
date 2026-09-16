import { createElement } from "react";
import {
  NatalChartClientReportBodyDocument,
  NatalChartClientReportCoverDocument,
} from "@/components/reports/pdf/NatalChartClientReportDocument";
import { wrapPdfDocumentHtml } from "@/lib/pdf/html";
import { prepareClientReportForPdf } from "./prepare-pdf";
import type { NatalChartClientReport } from "./types";

export { escapeHtml } from "@/lib/pdf/html";

export async function renderNatalChartClientReportHtmlParts(
  report: NatalChartClientReport,
) {
  const prepared = prepareClientReportForPdf(report);
  const { renderToStaticMarkup } = await import("react-dom/server");

  return {
    coverHtml: wrapPdfDocumentHtml(
      prepared.cover.title,
      renderToStaticMarkup(
        createElement(NatalChartClientReportCoverDocument, {
          report: prepared,
        }),
      ),
      "cover",
    ),
    bodyHtml: wrapPdfDocumentHtml(
      prepared.cover.title,
      renderToStaticMarkup(
        createElement(NatalChartClientReportBodyDocument, {
          report: prepared,
        }),
      ),
      "body",
    ),
    clientName: prepared.cover.clientName,
  };
}
