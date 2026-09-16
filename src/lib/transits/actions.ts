"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { toTransitAnalysis, type TransitAnalysisFormData } from "@/lib/transits";
import {
  createTransitAnalysis as persistCreate,
  deleteTransitAnalysis as persistDelete,
  updateTransitAnalysis as persistUpdate,
} from "@/lib/transits/repository";

export type SaveTransitAnalysisResult =
  | { success: true; analysisId: string }
  | { success: false; error: string };

export async function createTransitAnalysisAction(input: {
  clientId: string;
  form: TransitAnalysisFormData;
}): Promise<SaveTransitAnalysisResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = toTransitAnalysis(input.form);

  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }

  const saved = await persistCreate({
    clientId: input.clientId,
    analysis: parsed.data,
  });

  if (saved.status === "not_configured") {
    return {
      success: false,
      error:
        "Falta configurar el acceso a los datos para guardar análisis.",
    };
  }

  if (saved.status === "unauthorized") {
    redirect("/login");
  }

  if (saved.status === "not_found") {
    return { success: false, error: "Consultante inexistente." };
  }

  if (saved.status !== "ok") {
    return {
      success: false,
      error: "No se pudo guardar el análisis. Intentá de nuevo.",
    };
  }

  revalidateTransitPaths(input.clientId, saved.data);

  return { success: true, analysisId: saved.data };
}

export async function updateTransitAnalysisAction(input: {
  clientId: string;
  analysisId: string;
  form: TransitAnalysisFormData;
}): Promise<SaveTransitAnalysisResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = toTransitAnalysis(input.form);

  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }

  const saved = await persistUpdate({
    analysisId: input.analysisId,
    analysis: parsed.data,
  });

  if (saved.status === "not_configured") {
    return {
      success: false,
      error:
        "Falta configurar el acceso a los datos para guardar análisis.",
    };
  }

  if (saved.status === "unauthorized") {
    redirect("/login");
  }

  if (saved.status === "not_found") {
    return { success: false, error: "Análisis inexistente." };
  }

  if (saved.status !== "ok") {
    return {
      success: false,
      error: "No se pudo guardar. Intentá de nuevo.",
    };
  }

  revalidateTransitPaths(input.clientId, saved.data);

  return { success: true, analysisId: saved.data };
}

export type DeleteTransitAnalysisResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteTransitAnalysisAction(input: {
  clientId: string;
  analysisId: string;
}): Promise<DeleteTransitAnalysisResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const deleted = await persistDelete(input.analysisId);

  if (deleted.status === "not_configured") {
    return {
      success: false,
      error: "Falta configurar el acceso a los datos para eliminar este período.",
    };
  }

  if (deleted.status === "unauthorized") {
    redirect("/login");
  }

  if (deleted.status === "not_found") {
    return { success: false, error: "Análisis inexistente." };
  }

  if (deleted.status !== "ok") {
    return {
      success: false,
      error: "No se pudo eliminar el análisis. Intentá de nuevo.",
    };
  }

  revalidatePath(`/clients/${input.clientId}`);
  revalidatePath(`/clients/${input.clientId}/transits`);
  revalidatePath(`/clients/${input.clientId}/transits/${input.analysisId}`, "layout");

  return { success: true };
}

function revalidateTransitPaths(clientId: string, analysisId: string) {
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/transits`);
  revalidatePath(`/clients/${clientId}/transits/new`);
  revalidatePath(`/clients/${clientId}/transits/${analysisId}`);
  revalidatePath(`/clients/${clientId}/transits/${analysisId}/edit`);
}
