// Local QA only. Writes sample PDFs under /tmp (gitignored). Do not run in production.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import { formatProfessionalPdfCreditLine } from "../src/lib/constants";
import { escapeHtml } from "../src/lib/pdf/html";
import {
  PDF_BODY_MARGIN,
  PDF_COVER_MARGIN,
  pdfClientReportFooterTemplate,
  pdfFooterTemplate,
} from "../src/lib/pdf/page-layout";
import { renderNatalChartClientReportHtmlParts } from "../src/lib/reports/natal-chart/client-report/pdf-html";
import { createPdfLayoutSampleReport } from "../src/lib/reports/natal-chart/client-report/pdf-sample-report";
import { renderNatalChartProfessionalReportHtmlParts } from "../src/lib/reports/natal-chart/professional-pdf/html";
import { createProfessionalPdfLayoutSampleReport } from "../src/lib/reports/natal-chart/professional-pdf/sample";

const OUTPUT_DIR = path.join(process.cwd(), "tmp");

async function main() {
  const { chromium } = await import("playwright-core");
  const browser = await launchLocalBrowser(chromium);
  const page = await browser.newPage();

  try {
    const clientParts = await renderNatalChartClientReportHtmlParts(
      createPdfLayoutSampleReport(),
    );
    const clientResult = await renderMergedPdf(page, {
      coverHtml: clientParts.coverHtml,
      bodyHtml: clientParts.bodyHtml,
      footerTemplate: pdfClientReportFooterTemplate(
        escapeHtml(formatProfessionalPdfCreditLine()),
      ),
      outputFile: path.join(OUTPUT_DIR, "carta-natal-muestra.pdf"),
    });

    const professionalParts = await renderNatalChartProfessionalReportHtmlParts({
      report: createProfessionalPdfLayoutSampleReport(),
      clientName: "Tomas Alvariñas",
    });
    const professionalResult = await renderMergedPdf(page, {
      coverHtml: professionalParts.coverHtml,
      bodyHtml: professionalParts.bodyHtml,
      footerTemplate: pdfFooterTemplate(
        escapeHtml(professionalParts.footerName),
      ),
      outputFile: path.join(OUTPUT_DIR, "carta-natal-profesional-muestra.pdf"),
    });

    console.log(
      JSON.stringify({
        client: clientResult,
        professional: professionalResult,
      }),
    );
  } finally {
    await browser.close();
  }
}

async function renderMergedPdf(
  page: import("playwright-core").Page,
  input: {
    coverHtml: string;
    bodyHtml: string;
    footerTemplate: string;
    outputFile: string;
  },
) {
  await page.setContent(input.coverHtml, { waitUntil: "load", timeout: 45_000 });
  const coverPdf = await page.pdf({
    format: "A4",
    printBackground: true,
    displayHeaderFooter: false,
    preferCSSPageSize: true,
    margin: { ...PDF_COVER_MARGIN },
  });

  await page.setContent(input.bodyHtml, { waitUntil: "load", timeout: 45_000 });
  const bodyPdf = await page.pdf({
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    preferCSSPageSize: true,
    headerTemplate: "<div></div>",
    footerTemplate: input.footerTemplate,
    margin: { ...PDF_BODY_MARGIN },
  });

  const merged = await PDFDocument.create();
  const coverDoc = await PDFDocument.load(coverPdf);
  const bodyDoc = await PDFDocument.load(bodyPdf);

  for (const pageRef of await merged.copyPages(
    coverDoc,
    coverDoc.getPageIndices(),
  )) {
    merged.addPage(pageRef);
  }

  for (const pageRef of await merged.copyPages(
    bodyDoc,
    bodyDoc.getPageIndices(),
  )) {
    merged.addPage(pageRef);
  }

  await mkdir(OUTPUT_DIR, { recursive: true });
  const bytes = await merged.save();
  await writeFile(input.outputFile, bytes);

  return {
    file: input.outputFile,
    bytes: bytes.byteLength,
    coverPages: coverDoc.getPageCount(),
    bodyPages: bodyDoc.getPageCount(),
    totalPages: merged.getPageCount(),
  };
}

async function launchLocalBrowser(
  chromium: typeof import("playwright-core").chromium,
) {
  const localPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?.trim();

  if (localPath) {
    return chromium.launch({ executablePath: localPath, headless: true });
  }

  try {
    return await chromium.launch({ channel: "chrome", headless: true });
  } catch {
    return chromium.launch({ channel: "msedge", headless: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
