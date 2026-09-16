import assert from "node:assert/strict";
import { formatProfessionalPdfCreditLine } from "@/lib/constants";
import { escapeHtml } from "@/lib/pdf/html";
import { pdfClientReportFooterTemplate } from "@/lib/pdf/page-layout";
import {
  arePdfTextsEquivalent,
  normalizeComparableText,
  normalizePdfText,
} from "./normalize-pdf-text";
import { renderNatalChartClientReportHtmlParts } from "./pdf-html";
import { createPdfLayoutSampleReport } from "./pdf-sample-report";
import { prepareClientReportForPdf } from "./prepare-pdf";

async function run() {
  assert.equal(normalizePdfText("auto\u00ADcustodiada"), "autocustodiada");
  assert.equal(normalizePdfText("híper\uFFFEcontrolar"), "hípercontrolar");
  assert.equal(normalizePdfText("presencia\u200B"), "presencia");
  assert.equal(normalizePdfText("Mandala\uFEFF Evolutivo"), "Mandala Evolutivo");
  assert.equal(normalizePdfText("¿cómo estás, ñandú?"), "¿cómo estás, ñandú?");
  assert.equal(normalizePdfText("bien-estar y «cuidados»"), "bien-estar y «cuidados»");
  assert.equal(
    normalizeComparableText("  hola   mundo\n\n  "),
    "hola mundo",
  );
  assert.equal(
    arePdfTextsEquivalent("Síntesis\nfinal", "  Síntesis   final  "),
    true,
  );
  assert.equal(arePdfTextsEquivalent("uno", "dos"), false);

  const sample = createPdfLayoutSampleReport();
  const prepared = prepareClientReportForPdf(sample);
  const first = prepared.sections[0];
  const last = prepared.sections[prepared.sections.length - 1];

  assert.equal(first?.sourceSectionId, "evolutionaryMandalaSummary");
  assert.equal(prepared.introduction.content, "");
  assert.equal(last?.sourceSectionId, "finalSynthesis");
  assert.equal(last?.kind, "narrative");
  assert.equal(prepared.closing.content, "");
  if (first?.kind === "narrative") {
    assert.match(first.content, /autocustodiada/);
    assert.doesNotMatch(first.content, /\u00AD|\uFFFE|\uFFFD|\u200B/);
  }
  assert.match(JSON.stringify(prepared), /hípercontrolar/);

  const unique = prepareClientReportForPdf({
    ...sample,
    introduction: { content: "Una introducción distinta." },
    closing: { content: "Un cierre distinto." },
  });
  assert.equal(unique.introduction.content, "Una introducción distinta.");
  assert.equal(unique.closing.content, "Un cierre distinto.");
  assert.equal(unique.sections[0]?.sourceSectionId, "evolutionaryMandalaSummary");

  const mandala = prepared.sections.find((section) => section.kind === "mandala");
  assert.ok(mandala && mandala.kind === "mandala");
  if (mandala?.kind === "mandala") {
    assert.doesNotMatch(mandala.assignment, /\u00AD/);
  }

  const { coverHtml, bodyHtml } =
    await renderNatalChartClientReportHtmlParts(sample);

  assert.match(coverHtml, /Tomas Alvariñas/);
  assert.doesNotMatch(coverHtml, /Introducción/);
  assert.doesNotMatch(coverHtml, /paulamartini4920@gmail.com/);
  assert.match(bodyHtml, /pdf-body/);
  assert.match(coverHtml, /pdf-cover/);
  assert.match(bodyHtml, /pdf-body/);
  assert.match(bodyHtml, /@page \{ size: A4; margin: 24mm/);
  assert.doesNotMatch(bodyHtml, /Introducción/);
  assert.match(bodyHtml, /Una mirada de conjunto/);
  assert.match(bodyHtml, /Síntesis para tu camino/);
  assert.doesNotMatch(bodyHtml, />Cierre</);
  assert.doesNotMatch(bodyHtml, /\u00AD|\uFFFE|\u200B/);
  assert.match(bodyHtml, /section-mandala/);
  assert.match(bodyHtml, /list-block/);
  assert.doesNotMatch(bodyHtml, /class="chip"/);
  assert.doesNotMatch(coverHtml, /Base astrológica/);
  assert.doesNotMatch(bodyHtml, /gemini/i);

  assert.equal(
    formatProfessionalPdfCreditLine(),
    "Lic. Paula Martini · Psicopedagoga y Astróloga · paulamartini4920@gmail.com · @paulitamartini",
  );
  const clientFooter = pdfClientReportFooterTemplate(
    escapeHtml(formatProfessionalPdfCreditLine()),
  );
  assert.match(clientFooter, /Lic\. Paula Martini/);
  assert.match(clientFooter, /Psicopedagoga y Astróloga/);
  assert.match(clientFooter, /paulamartini4920@gmail.com/);
  assert.match(clientFooter, /@paulitamartini/);
  assert.match(clientFooter, / · /);
  assert.doesNotMatch(clientFooter, / - /);
  assert.match(clientFooter, /pageNumber/);
  assert.match(clientFooter, /text-align:right/);
  assert.doesNotMatch(clientFooter, /Tomas Alvariñas/);
  assert.doesNotMatch(clientFooter, />Mandala Evolutivo</);
}

run()
  .then(() => {
    console.log("pdf-presentation tests ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
