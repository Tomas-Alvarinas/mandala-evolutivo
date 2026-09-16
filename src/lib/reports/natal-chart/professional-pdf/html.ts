import { createElement } from "react";
import {
  NatalChartProfessionalReportBodyDocument,
  NatalChartProfessionalReportCoverDocument,
  type ProfessionalPdfTechnical,
} from "@/components/reports/pdf/NatalChartProfessionalReportDocument";
import { wrapPdfDocumentHtml } from "@/lib/pdf/html";
import { normalizePdfText } from "@/lib/reports/natal-chart/client-report/normalize-pdf-text";
import { NATAL_CHART_PROFESSIONAL_PDF_COVER_TITLE } from "./constants";
import { prepareProfessionalReportForPdf } from "./prepare";
import type { NatalChartReport } from "@/lib/reports/natal-chart/types";

export async function renderNatalChartProfessionalReportHtmlParts(input: {
  report: NatalChartReport;
  clientName: string;
  technical?: ProfessionalPdfTechnical;
}) {
  const prepared = prepareProfessionalReportForPdf(input.report);
  const clientName = normalizePdfText(input.clientName);
  const { renderToStaticMarkup } = await import("react-dom/server");

  return {
    coverHtml: wrapPdfDocumentHtml(
      NATAL_CHART_PROFESSIONAL_PDF_COVER_TITLE,
      renderToStaticMarkup(
        createElement(NatalChartProfessionalReportCoverDocument, {
          clientName,
          generatedAt: prepared.metadata.generatedAt,
        }),
      ),
      "cover",
    ),
    bodyHtml: wrapPdfDocumentHtml(
      NATAL_CHART_PROFESSIONAL_PDF_COVER_TITLE,
      renderToStaticMarkup(
        createElement(NatalChartProfessionalReportBodyDocument, {
          report: prepared,
          technical: input.technical,
        }),
      ),
      "body",
    ),
    footerName: clientName,
  };
}
