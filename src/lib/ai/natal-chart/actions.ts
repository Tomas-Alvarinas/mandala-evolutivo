"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getClientById } from "@/lib/clients/repository";
import {
  getNatalChartReports,
  saveNatalChartReport,
} from "@/lib/reports/natal-chart/repository";
import type { NatalChartReport } from "@/lib/reports";
import {
  isGeminiEngineError,
  type GeminiEngineErrorCode,
} from "../gemini/errors";
import { decideNatalChartGenerationFromClientLoad } from "./generation-guard";
import {
  generateNatalChartReport,
  getNatalChartGenerationTrace,
} from "./generate";

export type NatalChartGenerationTrace = {
  paulaLensVersion: string;
  geminiModel: string;
};

export type NatalChartAnalysisState =
  | { status: "idle" }
  | {
      status: "success";
      reportId: string;
      report: NatalChartReport;
      trace: NatalChartGenerationTrace;
    }
  | { status: "error"; message: string; code: string };

type FailureCode =
  | GeminiEngineErrorCode
  | "not_found"
  | "not_configured"
  | "load_error"
  | "save_unavailable"
  | "save_error";

export async function generateNatalChartAnalysisAction(
  _previous: NatalChartAnalysisState,
  formData: FormData,
): Promise<NatalChartAnalysisState> {
  const startedAt = Date.now();
  console.info("[ai.natal-chart] Generation started");

  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const clientId = formData.get("clientId");

  if (typeof clientId !== "string" || clientId.trim() === "") {
    return fail("not_found", startedAt);
  }

  const loaded = await getClientById(clientId);
  const clientDecision = decideNatalChartGenerationFromClientLoad(loaded.status);

  if (clientDecision.kind === "redirect_login") {
    redirect("/login");
  }

  if (clientDecision.kind === "fail") {
    return fail(clientDecision.code, startedAt);
  }

  if (loaded.status !== "ok") {
    return fail("load_error", startedAt);
  }

  const persistCheck = await getNatalChartReports(loaded.data.id);

  if (persistCheck.status === "unauthorized") {
    redirect("/login");
  }

  if (persistCheck.status !== "ok") {
    return fail("save_unavailable", startedAt);
  }

  let report: NatalChartReport;
  const generationStartedAt = Date.now();

  try {
    report = await generateNatalChartReport({
      firstName: loaded.data.firstName,
      lastName: loaded.data.lastName,
      age: loaded.data.age,
      natalChart: loaded.data.natalChart,
    });
  } catch (error) {
    const code = isGeminiEngineError(error)
      ? error.code
      : "gemini_api_error";

    return fail(code, startedAt);
  }

  const generationDurationMs = Date.now() - generationStartedAt;
  const saved = await saveNatalChartReport({
    clientId: loaded.data.id,
    natalChartId: loaded.data.natalChartId,
    report,
    generationDurationMs,
  });

  if (saved.status === "unauthorized") {
    redirect("/login");
  }

  if (saved.status !== "ok") {
    console.info("[ai.natal-chart] Generation succeeded but persist failed", {
      durationMs: generationDurationMs,
      saveStatus: saved.status,
    });
    return fail("save_error", startedAt);
  }

  console.info("[ai.natal-chart] Generation finished", {
    durationMs: generationDurationMs,
  });

  revalidatePath(`/clients/${loaded.data.id}`);
  revalidatePath(`/clients/${loaded.data.id}/reports/${saved.data}`);

  return {
    status: "success",
    reportId: saved.data,
    report,
    trace: getNatalChartGenerationTrace(),
  };
}

function fail(code: FailureCode, startedAt: number): NatalChartAnalysisState {
  console.info("[ai.natal-chart] Generation failed", {
    code,
    durationMs: Date.now() - startedAt,
  });

  return {
    status: "error",
    message: toUserMessage(code),
    code,
  };
}

function toUserMessage(code: FailureCode): string {
  switch (code) {
    case "missing_api_key":
      return "Falta configurar la generación de informes.";
    case "network_error":
      return "La generación se interrumpió por tiempo de espera o de red. Podés intentarlo de nuevo.";
    case "invented_evidence":
      return "El modelo generó una referencia astrológica que no coincide con los datos cargados. El informe fue descartado.";
    case "invalid_json":
    case "invalid_schema":
    case "invalid_input":
      return "El modelo devolvió un resultado que no se pudo validar. El informe fue descartado.";
    case "not_found":
      return "No se encontró este consultante o su carta natal.";
    case "not_configured":
      return "Falta configurar el acceso a los datos para cargar la Carta Natal.";
    case "load_error":
      return "No se pudo cargar la Carta Natal completa. Volvé a intentarlo.";
    case "save_unavailable":
      return "No se pudo verificar el almacenamiento de informes. No se inició la generación.";
    case "save_error":
      return "El análisis se generó, pero no se pudo guardar.";
    case "gemini_api_error":
    case "blocked_response":
      return "No se pudo completar el informe. Podés intentarlo de nuevo.";
  }
}
