import assert from "node:assert/strict";
import { natalChartReportSchema } from "@/lib/ai/natal-chart/schema";
import { APP_NAME } from "@/lib/constants";
import { escapeHtml } from "@/lib/pdf/html";
import { pdfFooterTemplate } from "@/lib/pdf/page-layout";
import { NATAL_CHART_CLIENT_REPORT_COVER_TITLE } from "@/lib/reports/natal-chart/client-report/constants";
import { toNatalChartProfessionalPdfFilename } from "./filename";
import { renderNatalChartProfessionalReportHtmlParts } from "./html";
import { prepareProfessionalReportForPdf } from "./prepare";
import { createProfessionalPdfSampleReport } from "./sample";

async function run() {
  const sample = createProfessionalPdfSampleReport();
  const parsed = natalChartReportSchema.safeParse(sample);
  assert.equal(parsed.success, true);

  const prepared = prepareProfessionalReportForPdf(sample);
  assert.match(prepared.evolutionaryMandalaSummary.content, /autocustodia/);
  assert.doesNotMatch(
    prepared.evolutionaryMandalaSummary.content,
    /\u00AD/,
  );

  const { coverHtml, bodyHtml, footerName } =
    await renderNatalChartProfessionalReportHtmlParts({
      report: sample,
      clientName: "Tomas Alvariñas",
    });

  assert.equal(footerName, "Tomas Alvariñas");
  assert.notEqual(footerName, APP_NAME);

  const professionalFooter = pdfFooterTemplate(escapeHtml(footerName));
  assert.match(professionalFooter, /Tomas Alvariñas/);
  assert.match(professionalFooter, /pageNumber/);
  assert.doesNotMatch(professionalFooter, /Mandala Evolutivo/);

  assert.match(coverHtml, /Carta Natal/);
  assert.match(coverHtml, /Informe profesional/);
  assert.match(coverHtml, /Tomas Alvariñas/);
  assert.match(coverHtml, /28 de agosto de 2026/);
  assert.doesNotMatch(coverHtml, new RegExp(NATAL_CHART_CLIENT_REPORT_COVER_TITLE));
  assert.doesNotMatch(coverHtml, /Esencia e identidad/);
  assert.doesNotMatch(coverHtml, /Cristal Paula/);

  assert.match(coverHtml, /pdf-cover/);
  assert.match(bodyHtml, /pdf-body/);
  assert.match(bodyHtml, /Esencia e identidad/);
  assert.match(bodyHtml, /Base astrológica/);
  assert.match(bodyHtml, /Sol en Leo en casa 5/);
  assert.match(bodyHtml, /Intervención del Mandala Evolutivo/);
  assert.match(bodyHtml, /section-mandala/);
  assert.match(bodyHtml, /Datos técnicos/);
  assert.match(bodyHtml, /Informe 1\.1/);
  assert.match(bodyHtml, /\.tech-meta \{[\s\S]*?break-inside: auto/);
  assert.match(bodyHtml, /\.tech-meta \{[\s\S]*?page-break-before: auto/);
  assert.doesNotMatch(
    bodyHtml,
    /\.tech-meta \{[\s\S]*?page-break-before: always/,
  );
  assert.match(bodyHtml, /class="tech-meta"/);
  assert.match(
    bodyHtml,
    /<section class="section">[\s\S]*class="tech-meta"[\s\S]*<\/section>/,
  );
  assert.doesNotMatch(bodyHtml, /<footer class="tech-meta">/);
  assert.match(bodyHtml, /\.heading-block::after \{[\s\S]*?height: 12em/);
  assert.match(
    bodyHtml,
    /\.section:has\(\.tech-meta\) \.heading-block::after \{[\s\S]*?content: none/,
  );
  assert.doesNotMatch(bodyHtml, /generated_report/);
  assert.doesNotMatch(bodyHtml, /client_report/);

  assert.equal(
    toNatalChartProfessionalPdfFilename("Tomas Alvariñas"),
    "carta-natal-profesional-tomas-alvarinas.pdf",
  );
}

run()
  .then(() => {
    console.log("professional-pdf tests ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
