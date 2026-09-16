import "server-only";

import path from "node:path";
import type { Browser } from "playwright-core";
import { stampPdfRenderStage, type PdfRenderStage } from "./diagnostics";

// Local: launch installed Chrome/Edge (no Playwright browser download).
// Vercel: @sparticuz/chromium + playwright-core, Node runtime, not Edge.

function isServerlessRuntime() {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

export async function launchPdfBrowser(): Promise<Browser> {
  const { chromium } = await import("playwright-core");
  let stage: PdfRenderStage = "browser_launch";

  try {
    if (isServerlessRuntime()) {
      const chromiumPack = (await import("@sparticuz/chromium")).default;
      chromiumPack.setGraphicsMode = false;

      stage = "chromium_executable";
      const executablePath = await chromiumPack.executablePath();
      const libraryPath = path.dirname(executablePath);
      process.env.LD_LIBRARY_PATH = [libraryPath, process.env.LD_LIBRARY_PATH]
        .filter(Boolean)
        .join(":");

      stage = "browser_launch";
      return chromium.launch({
        args: chromiumPack.args,
        executablePath,
        headless: true,
      });
    }

    const localPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?.trim();

    if (localPath) {
      return chromium.launch({
        executablePath: localPath,
        headless: true,
      });
    }

    try {
      return await chromium.launch({
        channel: "chrome",
        headless: true,
      });
    } catch {
      try {
        return await chromium.launch({
          channel: "msedge",
          headless: true,
        });
      } catch {
        const error = new Error("PDF browser is not available");
        error.name = "PdfBrowserUnavailableError";
        throw error;
      }
    }
  } catch (error) {
    stampPdfRenderStage(error, stage);
    throw error;
  }
}

export function isPdfBrowserUnavailable(error: unknown) {
  return error instanceof Error && error.name === "PdfBrowserUnavailableError";
}
