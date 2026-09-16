import "server-only";

import { renderCoverAndBodyPdf } from "@/lib/pdf/render-cover-body";
import { renderSolarReturnProfessionalReportHtmlParts } from "./html";
import type { SolarReturnReport } from "../types";

export {
  PdfGenerationError,
  isPdfGenerationError,
} from "@/lib/pdf/errors";

export async function generateSolarReturnProfessionalReportPdf(input: {
  report: SolarReturnReport;
  clientName: string;
}): Promise<Buffer> {
  const { coverHtml, bodyHtml, footerName } =
    await renderSolarReturnProfessionalReportHtmlParts(input);

  return renderCoverAndBodyPdf({
    coverHtml,
    bodyHtml,
    footerName,
    kind: "solar_professional",
  });
}
