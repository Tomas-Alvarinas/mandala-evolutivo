import "server-only";

import {
  TRANSIT_ANALYSIS_REPORT_VERSION,
  TRANSIT_METHODOLOGY_VERSION,
  type TransitAnalysisReport,
} from "@/lib/reports";
import { GEMINI_NATAL_CHART_MODEL, GEMINI_NATAL_CHART_TIMEOUT_MS } from "../gemini/config";
import { createGeminiClient } from "../gemini/client";
import { GeminiEngineError } from "../gemini/errors";
import {
  assertTransitAnalysisEngineInput,
  buildTransitAnalysisContext,
  type TransitAnalysisEngineInput,
} from "./context";
import {
  buildTransitAnalysisEvidence,
  createEvidenceWhitelist,
} from "./evidence";
import {
  geminiTransitAnalysisReportSchema,
  getTransitAnalysisGeminiJsonSchema,
} from "./schema";
import {
  buildTransitAnalysisSystemInstruction,
  buildTransitAnalysisUserPrompt,
} from "./prompt";
import { validateTransitAstrologicalBasis } from "./validate";
import { logRejectedTransitEvidence } from "./evidence-diagnostics";

const transitJsonSchema = getTransitAnalysisGeminiJsonSchema();

export async function generateTransitAnalysisReport(
  input: TransitAnalysisEngineInput,
): Promise<TransitAnalysisReport> {
  assertTransitAnalysisEngineInput(input);

  const contextText = buildTransitAnalysisContext(input);
  const evidence = buildTransitAnalysisEvidence({
    natalChart: input.natalChart,
    transitAnalysis: input.transitAnalysis,
  });
  const allowedEvidence = createEvidenceWhitelist(evidence);

  let rawText: string;

  try {
    rawText = await requestTransitAnalysisJson(contextText);
  } catch (error) {
    throw toEngineError(error);
  }

  const parsedJson = parseJsonObject(rawText);
  const parsedReport = parseReportSchema(parsedJson);
  const basis = validateTransitAstrologicalBasis(parsedReport, allowedEvidence);

  if (!basis.ok) {
    logRejectedTransitEvidence({
      invented: basis.invented,
      allowedEvidence,
      model: GEMINI_NATAL_CHART_MODEL,
      reportVersion: TRANSIT_ANALYSIS_REPORT_VERSION,
      methodologyVersion: TRANSIT_METHODOLOGY_VERSION,
    });

    throw new GeminiEngineError(
      "invented_evidence",
      "El modelo citó evidencia astrológica que no está en los datos cargados.",
    );
  }

  return {
    ...basis.report,
    metadata: {
      reportVersion: TRANSIT_ANALYSIS_REPORT_VERSION,
      methodologyVersion: TRANSIT_METHODOLOGY_VERSION,
      generatedAt: new Date().toISOString(),
      transitAnalysisId: input.transitAnalysis.id,
      analysisDate: input.transitAnalysis.analysisDate,
    },
  };
}

export function getTransitAnalysisGenerationTrace() {
  return {
    methodologyVersion: TRANSIT_METHODOLOGY_VERSION,
    reportVersion: TRANSIT_ANALYSIS_REPORT_VERSION,
    geminiModel: GEMINI_NATAL_CHART_MODEL,
  };
}

async function requestTransitAnalysisJson(contextText: string): Promise<string> {
  const client = createGeminiClient();

  const interaction = await client.interactions.create(
    {
      model: GEMINI_NATAL_CHART_MODEL,
      input: buildTransitAnalysisUserPrompt(contextText),
      system_instruction: buildTransitAnalysisSystemInstruction(),
      store: false,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: transitJsonSchema,
      },
    },
    {
      timeout_ms: GEMINI_NATAL_CHART_TIMEOUT_MS,
    },
  );

  if (isBlockedInteraction(interaction)) {
    throw new GeminiEngineError(
      "blocked_response",
      "Gemini bloqueó la generación del análisis de tránsitos.",
    );
  }

  if (
    interaction.status === "incomplete" ||
    interaction.status === "budget_exceeded"
  ) {
    throw new GeminiEngineError(
      "gemini_api_error",
      "Gemini interrumpió el análisis por longitud o presupuesto. No se aceptó un JSON incompleto.",
    );
  }

  if (interaction.status !== "completed") {
    throw new GeminiEngineError(
      "gemini_api_error",
      "Gemini no pudo completar la generación del análisis de tránsitos.",
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

  console.info("[ai.transits] Gemini usage", {
    stage: "completed",
    model: GEMINI_NATAL_CHART_MODEL,
    reportVersion: TRANSIT_ANALYSIS_REPORT_VERSION,
    methodologyVersion: TRANSIT_METHODOLOGY_VERSION,
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
  const result = geminiTransitAnalysisReportSchema.safeParse(value);

  if (!result.success) {
    throw new GeminiEngineError(
      "invalid_schema",
      "El JSON recibido no cumple el contrato TransitAnalysisReport.",
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
    "Gemini no pudo completar la generación del análisis de tránsitos.",
    { retryable: true },
  );
}

function logGeminiRequestFailure(error: unknown) {
  console.error("[ai.transits] Gemini request failed", {
    stage: "request",
    model: GEMINI_NATAL_CHART_MODEL,
    reportVersion: TRANSIT_ANALYSIS_REPORT_VERSION,
    methodologyVersion: TRANSIT_METHODOLOGY_VERSION,
    name: error instanceof Error ? error.name : "unknown",
    httpStatus: getHttpStatus(error),
  });
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
