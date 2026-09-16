import "server-only";

import { NATAL_CHART_REPORT_VERSION, type NatalChartReport } from "@/lib/reports";
import { PAULA_LENS_VERSION } from "../methodology";
import { createGeminiClient } from "../gemini/client";
import {
  GEMINI_NATAL_CHART_MODEL,
  GEMINI_NATAL_CHART_TIMEOUT_MS,
} from "../gemini/config";
import { GeminiEngineError } from "../gemini/errors";
import {
  assertNatalChartAnalysisInput,
  buildNatalChartContext,
  type NatalChartAnalysisInput,
} from "./context";
import {
  buildNatalChartEvidence,
  createEvidenceWhitelist,
} from "./evidence";
import {
  geminiNatalChartReportSchema,
  getNatalChartGeminiJsonSchema,
} from "./schema";
import {
  buildNatalChartSystemInstruction,
  buildNatalChartUserPrompt,
} from "./prompt";
import { validateAstrologicalBasis } from "./validate";

const natalChartJsonSchema = getNatalChartGeminiJsonSchema();

export async function generateNatalChartReport(
  input: NatalChartAnalysisInput,
): Promise<NatalChartReport> {
  assertNatalChartAnalysisInput(input);

  const contextText = buildNatalChartContext(input);
  const evidence = buildNatalChartEvidence(input.natalChart);
  const allowedEvidence = createEvidenceWhitelist(evidence);

  let rawText: string;

  try {
    rawText = await requestNatalChartJson(contextText);
  } catch (error) {
    throw toEngineError(error);
  }

  const parsedJson = parseJsonObject(rawText);
  const parsedReport = parseReportSchema(parsedJson);
  const basis = validateAstrologicalBasis(parsedReport, allowedEvidence);

  if (!basis.ok) {
    const invented = basis.invented
      .map((item) => item.value)
      .filter((value, index, values) => values.indexOf(value) === index)
      .join("; ");

    throw new GeminiEngineError(
      "invented_evidence",
      `El modelo citó evidencia astrológica que no está en la carta: ${invented}`,
    );
  }

  return {
    ...parsedReport,
    metadata: {
      version: NATAL_CHART_REPORT_VERSION,
      generatedAt: new Date().toISOString(),
    },
  };
}

export function getNatalChartGenerationTrace() {
  return {
    paulaLensVersion: PAULA_LENS_VERSION,
    geminiModel: GEMINI_NATAL_CHART_MODEL,
  };
}

async function requestNatalChartJson(contextText: string): Promise<string> {
  const client = createGeminiClient();

  const interaction = await client.interactions.create(
    {
      model: GEMINI_NATAL_CHART_MODEL,
      input: buildNatalChartUserPrompt(contextText),
      system_instruction: buildNatalChartSystemInstruction(),
      store: false,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: natalChartJsonSchema,
      },
    },
    {
      timeout_ms: GEMINI_NATAL_CHART_TIMEOUT_MS,
    },
  );

  if (isBlockedInteraction(interaction)) {
    throw new GeminiEngineError(
      "blocked_response",
      "Gemini bloqueó la generación del informe.",
    );
  }

  if (
    interaction.status === "incomplete" ||
    interaction.status === "budget_exceeded"
  ) {
    throw new GeminiEngineError(
      "gemini_api_error",
      "Gemini interrumpió el informe por longitud o presupuesto. No se aceptó un JSON incompleto.",
    );
  }

  if (interaction.status !== "completed") {
    throw new GeminiEngineError(
      "gemini_api_error",
      "Gemini no pudo completar la generación del informe.",
      {
        retryable:
          interaction.status === "queued" ||
          interaction.status === "in_progress" ||
          interaction.status === "failed",
      },
    );
  }

  logGeminiUsage(interaction.usage);

  const text = interaction.output_text?.trim();

  if (!text) {
    throw new GeminiEngineError(
      "invalid_json",
      "Gemini no devolvió un JSON utilizable.",
    );
  }

  return text;
}

function logGeminiUsage(usage: {
  total_input_tokens?: number;
  total_output_tokens?: number;
  total_thought_tokens?: number;
  total_tokens?: number;
} | undefined) {
  if (!usage) {
    return;
  }

  console.info("[ai.natal-chart] Gemini usage", {
    totalInputTokens: usage.total_input_tokens,
    totalOutputTokens: usage.total_output_tokens,
    totalThoughtTokens: usage.total_thought_tokens,
    totalTokens: usage.total_tokens,
  });
}

