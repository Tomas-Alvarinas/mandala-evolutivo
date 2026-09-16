"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getClientById } from "@/lib/clients/repository";
import {
  createSolarReturnReport,
  listSolarReturnReports,
} from "@/lib/reports/solar-returns/repository";
import { getSolarReturnById } from "@/lib/solar-returns/repository";
import type { SolarReturnReport } from "@/lib/reports/solar-returns";
import {
  isGeminiEngineError,
  type GeminiEngineErrorCode,
} from "../gemini/errors";
import {
  decideSolarReturnGenerationFromClientLoad,
  decideSolarReturnGenerationFromSolarReturnLoad,
} from "./generation-guard";
import {
  generateSolarReturnReport,
  getSolarReturnGenerationTrace,
} from "./generate";

export type SolarReturnGenerationTrace = {
  methodologyVersion: string;
  reportVersion: string;
  geminiModel: string;
};

export type SolarReturnGenerationState =
  | { status: "idle" }
  | {
      status: "success";
      reportId: string;
      report: SolarReturnReport;
      trace: SolarReturnGenerationTrace;
    }
  | { status: "error"; message: string; code: string };

type FailureCode =
  | GeminiEngineErrorCode
  | "not_found"
  | "not_configured"
  | "load_error"
  | "solar_return_load_error"
  | "save_unavailable"
  | "save_error";

export async function generateSolarReturnAnalysisAction(
  _previous: SolarReturnGenerationState,
  formData: FormData,
): Promise<SolarReturnGenerationState> {
  const startedAt = Date.now();
  console.info("[ai.solar-returns] Generation started", {
    stage: "start",
    reportVersion: getSolarReturnGenerationTrace().reportVersion,
    methodologyVersion: getSolarReturnGenerationTrace().methodologyVersion,
    model: getSolarReturnGenerationTrace().geminiModel,
  });

  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const clientId = formData.get("clientId");
  const solarReturnId = formData.get("solarReturnId");

  if (
    typeof clientId !== "string" ||
    clientId.trim() === "" ||
    typeof solarReturnId !== "string" ||
    solarReturnId.trim() === ""
  ) {
    return fail("not_found", startedAt);
  }

  const loadedClient = await getClientById(clientId);
  const clientDecision = decideSolarReturnGenerationFromClientLoad(
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

  const loadedSolarReturn = await getSolarReturnById(solarReturnId);
  const solarReturnDecision = decideSolarReturnGenerationFromSolarReturnLoad(
    loadedSolarReturn.status,
  );

  if (solarReturnDecision.kind === "redirect_login") {
    redirect("/login");
  }

  if (solarReturnDecision.kind === "fail") {
    return fail(solarReturnDecision.code, startedAt);
  }

  if (loadedSolarReturn.status !== "ok") {
    return fail("solar_return_load_error", startedAt);
  }

  if (loadedSolarReturn.data.clientId !== loadedClient.data.id) {
    return fail("not_found", startedAt);
  }

  const persistCheck = await listSolarReturnReports({
    clientId: loadedClient.data.id,
    solarReturnId: loadedSolarReturn.data.id,
  });

  if (persistCheck.status === "unauthorized") {
    redirect("/login");
  }

  if (persistCheck.status !== "ok") {
    return fail("save_unavailable", startedAt);
  }

  let report: SolarReturnReport;

  try {
    report = await generateSolarReturnReport({
      firstName: loadedClient.data.firstName,
      lastName: loadedClient.data.lastName,
      age: loadedClient.data.age,
      natalChart: loadedClient.data.natalChart,
      solarReturn: loadedSolarReturn.data,
    });
  } catch (error) {
    const code = isGeminiEngineError(error)
      ? error.code
      : "gemini_api_error";

    return fail(code, startedAt);
  }

  const saved = await createSolarReturnReport({
    clientId: loadedClient.data.id,
    solarReturnId: loadedSolarReturn.data.id,
    report,
  });

  if (saved.status === "unauthorized") {
    redirect("/login");
  }

  if (saved.status !== "ok") {
    console.info("[ai.solar-returns] Generation succeeded but persist failed", {
      stage: "persist_failed",
      durationMs: Date.now() - startedAt,
      saveStatus: saved.status,
      solarReturnId: loadedSolarReturn.data.id,
      reportVersion: report.metadata.reportVersion,
      methodologyVersion: report.metadata.methodologyVersion,
    });
    return fail("save_error", startedAt);
  }

  console.info("[ai.solar-returns] Generation finished", {
    stage: "success",
    reportId: saved.data,
    solarReturnId: loadedSolarReturn.data.id,
    durationMs: Date.now() - startedAt,
    reportVersion: report.metadata.reportVersion,
    methodologyVersion: report.metadata.methodologyVersion,
  });

  revalidatePath(
    `/clients/${loadedClient.data.id}/solar-returns/${loadedSolarReturn.data.id}`,
  );
  revalidatePath(
    `/clients/${loadedClient.data.id}/solar-returns/${loadedSolarReturn.data.id}/reports/${saved.data}`,
  );

  redirect(
    `/clients/${loadedClient.data.id}/solar-returns/${loadedSolarReturn.data.id}/reports/${saved.data}`,
  );
}

function fail(
  code: FailureCode,
  startedAt: number,
): SolarReturnGenerationState {
  console.info("[ai.solar-returns] Generation failed", {
    stage: "failed",
    code,
    durationMs: Date.now() - startedAt,
    model: getSolarReturnGenerationTrace().geminiModel,
    reportVersion: getSolarReturnGenerationTrace().reportVersion,
    methodologyVersion: getSolarReturnGenerationTrace().methodologyVersion,
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
      return "No se encontró este consultante o esta Revolución Solar.";
    case "not_configured":
      return "Falta configurar el acceso a los datos.";
    case "load_error":
      return "No se pudo cargar el Mandala Evolutivo completo. Volvé a intentarlo.";
    case "solar_return_load_error":
      return "No se pudo cargar la Revolución Solar. Volvé a intentarlo.";
    case "save_unavailable":
      return "No se pudo verificar el almacenamiento de informes. No se inició la generación.";
    case "save_error":
      return "El informe se generó, pero no se pudo guardar.";
    case "gemini_api_error":
    case "blocked_response":
      return "No se pudo completar el informe. Podés intentarlo de nuevo.";
  }
}
