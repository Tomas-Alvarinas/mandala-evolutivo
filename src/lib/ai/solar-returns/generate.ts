import "server-only";

import {
  SOLAR_RETURN_METHODOLOGY_VERSION,
  SOLAR_RETURN_REPORT_VERSION,
  type SolarReturnReport,
} from "@/lib/reports/solar-returns";
import {
  GEMINI_NATAL_CHART_MODEL,
  GEMINI_NATAL_CHART_TIMEOUT_MS,
} from "../gemini/config";
import { createGeminiClient } from "../gemini/client";
import { GeminiEngineError } from "../gemini/errors";
import { assembleSolarReturnReportFromModelOutput } from "./assemble";
import {
  assertSolarReturnEngineInput,
  buildSolarReturnContext,
  type SolarReturnEngineInput,
} from "./context";
import { getSolarReturnGeminiJsonSchema } from "./schema";
import {
  buildSolarReturnSystemInstruction,
  buildSolarReturnUserPrompt,
} from "./prompt";

const solarReturnJsonSchema = getSolarReturnGeminiJsonSchema();

export async function generateSolarReturnReport(
  input: SolarReturnEngineInput,
): Promise<SolarReturnReport> {
  assertSolarReturnEngineInput(input);

  const contextText = buildSolarReturnContext(input);
  let rawText: string;

  try {
    rawText = await requestSolarReturnJson(contextText);
  } catch (error) {
    throw toEngineError(error);
  }

  return assembleSolarReturnReportFromModelOutput({
    rawText,
    engineInput: input,
  });
}

export function getSolarReturnGenerationTrace() {
  return {
    methodologyVersion: SOLAR_RETURN_METHODOLOGY_VERSION,
    reportVersion: SOLAR_RETURN_REPORT_VERSION,
    geminiModel: GEMINI_NATAL_CHART_MODEL,
  };
}

async function requestSolarReturnJson(contextText: string): Promise<string> {
  const client = createGeminiClient();

  const interaction = await client.interactions.create(
    {
      model: GEMINI_NATAL_CHART_MODEL,
      input: buildSolarReturnUserPrompt(contextText),
      system_instruction: buildSolarReturnSystemInstruction(),
      store: false,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: solarReturnJsonSchema,
      },
    },
    {
      timeout_ms: GEMINI_NATAL_CHART_TIMEOUT_MS,
    },
  );

  if (isBlockedInteraction(interaction)) {
    throw new GeminiEngineError(
      "blocked_response",
      "Gemini bloqueó la generación del informe de Revolución Solar.",
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
      "Gemini no pudo completar la generación del informe de Revolución Solar.",
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

  console.info("[ai.solar-returns] Gemini usage", {
    stage: "completed",
    model: GEMINI_NATAL_CHART_MODEL,
    reportVersion: SOLAR_RETURN_REPORT_VERSION,
    methodologyVersion: SOLAR_RETURN_METHODOLOGY_VERSION,
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
    "Gemini no pudo completar la generación del informe de Revolución Solar.",
    { retryable: true },
  );
}

function logGeminiRequestFailure(error: unknown) {
  console.error("[ai.solar-returns] Gemini request failed", {
    stage: "request",
    model: GEMINI_NATAL_CHART_MODEL,
    reportVersion: SOLAR_RETURN_REPORT_VERSION,
    methodologyVersion: SOLAR_RETURN_METHODOLOGY_VERSION,
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
