export const GEMINI_ENGINE_ERROR_CODES = [
  "missing_api_key",
  "invalid_input",
  "gemini_api_error",
  "invalid_json",
  "invalid_schema",
  "blocked_response",
  "invented_evidence",
  "network_error",
] as const;

export type GeminiEngineErrorCode = (typeof GEMINI_ENGINE_ERROR_CODES)[number];

export class GeminiEngineError extends Error {
  readonly code: GeminiEngineErrorCode;
  readonly retryable: boolean;

  constructor(
    code: GeminiEngineErrorCode,
    message: string,
    options?: { retryable?: boolean; cause?: unknown },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = "GeminiEngineError";
    this.code = code;
    this.retryable = options?.retryable ?? false;
  }
}

export function isGeminiEngineError(
  error: unknown,
): error is GeminiEngineError {
  return error instanceof GeminiEngineError;
}