function isBlockedInteraction(interaction: {
  status: string;
  errors?: Array<{ code?: string; message?: string }>;
}): boolean {
  const haystack = (interaction.errors ?? [])
    .map((error) => `${error.code ?? ""} ${error.message ?? ""}`)
    .join(" ")
    .toLowerCase();

  if (!haystack) {
    return false;
  }

  return (
    haystack.includes("safety") ||
    haystack.includes("blocked") ||
    haystack.includes("prohibited") ||
    haystack.includes("recitation") ||
    haystack.includes("blocklist")
  );
}

function parseJsonObject(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new GeminiEngineError(
      "invalid_json",
      "Gemini no devolvió un JSON válido.",
    );
  }
}

function parseReportSchema(value: unknown) {
  const result = geminiNatalChartReportSchema.safeParse(value);

  if (!result.success) {
    throw new GeminiEngineError(
      "invalid_schema",
      "El JSON recibido no cumple el contrato NatalChartReport.",
    );
  }

  return result.data;
}

function toEngineError(error: unknown): GeminiEngineError {
  if (error instanceof GeminiEngineError) {
    return error;
  }

  if (isAbortError(error)) {
    return new GeminiEngineError(
      "network_error",
      "La solicitud a Gemini se interrumpió por tiempo de espera o de red.",
      { retryable: true },
    );
  }

  logGeminiRequestFailure(error);

  return new GeminiEngineError(
    "gemini_api_error",
    "Gemini no pudo completar la generación del informe.",
    { retryable: true },
  );
}

function logGeminiRequestFailure(error: unknown) {
  const diagnostic: {
    name: string;
    httpStatus: number | undefined;
    googleStatus: string | undefined;
    googleMessage?: string;
    apiVersion?: string;
    model?: string;
    endpointPath?: string;
  } = {
    name: error instanceof Error ? error.name : "unknown",
    httpStatus: getHttpStatus(error),
    googleStatus: getGoogleStatus(error),
  };

  if (process.env.NODE_ENV === "development") {
    diagnostic.googleMessage = getGoogleMessage(error);
    diagnostic.apiVersion = "v1";
    diagnostic.model = GEMINI_NATAL_CHART_MODEL;
    diagnostic.endpointPath = "/v1/interactions";
  }

  console.error("[ai.natal-chart] Gemini request failed", diagnostic);
}

function getHttpStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  if ("status" in error && typeof error.status === "number") {
    return error.status;
  }

  if ("statusCode" in error && typeof error.statusCode === "number") {
    return error.statusCode;
  }

  return undefined;
}

function getGoogleStatus(error: unknown): string | undefined {
  const payload = getGoogleErrorPayload(error);
  const status = payload?.status;

  return typeof status === "string" ? status : undefined;
}

function getGoogleMessage(error: unknown): string | undefined {
  const payload = getGoogleErrorPayload(error);
  const fromPayload = payload?.message;

  if (typeof fromPayload === "string" && fromPayload.trim() !== "") {
    return sanitizeGoogleMessage(fromPayload);
  }

  if (error instanceof Error && error.message.trim() !== "") {
    return sanitizeGoogleMessage(error.message);
  }

  return undefined;
}

function getGoogleErrorPayload(
  error: unknown,
): Record<string, unknown> | undefined {
  if (typeof error !== "object" || error === null || !("error" in error)) {
    return undefined;
  }

  const payload = asRecord(error.error);

  if (!payload) {
    return undefined;
  }

  const nested = asRecord(payload.error);

  if (nested && (typeof nested.message === "string" || typeof nested.status === "string")) {
    return nested;
  }

  return payload;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  return value as Record<string, unknown>;
}

function sanitizeGoogleMessage(message: string): string {
  return message
    .replace(/AIza[0-9A-Za-z_-]+/g, "[redacted]")
    .replace(/(?:api[_-]?key|authorization|bearer)\s*[:=]\s*[^\s,;]+/gi, "[redacted]")
    .replace(/https?:\/\/[^\s]+/gi, "[url]")
    .slice(0, 280);
}

function isAbortError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.name === "AbortError" ||
    error.name === "TimeoutError" ||
    error.name === "APIUserAbortError"
  );
}
