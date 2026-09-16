import { createElement } from "react";
import {
  SolarReturnProfessionalReportBodyDocument,
  SolarReturnProfessionalReportCoverDocument,
} from "@/components/reports/pdf/SolarReturnProfessionalReportDocument";
import { wrapPdfDocumentHtml } from "@/lib/pdf/html";
import { normalizePdfText } from "@/lib/reports/natal-chart/client-report/normalize-pdf-text";
import { SOLAR_RETURN_PROFESSIONAL_PDF_COVER_TITLE } from "./constants";
import { prepareSolarReturnProfessionalReportForPdf } from "./prepare";
import type { SolarReturnReport } from "../types";

export async function renderSolarReturnProfessionalReportHtmlParts(input: {
  report: SolarReturnReport;
  clientName: string;
}) {
  const prepared = prepareSolarReturnProfessionalReportForPdf(input.report);
  const clientName = normalizePdfText(input.clientName);
  const { renderToStaticMarkup } = await import("react-dom/server");

  return {
    coverHtml: wrapPdfDocumentHtml(
      SOLAR_RETURN_PROFESSIONAL_PDF_COVER_TITLE,
      renderToStaticMarkup(
        createElement(SolarReturnProfessionalReportCoverDocument, {
          clientName,
          periodStart: prepared.metadata.periodStart,
          periodEnd: prepared.metadata.periodEnd,
        }),
      ),
      "cover",
    ),
    bodyHtml: wrapPdfDocumentHtml(
      SOLAR_RETURN_PROFESSIONAL_PDF_COVER_TITLE,
      renderToStaticMarkup(
        createElement(SolarReturnProfessionalReportBodyDocument, {
          report: prepared,
        }),
      ),
      "body",
    ),
    footerName: clientName,
  };
}
