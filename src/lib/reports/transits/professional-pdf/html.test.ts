import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transitAnalysisReportSchema } from "@/lib/ai/transits/schema";
import { APP_NAME } from "@/lib/constants";
import { escapeHtml } from "@/lib/pdf/html";
import { pdfFooterTemplate } from "@/lib/pdf/page-layout";
import { TRANSIT_ANALYSIS_REPORT_SECTION_LABELS } from "../constants";
import { toTransitAnalysisProfessionalPdfFilename } from "./filename";
import { renderTransitAnalysisProfessionalReportHtmlParts } from "./html";
import { prepareTransitAnalysisProfessionalReportForPdf } from "./prepare";
import { createTransitProfessionalPdfSampleReport } from "./sample";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIRNAME, "../../../../..");

function readRepo(...parts: string[]) {
  return readFileSync(path.join(ROOT, ...parts), "utf8");
}

async function run() {
  const sample = createTransitProfessionalPdfSampleReport();
  const parsed = transitAnalysisReportSchema.safeParse(sample);
  assert.equal(parsed.success, true);

  const prepared = prepareTransitAnalysisProfessionalReportForPdf(sample);
  assert.match(prepared.availableResources.content, /autocustodia/);
  assert.doesNotMatch(prepared.availableResources.content, /\u00AD/);
  assert.match(prepared.mandalaImpact.content, /ñandú/);
  assert.match(prepared.mandalaImpact.content, /—/);

  const { coverHtml, bodyHtml, footerName } =
    await renderTransitAnalysisProfessionalReportHtmlParts({
      report: sample,
      clientName: "Tomas Alvariñas",
    });

  assert.equal(footerName, "Tomas Alvariñas");
  assert.notEqual(footerName, APP_NAME);

  const professionalFooter = pdfFooterTemplate(escapeHtml(footerName));
  assert.match(professionalFooter, /Tomas Alvariñas/);
  assert.match(professionalFooter, /pageNumber/);
  assert.doesNotMatch(professionalFooter, />Mandala Evolutivo</);

  assert.match(coverHtml, /Análisis de Tránsitos y Eclipses/);
  assert.match(coverHtml, /Informe profesional/);
  assert.match(coverHtml, /Tomas Alvariñas/);
  assert.match(coverHtml, /2 de septiembre de 2026/);
  assert.match(coverHtml, /pdf-cover/);
  assert.doesNotMatch(coverHtml, /aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee/);

  assert.match(bodyHtml, /pdf-body/);
  for (const label of Object.values(TRANSIT_ANALYSIS_REPORT_SECTION_LABELS)) {
    assert.match(bodyHtml, new RegExp(label));
  }
  assert.match(bodyHtml, /Base astrológica/);
  assert.match(bodyHtml, /Júpiter en tránsito en Leo por Casa 5/);
  assert.match(bodyHtml, /Júpiter trígono Venus natal/);
  assert.match(bodyHtml, /¿cómo estás, ñandú\?/);
  assert.match(
    bodyHtml,
    /El aprendizaje posible es habitar la pregunta sin forzar respuesta\./,
  );
  assert.match(bodyHtml, /Datos técnicos/);
  assert.match(bodyHtml, /Informe 1\.0/);
  assert.doesNotMatch(bodyHtml, /generated_report/);
  assert.doesNotMatch(bodyHtml, /client_report/);
  assert.doesNotMatch(bodyHtml, /aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee/);
  assert.doesNotMatch(bodyHtml, />Borrador</);
  assert.doesNotMatch(bodyHtml, />Revisado</);
  assert.doesNotMatch(bodyHtml, />Listo</);

  assert.equal(
    toTransitAnalysisProfessionalPdfFilename("Tomas Alvariñas"),
    "mandala-evolutivo-transitos-profesional-tomas-alvarinas.pdf",
  );

  const generateSource = readFileSync(path.join(DIRNAME, "generate.ts"), "utf8");
  const htmlSource = readFileSync(path.join(DIRNAME, "html.ts"), "utf8");
  const routeSource = readRepo(
    "src/app/api/clients/[id]/transits/[transitAnalysisId]/reports/[reportId]/pdf/route.ts",
  );
  const nextConfig = readRepo("next.config.ts");

  assert.ok(htmlSource.includes("input.report"));
  assert.ok(generateSource.includes("renderTransitAnalysisProfessionalReportHtmlParts(input)"));
  assert.ok(generateSource.includes('kind: "transit_professional"'));
  assert.equal(generateSource.includes("generatedReport"), false);
  assert.equal(generateSource.includes("generated_report"), false);
  assert.equal(htmlSource.includes("generated_report"), false);
  assert.ok(routeSource.includes("reportResult.data.report"));
  assert.equal(routeSource.includes("generatedReport"), false);
  assert.ok(routeSource.includes("getAuthenticatedUser"));
  assert.ok(routeSource.includes("getTransitAnalysisReportById"));
  assert.ok(routeSource.includes("jsonError(\"No autorizado.\", 401)"));
  assert.ok(routeSource.includes("analysisResult.data.clientId"));
  assert.equal(routeSource.includes("status === \"ready\""), false);
  assert.equal(routeSource.includes("@google/genai"), false);

  assert.ok(nextConfig.includes("playwright-core"));
  assert.ok(nextConfig.includes("@sparticuz/chromium"));
  assert.ok(nextConfig.includes("pdf-lib"));
  assert.ok(nextConfig.includes('"/api/**"'));
  assert.ok(nextConfig.includes("serverExternalPackages"));
}

run()
  .then(() => {
    console.log("transit professional-pdf tests ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
