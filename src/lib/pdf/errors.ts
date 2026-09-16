export class PdfGenerationError extends Error {
  readonly code: "browser_unavailable" | "timeout" | "render_failed";
  readonly stage?: string;

  constructor(
    code: PdfGenerationError["code"],
    message: string,
    options?: { cause?: unknown; stage?: string },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = "PdfGenerationError";
    this.code = code;
    this.stage = options?.stage;
  }
}

export function isPdfGenerationError(
  error: unknown,
): error is PdfGenerationError {
  return error instanceof PdfGenerationError;
}
