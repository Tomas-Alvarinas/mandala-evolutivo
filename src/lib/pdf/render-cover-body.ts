import "server-only";

import { PDFDocument } from "pdf-lib";
import type { Browser, BrowserContext, Page } from "playwright-core";
import { isPdfBrowserUnavailable, launchPdfBrowser } from "./browser";
import { logPdfRenderFailure, readPdfRenderStage, type PdfKind, type PdfRenderStage } from "./diagnostics";
import { PdfGenerationError } from "./errors";
import { escapeHtml } from "./html";
import {
  PDF_BODY_MARGIN,
  PDF_COVER_MARGIN,
  pdfFooterTemplate,
} from "./page-layout";

const PDF_TIMEOUT_MS = 45_000;

export async function renderCoverAndBodyPdf(input: {
  coverHtml: string;
  bodyHtml: string;
  footerName: string;
  footerHtml?: string;
  kind?: PdfKind;
}): Promise<Buffer> {
  const footerTemplate =
    input.footerHtml ?? pdfFooterTemplate(escapeHtml(input.footerName));
  let browser: Browser | undefined;
  let context: BrowserContext | undefined;
  let page: Page | undefined;
  let stage: PdfRenderStage = "browser_launch";

  try {
    stage = "browser_launch";
    browser = await launchPdfBrowser();
    stage = "page_create";
    context = await browser.newContext();
    page = await context.newPage();
    page.setDefaultTimeout(PDF_TIMEOUT_MS);

    stage = "set_content";
    await page.setContent(input.coverHtml, {
      waitUntil: "load",
      timeout: PDF_TIMEOUT_MS,
    });
    stage = "pdf_cover";
    const coverPdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: false,
      preferCSSPageSize: true,
      margin: { ...PDF_COVER_MARGIN },
    });

    stage = "set_content";
    await page.setContent(input.bodyHtml, {
      waitUntil: "load",
      timeout: PDF_TIMEOUT_MS,
    });
    stage = "pdf_body";
    const bodyPdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      preferCSSPageSize: true,
      headerTemplate: "<div></div>",
      footerTemplate,
      margin: { ...PDF_BODY_MARGIN },
    });

    stage = "pdf_merge";
    return mergePdfBuffers(coverPdf, bodyPdf);
  } catch (error) {
    const failedStage = readPdfRenderStage(error) ?? stage;

    if (!isPdfBrowserUnavailable(error)) {
      logPdfRenderFailure({
        source: input.kind ?? "pdf-render",
        kind: input.kind,
        stage: failedStage,
        error,
      });
    }

    if (isPdfBrowserUnavailable(error)) {
      throw new PdfGenerationError(
        "browser_unavailable",
        "No hay un navegador disponible para generar el PDF.",
        { cause: error, stage: failedStage },
      );
    }

    if (isTimeoutError(error)) {
      throw new PdfGenerationError(
        "timeout",
        "La generación del PDF superó el tiempo de espera.",
        { cause: error, stage: failedStage },
      );
    }

    throw new PdfGenerationError(
      "render_failed",
      "No se pudo generar el PDF.",
      { cause: error, stage: failedStage },
    );
  } finally {
    await closeQuietly(page);
    await closeQuietly(context);
    await closeQuietly(browser);
  }
}

async function mergePdfBuffers(coverPdf: Uint8Array, bodyPdf: Uint8Array) {
  const merged = await PDFDocument.create();
  const coverDoc = await PDFDocument.load(coverPdf);
  const bodyDoc = await PDFDocument.load(bodyPdf);

  for (const page of await merged.copyPages(coverDoc, coverDoc.getPageIndices())) {
    merged.addPage(page);
  }

  for (const page of await merged.copyPages(bodyDoc, bodyDoc.getPageIndices())) {
    merged.addPage(page);
  }

  return Buffer.from(await merged.save());
}

function isTimeoutError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.name === "TimeoutError" ||
    error.message.toLowerCase().includes("timeout")
  );
}

async function closeQuietly(closable?: { close: () => Promise<unknown> }) {
  if (!closable) {
    return;
  }

  try {
    await closable.close();
  } catch {
    // The PDF response must not depend on cleanup succeeding.
  }
}
