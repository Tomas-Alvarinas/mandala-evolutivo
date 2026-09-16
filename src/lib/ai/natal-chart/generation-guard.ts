export type NatalChartClientLoadStatus =
  | "ok"
  | "unauthorized"
  | "not_configured"
  | "not_found"
  | "error";

export type NatalChartGenerationClientDecision =
  | { kind: "proceed" }
  | { kind: "redirect_login" }
  | {
      kind: "fail";
      code: "not_configured" | "not_found" | "load_error";
    };

export function decideNatalChartGenerationFromClientLoad(
  status: NatalChartClientLoadStatus,
): NatalChartGenerationClientDecision {
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

export function shouldCallGeminiForNatalChartGeneration(
  decision: NatalChartGenerationClientDecision,
): boolean {
  return decision.kind === "proceed";
}
