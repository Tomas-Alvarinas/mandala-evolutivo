"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getClientById } from "@/lib/clients/repository";
import {
  listTransitAnalysisReports,
  saveTransitAnalysisReport,
} from "@/lib/reports/transits/repository";
import { getTransitAnalysisById } from "@/lib/transits/repository";
import type { TransitAnalysisReport } from "@/lib/reports";
import {
  isGeminiEngineError,
  type GeminiEngineErrorCode,
} from "../gemini/errors";
import {
  decideTransitGenerationFromClientLoad,
  decideTransitGenerationFromTransitLoad,
} from "./generation-guard";
import {
  generateTransitAnalysisReport,
  getTransitAnalysisGenerationTrace,
} from "./generate";

export type TransitAnalysisGenerationTrace = {
  methodologyVersion: string;
  reportVersion: string;
  geminiModel: string;
};

export type TransitAnalysisGenerationState =
  | { status: "idle" }
  | {
      status: "success";
      reportId: string;
      report: TransitAnalysisReport;
      trace: TransitAnalysisGenerationTrace;
    }
  | { status: "error"; message: string; code: string };

type FailureCode =
  | GeminiEngineErrorCode
  | "not_found"
  | "not_configured"
  | "load_error"
  | "transit_load_error"
  | "save_unavailable"
  | "save_error";

export async function generateTransitAnalysisAction(
  _previous: TransitAnalysisGenerationState,
  formData: FormData,
): Promise<TransitAnalysisGenerationState> {
  const startedAt = Date.now();
  console.info("[ai.transits] Generation started", {
    stage: "start",
    reportVersion: getTransitAnalysisGenerationTrace().reportVersion,
    methodologyVersion: getTransitAnalysisGenerationTrace().methodologyVersion,
    model: getTransitAnalysisGenerationTrace().geminiModel,
  });

  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const clientId = formData.get("clientId");
  const transitAnalysisId = formData.get("transitAnalysisId");

  if (
    typeof clientId !== "string" ||
    clientId.trim() === "" ||
    typeof transitAnalysisId !== "string" ||
    transitAnalysisId.trim() === ""
  ) {
    return fail("not_found", startedAt);
  }

  const loadedClient = await getClientById(clientId);
  const clientDecision = decideTransitGenerationFromClientLoad(
    loadedClient.status,
  );

  if (clientDecision.kind === "redirect_login") {
    redirect("/login");
  }

  if (clientDecision.kind === "fail") {
    return fail(clientDecision.code, startedAt);
  }

  if (loadedClient.status !== "ok") {
    return fail("load_error", startedAt);
  }

  const loadedTransit = await getTransitAnalysisById(transitAnalysisId);
  const transitDecision = decideTransitGenerationFromTransitLoad(
    loadedTransit.status,
  );

  if (transitDecision.kind === "redirect_login") {
    redirect("/login");
  }

  if (transitDecision.kind === "fail") {
    return fail(transitDecision.code, startedAt);
  }

  if (loadedTransit.status !== "ok") {
    return fail("transit_load_error", startedAt);
  }

  if (loadedTransit.data.clientId !== loadedClient.data.id) {
    return fail("not_found", startedAt);
  }

  const persistCheck = await listTransitAnalysisReports({
    clientId: loadedClient.data.id,
    transitAnalysisId: loadedTransit.data.id,
  });

  if (persistCheck.status === "unauthorized") {
    redirect("/login");
  }

  if (persistCheck.status !== "ok") {
    return fail("save_unavailable", startedAt);
  }

  let report: TransitAnalysisReport;

  try {
    report = await generateTransitAnalysisReport({
      firstName: loadedClient.data.firstName,
      lastName: loadedClient.data.lastName,
      age: loadedClient.data.age,
      natalChart: loadedClient.data.natalChart,
      transitAnalysis: loadedTransit.data,
    });
  } catch (error) {
    const code = isGeminiEngineError(error)
      ? error.code
      : "gemini_api_error";

    return fail(code, startedAt);
  }

  const saved = await saveTransitAnalysisReport({
    clientId: loadedClient.data.id,
    transitAnalysisId: loadedTransit.data.id,
    report,
  });

  if (saved.status === "unauthorized") {
    redirect("/login");
  }

  if (saved.status !== "ok") {
    console.info("[ai.transits] Generation succeeded but persist failed", {
      stage: "persist_failed",
      durationMs: Date.now() - startedAt,
      saveStatus: saved.status,
      transitAnalysisId: loadedTransit.data.id,
      reportVersion: report.metadata.reportVersion,
      methodologyVersion: report.metadata.methodologyVersion,
    });
    return fail("save_error", startedAt);
  }

  console.info("[ai.transits] Generation finished", {
    stage: "success",
    reportId: saved.data,
    transitAnalysisId: loadedTransit.data.id,
    durationMs: Date.now() - startedAt,
    reportVersion: report.metadata.reportVersion,
    methodologyVersion: report.metadata.methodologyVersion,
  });

  revalidatePath(
    `/clients/${loadedClient.data.id}/transits/${loadedTransit.data.id}`,
  );
  revalidatePath(
    `/clients/${loadedClient.data.id}/transits/${loadedTransit.data.id}/reports/${saved.data}`,
  );

  redirect(
    `/clients/${loadedClient.data.id}/transits/${loadedTransit.data.id}/reports/${saved.data}`,
  );
}

function fail(
  code: FailureCode,
  startedAt: number,
): TransitAnalysisGenerationState {
  console.info("[ai.transits] Generation failed", {
    stage: "failed",
    code,
    durationMs: Date.now() - startedAt,
    model: getTransitAnalysisGenerationTrace().geminiModel,
    reportVersion: getTransitAnalysisGenerationTrace().reportVersion,
    methodologyVersion: getTransitAnalysisGenerationTrace().methodologyVersion,
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
      return "El modelo generó una referencia astrológica que no coincide con los datos cargados. El análisis fue descartado.";
    case "invalid_json":
    case "invalid_schema":
    case "invalid_input":
      return "El modelo devolvió un resultado que no se pudo validar. El análisis fue descartado.";
    case "not_found":
      return "No se encontró este consultante o este análisis de tránsitos.";
    case "not_configured":
      return "Falta configurar el acceso a los datos.";
    case "load_error":
      return "No se pudo cargar el Mandala Evolutivo completo. Volvé a intentarlo.";
    case "transit_load_error":
      return "No se pudo cargar el análisis de tránsitos. Volvé a intentarlo.";
    case "save_unavailable":
      return "No se pudo verificar el almacenamiento de informes. No se inició la generación.";
    case "save_error":
      return "El análisis se generó, pero no se pudo guardar.";
    case "gemini_api_error":
    case "blocked_response":
      return "No se pudo completar el informe. Podés intentarlo de nuevo.";
  }
}
