import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { formatProfessionalPdfCreditLine } from "@/lib/constants";
import { escapeHtml } from "@/lib/pdf/html";
import { pdfClientReportFooterTemplate } from "@/lib/pdf/page-layout";
import { TRANSIT_ANALYSIS_REPORT_SECTION_LABELS } from "../constants";
import { toTransitClientReport } from "./from-professional";
import { toTransitClientPdfFilename } from "./pdf-filename";
import { renderTransitClientReportHtmlParts } from "./pdf-html";
import { prepareTransitClientReportForPdf } from "./prepare-pdf";
import { createTransitProfessionalPdfSampleReport } from "../professional-pdf/sample";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIRNAME, "../../../../..");

function readRepo(...parts: string[]) {
  return readFileSync(path.join(ROOT, ...parts), "utf8");
}

async function run() {
  const professional = createTransitProfessionalPdfSampleReport();
  const sample = toTransitClientReport(professional);
  sample.learnings.content =
    "El aprendizaje posible es habitar la pregunta sin forzar respuesta.";

  const prepared = prepareTransitClientReportForPdf({
    ...sample,
    availableResources: {
      content: "Hay recursos de auto\u00ADcustodia y de diálogo interno.",
    },
  });
  assert.match(prepared.availableResources.content, /autocustodia/);
  assert.doesNotMatch(prepared.availableResources.content, /\u00AD/);
  assert.equal("astrologicalBasis" in prepared.mandalaImpact, false);

  const { coverHtml, bodyHtml, clientName } =
    await renderTransitClientReportHtmlParts({
      report: sample,
      clientName: "Tomas Alvariñas",
      analysisDate: professional.metadata.analysisDate,
    });

  assert.equal(clientName, "Tomas Alvariñas");
  assert.match(coverHtml, /Análisis de Tránsitos y Eclipses/);
  assert.match(coverHtml, /Lectura de tu momento actual/);
  assert.match(coverHtml, /Tomas Alvariñas/);
  assert.match(coverHtml, /2 de septiembre de 2026/);
  assert.match(coverHtml, /pdf-cover/);
  assert.doesNotMatch(coverHtml, /Informe profesional/);
  assert.doesNotMatch(coverHtml, /Base astrológica/);
  assert.doesNotMatch(coverHtml, /aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee/);

  assert.match(bodyHtml, /pdf-body/);
  for (const label of Object.values(TRANSIT_ANALYSIS_REPORT_SECTION_LABELS)) {
    assert.match(bodyHtml, new RegExp(label));
  }
  assert.match(bodyHtml, /¿cómo estás, ñandú\?/);
  assert.match(
    bodyHtml,
    /El aprendizaje posible es habitar la pregunta sin forzar respuesta\./,
  );
  assert.doesNotMatch(bodyHtml, /Base astrológica/);
  assert.doesNotMatch(bodyHtml, /Júpiter en tránsito en Leo por Casa 5/);
  assert.doesNotMatch(bodyHtml, /class="tech-meta"/);
  assert.doesNotMatch(bodyHtml, /class="astro-basis"/);
  assert.doesNotMatch(bodyHtml, /reportVersion/);
  assert.doesNotMatch(bodyHtml, /methodologyVersion/);
  assert.doesNotMatch(bodyHtml, /source_report/);
  assert.doesNotMatch(bodyHtml, /sourceOutdated/);
  assert.doesNotMatch(bodyHtml, />Borrador</);
  assert.doesNotMatch(bodyHtml, />Revisado</);
  assert.doesNotMatch(bodyHtml, />Listo</);
  assert.doesNotMatch(bodyHtml, /generated_report/);
  assert.doesNotMatch(bodyHtml, /Original Gemini/);
  assert.doesNotMatch(bodyHtml, /gemini/i);

  const clientFooter = pdfClientReportFooterTemplate(
    escapeHtml(formatProfessionalPdfCreditLine()),
  );
  assert.match(clientFooter, /Lic\. Paula Martini/);
  assert.match(clientFooter, /pageNumber/);
  assert.doesNotMatch(clientFooter, />Mandala Evolutivo</);
  assert.doesNotMatch(clientFooter, /Tomas Alvariñas/);

  assert.equal(
    toTransitClientPdfFilename("Tomas Alvariñas"),
    "mandala-evolutivo-transitos-tomas-alvarinas.pdf",
  );

  const generateSource = readFileSync(path.join(DIRNAME, "pdf.ts"), "utf8");
  const htmlSource = readFileSync(path.join(DIRNAME, "pdf-html.ts"), "utf8");
  const routeSource = readRepo(
    "src/app/api/clients/[id]/transits/[transitAnalysisId]/reports/[reportId]/client/pdf/route.ts",
  );

  assert.ok(htmlSource.includes("input.report"));
  assert.ok(generateSource.includes("renderTransitClientReportHtmlParts(input)"));
  assert.ok(generateSource.includes('kind: "transit_client"'));
  assert.equal(generateSource.includes("generatedReport"), false);
  assert.ok(routeSource.includes("clientReportResult.data.clientReport"));
  assert.equal(routeSource.includes("reportResult.data.report"), false);
  assert.equal(routeSource.includes("generatedReport"), false);
  assert.ok(routeSource.includes("getAuthenticatedUser"));
  assert.ok(routeSource.includes("jsonError(\"No autorizado.\", 401)"));
  assert.ok(routeSource.includes("analysisResult.data.clientId"));
  assert.equal(routeSource.includes("status === \"ready\""), false);
  assert.equal(routeSource.includes("sourceOutdated"), false);
  assert.equal(routeSource.includes("isTransitClientReportSourceOutdated"), false);
  assert.equal(routeSource.includes("@google/genai"), false);
  assert.equal(routeSource.includes("toTransitClientReport("), false);
}

run()
  .then(() => {
    console.log("transit client-pdf tests ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
