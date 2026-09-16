import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { formatProfessionalPdfCreditLine } from "@/lib/constants";
import { escapeHtml } from "@/lib/pdf/html";
import { pdfClientReportFooterTemplate } from "@/lib/pdf/page-layout";
import { SOLAR_RETURN_REPORT_SECTION_LABELS } from "../constants";
import { toSolarReturnClientReport } from "./from-professional";
import { toSolarReturnClientPdfFilename } from "./pdf-filename";
import { renderSolarReturnClientReportHtmlParts } from "./pdf-html";
import { prepareSolarReturnClientReportForPdf } from "./prepare-pdf";
import { createSolarReturnProfessionalPdfSampleReport } from "../professional-pdf/sample";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIRNAME, "../../../../..");

function readRepo(...parts: string[]) {
  return readFileSync(path.join(ROOT, ...parts), "utf8");
}

async function run() {
  const professionalB = createSolarReturnProfessionalPdfSampleReport();
  professionalB.annualTheme.content =
    "Informe profesional editado B — no debe aparecer en el PDF consultante.";
  const sample = toSolarReturnClientReport(professionalB);
  sample.annualTheme.content =
    "Versión consultante C. El aprendizaje posible es habitar la pregunta.";
  sample.learnings.content =
    "El aprendizaje posible es habitar la pregunta sin forzar respuesta.";

  const prepared = prepareSolarReturnClientReportForPdf({
    ...sample,
    energyConcentration: {
      content: "Hay una concentración de auto\u00ADcustodia y de diálogo interno.",
    },
  });
  assert.match(prepared.energyConcentration.content, /autocustodia/);
  assert.doesNotMatch(prepared.energyConcentration.content, /\u00AD/);
  assert.equal("astrologicalBasis" in prepared.annualTheme, false);

  const { coverHtml, bodyHtml, clientName } =
    await renderSolarReturnClientReportHtmlParts({
      report: sample,
      clientName: "Tomas Alvariñas",
      periodStart: professionalB.metadata.periodStart,
      periodEnd: professionalB.metadata.periodEnd,
    });

  assert.equal(clientName, "Tomas Alvariñas");
  assert.match(coverHtml, /Revolución Solar/);
  assert.match(coverHtml, /Lectura evolutiva de tu Revolución Solar/);
  assert.match(coverHtml, /Tomas Alvariñas/);
  assert.match(coverHtml, /1 de septiembre de 2026/);
  assert.match(coverHtml, /1 de septiembre de 2027/);
  assert.match(coverHtml, /pdf-cover/);
  assert.doesNotMatch(coverHtml, /Informe profesional/);
  assert.doesNotMatch(coverHtml, /Base astrológica/);
  assert.doesNotMatch(coverHtml, /bbbbbbbb-cccc-4ddd-8eee-ffffffffffff/);

  assert.match(bodyHtml, /pdf-body/);
  for (const label of Object.values(SOLAR_RETURN_REPORT_SECTION_LABELS)) {
    assert.match(bodyHtml, new RegExp(label));
  }
  assert.equal(Object.values(SOLAR_RETURN_REPORT_SECTION_LABELS).length, 12);
  assert.match(
    bodyHtml,
    /Versión consultante C\. El aprendizaje posible es habitar la pregunta\./,
  );
  assert.match(
    bodyHtml,
    /El aprendizaje posible es habitar la pregunta sin forzar respuesta\./,
  );
  assert.doesNotMatch(
    bodyHtml,
    /Informe profesional editado B — no debe aparecer en el PDF consultante/,
  );
  assert.doesNotMatch(bodyHtml, /Base astrológica/);
  assert.doesNotMatch(bodyHtml, /Sol RS en Virgo/);
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
  assert.doesNotMatch(bodyHtml, /Cristal Paula/);

  const outdatedProfessional = {
    ...professionalB,
    annualTheme: {
      ...professionalB.annualTheme,
      content: "Profesional cambiado después. No debe entrar al PDF consultante.",
    },
  };
  const outdatedClientHtml = await renderSolarReturnClientReportHtmlParts({
    report: sample,
    clientName: "Tomas Alvariñas",
    periodStart: outdatedProfessional.metadata.periodStart,
    periodEnd: outdatedProfessional.metadata.periodEnd,
  });
  assert.match(outdatedClientHtml.bodyHtml, /Versión consultante C/);
  assert.doesNotMatch(
    outdatedClientHtml.bodyHtml,
    /Profesional cambiado después/,
  );

  const clientFooter = pdfClientReportFooterTemplate(
    escapeHtml(formatProfessionalPdfCreditLine()),
  );
  assert.match(clientFooter, /Lic\. Paula Martini/);
  assert.match(clientFooter, /pageNumber/);
  assert.doesNotMatch(clientFooter, />Mandala Evolutivo</);
  assert.doesNotMatch(clientFooter, /Tomas Alvariñas/);

  assert.equal(
    toSolarReturnClientPdfFilename("Tomas Alvariñas"),
    "mandala-evolutivo-revolucion-solar-tomas-alvarinas.pdf",
  );

  const generateSource = readFileSync(path.join(DIRNAME, "pdf.ts"), "utf8");
  const htmlSource = readFileSync(path.join(DIRNAME, "pdf-html.ts"), "utf8");
  const routeSource = readRepo(
    "src/app/api/clients/[id]/solar-returns/[solarReturnId]/reports/[reportId]/client/pdf/route.ts",
  );
  const natalClientRoute = readRepo(
    "src/app/api/clients/[id]/reports/[reportId]/client/pdf/route.ts",
  );
  const transitClientRoute = readRepo(
    "src/app/api/clients/[id]/transits/[transitAnalysisId]/reports/[reportId]/client/pdf/route.ts",
  );

  assert.ok(htmlSource.includes("input.report"));
  assert.ok(generateSource.includes("renderSolarReturnClientReportHtmlParts(input)"));
  assert.ok(generateSource.includes('kind: "solar_client"'));
  assert.equal(generateSource.includes("generatedReport"), false);
  assert.equal(generateSource.includes("@/lib/ai/gemini"), false);
  assert.equal(generateSource.includes("@google/genai"), false);
  assert.ok(routeSource.includes("clientReportResult.data.clientReport"));
  assert.equal(routeSource.includes("reportResult.data.report"), false);
  assert.equal(routeSource.includes("generatedReport"), false);
  assert.ok(routeSource.includes("getAuthenticatedUser"));
  assert.ok(routeSource.includes("jsonError(\"No autorizado.\", 401)"));
  assert.ok(routeSource.includes("solarReturnResult.data.clientId"));
  assert.ok(routeSource.includes("getSolarReturnById"));
  assert.ok(
    routeSource.includes("getSolarReturnClientReportByProfessionalReportId"),
  );
  assert.equal(routeSource.includes("status === \"ready\""), false);
  assert.equal(routeSource.includes("sourceOutdated"), false);
  assert.equal(routeSource.includes("isSolarReturnClientReportSourceOutdated"), false);
  assert.equal(routeSource.includes("@google/genai"), false);
  assert.equal(routeSource.includes("toSolarReturnClientReport("), false);
  assert.equal(routeSource.includes(".insert("), false);
  assert.equal(routeSource.includes(".update("), false);
  assert.equal(routeSource.includes(".rpc("), false);
  assert.ok(routeSource.includes("runtime = \"nodejs\""));
  assert.ok(routeSource.includes("maxDuration = 60"));
  assert.ok(natalClientRoute.includes("maxDuration = 60"));
  assert.ok(transitClientRoute.includes("maxDuration = 60"));
  assert.equal(transitClientRoute.includes("status === \"ready\""), false);
  assert.equal(transitClientRoute.includes("sourceOutdated"), false);
}

run()
  .then(() => {
    console.log("solar return client-pdf tests ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
