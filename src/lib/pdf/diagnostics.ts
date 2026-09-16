import { existsSync } from "node:fs";
import path from "node:path";

export type PdfKind =
  | "natal_professional"
  | "natal_client"
  | "transit_professional"
  | "transit_client"
  | "solar_professional"
  | "solar_client";

export type PdfRenderStage =
  | "chromium_executable"
  | "browser_launch"
  | "page_create"
  | "set_content"
  | "pdf_cover"
  | "pdf_body"
  | "pdf_merge";

const INSTALLED_SPARTICUZ_CHROMIUM = "149.0.0";
const INSTALLED_PLAYWRIGHT_CORE = "1.62.1";

function sanitizeText(value: string, maxLength: number) {
  const withoutHtml = /<(!DOCTYPE|html|body|head)\b/i.test(value)
    ? "[html omitted]"
    : value;

  return withoutHtml
    .replace(/AIza[0-9A-Za-z_-]+/g, "[redacted]")
    .replace(/(?:api[_-]?key|authorization|bearer|cookie)\s*[:=]\s*[^\s,;]+/gi, "[redacted]")
    .replace(/https?:\/\/[^\s]+/gi, "[url]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function readErrorField(error: object, key: string): string | number | undefined {
  if (!(key in error)) {
    return undefined;
  }

  const value = (error as Record<string, unknown>)[key];

  if (typeof value === "string") {
    return sanitizeText(value, 120);
  }

  if (typeof value === "number") {
    return value;
  }

  return undefined;
}

export function toSafePdfErrorFields(error: unknown) {
  if (!(error instanceof Error)) {
    return {
      name: "unknown",
      message: sanitizeText(String(error), 400),
    };
  }

  const stack = error.stack
    ? error.stack
        .split("\n")
        .slice(0, 8)
        .map((line) => sanitizeText(line, 200))
        .filter(Boolean)
        .join("\n")
        .slice(0, 1200)
    : undefined;

  return {
    name: error.name,
    message: sanitizeText(error.message, 400),
    code: readErrorField(error, "code"),
    stack,
  };
}

export function collectPdfRuntimeInfo() {
  const chromiumBinDir = path.join(
    process.cwd(),
    "node_modules",
    "@sparticuz",
    "chromium",
    "bin",
  );

  return {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    vercel: Boolean(process.env.VERCEL),
    awsLambda: Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME),
    sparticuzChromium: INSTALLED_SPARTICUZ_CHROMIUM,
    playwrightCore: INSTALLED_PLAYWRIGHT_CORE,
    chromiumBinDirExists: existsSync(chromiumBinDir),
  };
}

export function stampPdfRenderStage(error: unknown, stage: PdfRenderStage) {
  if (error && typeof error === "object") {
    (error as { pdfStage?: PdfRenderStage }).pdfStage = stage;
  }
}

const PDF_RENDER_STAGES: ReadonlySet<string> = new Set([
  "chromium_executable",
  "browser_launch",
  "page_create",
  "set_content",
  "pdf_cover",
  "pdf_body",
  "pdf_merge",
]);

export function readPdfRenderStage(error: unknown): PdfRenderStage | undefined {
  if (!error || typeof error !== "object" || !("pdfStage" in error)) {
    return undefined;
  }

  const stage = (error as { pdfStage?: unknown }).pdfStage;
  return typeof stage === "string" && PDF_RENDER_STAGES.has(stage)
    ? (stage as PdfRenderStage)
    : undefined;
}

export function logPdfRenderFailure(input: {
  source: string;
  stage: PdfRenderStage;
  error: unknown;
  kind?: PdfKind;
}) {
  const cause =
    input.error instanceof Error && "cause" in input.error
      ? toSafePdfErrorFields(input.error.cause)
      : undefined;

  console.error(`[${input.source}] PDF render failed`, {
    kind: input.kind,
    stage: input.stage,
    ...toSafePdfErrorFields(input.error),
    cause,
    runtime: collectPdfRuntimeInfo(),
  });
}
