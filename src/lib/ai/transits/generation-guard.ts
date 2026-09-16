export type TransitClientLoadStatus =
  | "ok"
  | "unauthorized"
  | "not_configured"
  | "not_found"
  | "error";

export type TransitAnalysisLoadStatus = TransitClientLoadStatus;

export type TransitGenerationDecision =
  | { kind: "proceed" }
  | { kind: "redirect_login" }
  | {
      kind: "fail";
      code: "not_configured" | "not_found" | "load_error" | "transit_load_error";
    };

export function decideTransitGenerationFromClientLoad(
  status: TransitClientLoadStatus,
): TransitGenerationDecision {
  switch (status) {
    case "ok":
      return { kind: "proceed" };
    case "unauthorized":
      return { kind: "redirect_login" };
    case "not_configured":
      return { kind: "fail", code: "not_configured" };
    case "not_found":
      return { kind: "fail", code: "not_found" };
    case "error":
      return { kind: "fail", code: "load_error" };
  }
}

export function decideTransitGenerationFromTransitLoad(
  status: TransitAnalysisLoadStatus,
): TransitGenerationDecision {
  switch (status) {
    case "ok":
      return { kind: "proceed" };
    case "unauthorized":
      return { kind: "redirect_login" };
    case "not_configured":
      return { kind: "fail", code: "not_configured" };
    case "not_found":
      return { kind: "fail", code: "not_found" };
    case "error":
      return { kind: "fail", code: "transit_load_error" };
  }
}

export function shouldCallGeminiForTransitGeneration(
  clientDecision: TransitGenerationDecision,
  transitDecision?: TransitGenerationDecision,
): boolean {
  return (
    clientDecision.kind === "proceed" && transitDecision?.kind === "proceed"
  );
}
