import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { solarReturnReportSchema } from "@/lib/ai/solar-returns/schema";
import { APP_NAME } from "@/lib/constants";
import { escapeHtml } from "@/lib/pdf/html";
import { pdfFooterTemplate } from "@/lib/pdf/page-layout";
import { SOLAR_RETURN_REPORT_SECTION_LABELS } from "../constants";
import { toSolarReturnProfessionalPdfFilename } from "./filename";
import { renderSolarReturnProfessionalReportHtmlParts } from "./html";
import { prepareSolarReturnProfessionalReportForPdf } from "./prepare";
import { createSolarReturnProfessionalPdfSampleReport } from "./sample";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIRNAME, "../../../../..");

function readRepo(...parts: string[]) {
  return readFileSync(path.join(ROOT, ...parts), "utf8");
}

async function run() {
  const originalA = createSolarReturnProfessionalPdfSampleReport();
  originalA.annualTheme.content = "Original Gemini A.";
  const professionalB = {
    ...originalA,
    annualTheme: {
      ...originalA.annualTheme,
      content: "Informe profesional editado B — ¿cómo estás, ñandú?",
    },
  };

  const parsed = solarReturnReportSchema.safeParse(professionalB);
  assert.equal(parsed.success, true);

  const prepared = prepareSolarReturnProfessionalReportForPdf({
    ...professionalB,
    energyConcentration: {
      ...professionalB.energyConcentration,
      content: "Hay una concentración de auto\u00ADcustodia y de diálogo interno.",
    },
  });
  assert.match(prepared.energyConcentration.content, /autocustodia/);
  assert.doesNotMatch(prepared.energyConcentration.content, /\u00AD/);
  assert.match(prepared.annualTheme.content, /ñandú/);
  assert.match(prepared.annualTheme.content, /—/);

  const { coverHtml, bodyHtml, footerName } =
    await renderSolarReturnProfessionalReportHtmlParts({
      report: professionalB,
      clientName: "Tomas Alvariñas",
    });

  assert.equal(footerName, "Tomas Alvariñas");
  assert.notEqual(footerName, APP_NAME);

  const professionalFooter = pdfFooterTemplate(escapeHtml(footerName));
  assert.match(professionalFooter, /Tomas Alvariñas/);
  assert.match(professionalFooter, /pageNumber/);
  assert.doesNotMatch(professionalFooter, />Mandala Evolutivo</);

  assert.match(coverHtml, /Revolución Solar/);
  assert.match(coverHtml, /Informe profesional/);
  assert.match(coverHtml, /Tomas Alvariñas/);
  assert.match(coverHtml, /1 de septiembre de 2026/);
  assert.match(coverHtml, /1 de septiembre de 2027/);
  assert.match(coverHtml, /pdf-cover/);
  assert.doesNotMatch(coverHtml, /bbbbbbbb-cccc-4ddd-8eee-ffffffffffff/);
  assert.doesNotMatch(coverHtml, /Original Gemini A/);

  assert.match(bodyHtml, /pdf-body/);
  for (const label of Object.values(SOLAR_RETURN_REPORT_SECTION_LABELS)) {
    assert.match(bodyHtml, new RegExp(label));
  }
  assert.equal(Object.values(SOLAR_RETURN_REPORT_SECTION_LABELS).length, 12);
  assert.match(bodyHtml, /Base astrológica/);
  assert.match(bodyHtml, /Sol RS en Virgo — Casa RS 10 — Casa natal 1/);
  assert.match(bodyHtml, /Sol trígono Luna natal/);
  assert.match(bodyHtml, /Informe profesional editado B — ¿cómo estás, ñandú\?/);
  assert.match(
    bodyHtml,
    /El aprendizaje posible es habitar la pregunta sin forzar respuesta\./,
  );
  assert.doesNotMatch(bodyHtml, /Original Gemini A/);
  assert.match(bodyHtml, /Datos técnicos/);
  assert.match(bodyHtml, /Informe 1\.0/);
  assert.match(bodyHtml, /Cristal Paula — Revolución Solar/);
  assert.doesNotMatch(bodyHtml, /generated_report/);
  assert.doesNotMatch(bodyHtml, /client_report/);
  assert.doesNotMatch(bodyHtml, /source_report/);
  assert.doesNotMatch(bodyHtml, /bbbbbbbb-cccc-4ddd-8eee-ffffffffffff/);
  assert.doesNotMatch(bodyHtml, />Borrador</);
  assert.doesNotMatch(bodyHtml, />Revisado</);
  assert.doesNotMatch(bodyHtml, />Listo</);
  assert.doesNotMatch(bodyHtml, /Tito Maciá/);
  assert.doesNotMatch(bodyHtml, /@google\/genai/);

  assert.equal(
    toSolarReturnProfessionalPdfFilename("Tomas Alvariñas"),
    "mandala-evolutivo-revolucion-solar-profesional-tomas-alvarinas.pdf",
  );

  const generateSource = readFileSync(path.join(DIRNAME, "generate.ts"), "utf8");
  const htmlSource = readFileSync(path.join(DIRNAME, "html.ts"), "utf8");
  const routeSource = readRepo(
    "src/app/api/clients/[id]/solar-returns/[solarReturnId]/reports/[reportId]/pdf/route.ts",
  );
  const nextConfig = readRepo("next.config.ts");
  const natalProfessionalRoute = readRepo(
    "src/app/api/clients/[id]/reports/[reportId]/pdf/route.ts",
  );
  const transitProfessionalRoute = readRepo(
    "src/app/api/clients/[id]/transits/[transitAnalysisId]/reports/[reportId]/pdf/route.ts",
  );

  assert.ok(htmlSource.includes("input.report"));
  assert.ok(
    generateSource.includes("renderSolarReturnProfessionalReportHtmlParts(input)"),
  );
  assert.ok(generateSource.includes('kind: "solar_professional"'));
  assert.equal(generateSource.includes("generatedReport"), false);
  assert.equal(generateSource.includes("generated_report"), false);
  assert.equal(htmlSource.includes("generated_report"), false);
  assert.equal(generateSource.includes("@/lib/ai/gemini"), false);
  assert.equal(generateSource.includes("@google/genai"), false);
  assert.ok(routeSource.includes("reportResult.data.report"));
  assert.equal(routeSource.includes("generatedReport"), false);
  assert.ok(routeSource.includes("getAuthenticatedUser"));
  assert.ok(routeSource.includes("getSolarReturnReportById"));
  assert.ok(routeSource.includes("getSolarReturnById"));
  assert.ok(routeSource.includes("jsonError(\"No autorizado.\", 401)"));
  assert.ok(routeSource.includes("solarReturnResult.data.clientId"));
  assert.equal(routeSource.includes("status === \"ready\""), false);
  assert.equal(routeSource.includes("@google/genai"), false);
  assert.equal(routeSource.includes(".insert("), false);
  assert.equal(routeSource.includes(".update("), false);
  assert.equal(routeSource.includes(".rpc("), false);
  assert.ok(routeSource.includes("runtime = \"nodejs\""));
  assert.ok(routeSource.includes("maxDuration = 60"));
  assert.ok(natalProfessionalRoute.includes("maxDuration = 60"));
  assert.ok(transitProfessionalRoute.includes("maxDuration = 60"));
  assert.equal(natalProfessionalRoute.includes("status === \"ready\""), false);
  assert.equal(transitProfessionalRoute.includes("status === \"ready\""), false);

  assert.ok(nextConfig.includes("playwright-core"));
  assert.ok(nextConfig.includes("@sparticuz/chromium"));
  assert.ok(nextConfig.includes("pdf-lib"));
  assert.ok(nextConfig.includes('"/api/**"'));
  assert.ok(nextConfig.includes("serverExternalPackages"));
}

run()
  .then(() => {
    console.log("solar return professional-pdf tests ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
