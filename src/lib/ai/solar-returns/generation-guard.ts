export type SolarReturnClientLoadStatus =
  | "ok"
  | "unauthorized"
  | "not_configured"
  | "not_found"
  | "error";

export type SolarReturnLoadStatus = SolarReturnClientLoadStatus;

export type SolarReturnGenerationDecision =
  | { kind: "proceed" }
  | { kind: "redirect_login" }
  | {
      kind: "fail";
      code:
        | "not_configured"
        | "not_found"
        | "load_error"
        | "solar_return_load_error";
    };

export function decideSolarReturnGenerationFromClientLoad(
  status: SolarReturnClientLoadStatus,
): SolarReturnGenerationDecision {
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

export function decideSolarReturnGenerationFromSolarReturnLoad(
  status: SolarReturnLoadStatus,
): SolarReturnGenerationDecision {
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
      return { kind: "fail", code: "solar_return_load_error" };
  }
}

export function shouldCallGeminiForSolarReturnGeneration(
  clientDecision: SolarReturnGenerationDecision,
  solarReturnDecision?: SolarReturnGenerationDecision,
): boolean {
  return (
    clientDecision.kind === "proceed" &&
    solarReturnDecision?.kind === "proceed"
  );
}
