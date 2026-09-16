"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/session";
import {
  createTransitClientReport as persistTransitClientReport,
  refreshTransitClientReportFromProfessional as persistTransitClientReportRefresh,
  updateTransitClientReport as persistTransitClientReportUpdate,
} from "./repository";
import type { TransitClientReport } from "./types";

export type TransitClientReportActionResult =
  | { success: true }
  | { success: false; error: string };

export async function prepareTransitClientReport(input: {
  clientId: string;
  transitAnalysisId: string;
  professionalReportId: string;
}): Promise<TransitClientReportActionResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const saved = await persistTransitClientReport({
    clientId: input.clientId,
    transitAnalysisId: input.transitAnalysisId,
    professionalReportId: input.professionalReportId,
  });

  return toActionResult(saved, input, "create");
}

export async function updateTransitClientReport(input: {
  clientId: string;
  transitAnalysisId: string;
  professionalReportId: string;
  clientReport: TransitClientReport;
}): Promise<TransitClientReportActionResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const saved = await persistTransitClientReportUpdate({
    clientId: input.clientId,
    transitAnalysisId: input.transitAnalysisId,
    professionalReportId: input.professionalReportId,
    clientReport: input.clientReport,
  });

  return toActionResult(saved, input, "update");
}

export async function refreshTransitClientReportFromProfessional(input: {
  clientId: string;
  transitAnalysisId: string;
  professionalReportId: string;
}): Promise<TransitClientReportActionResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const saved = await persistTransitClientReportRefresh({
    clientId: input.clientId,
    transitAnalysisId: input.transitAnalysisId,
    professionalReportId: input.professionalReportId,
  });

  return toActionResult(saved, input, "refresh");
}

function toActionResult(
  saved: {
    status:
      | "ok"
      | "not_configured"
      | "unauthorized"
      | "not_found"
      | "not_ready"
      | "conflict"
      | "invalid"
      | "error";
  },
  input: {
    clientId: string;
    transitAnalysisId: string;
    professionalReportId: string;
  },
  mode: "create" | "update" | "refresh",
): TransitClientReportActionResult {
  if (saved.status === "unauthorized") {
    redirect("/login");
  }

  if (saved.status === "ok") {
    revalidateClientReportPaths(input);
    return { success: true };
  }

  if (saved.status === "not_configured") {
    return {
      success: false,
      error: "Falta configurar el acceso a los datos para la versión consultante.",
    };
  }

  if (saved.status === "not_found") {
    return {
      success: false,
      error:
        mode === "create"
          ? "No se encontró el informe profesional."
          : "No se encontró la versión consultante.",
    };
  }

  if (saved.status === "not_ready") {
    return {
      success: false,
      error:
        mode === "refresh"
          ? "Marcá primero el informe profesional como Listo para entregar para actualizar esta versión."
          : "Marcá el informe profesional como Listo para entregar antes de preparar la versión consultante.",
    };
  }

  if (saved.status === "conflict") {
    return {
      success: false,
      error: "Ya existe una versión consultante de este informe.",
    };
  }

  if (saved.status === "invalid") {
    return {
      success: false,
      error:
        "La versión consultante no es válida. Revisá que ningún texto quede vacío.",
    };
  }

  return {
    success: false,
    error:
      mode === "create"
        ? "No se pudo preparar la versión consultante. Intentá de nuevo."
        : mode === "refresh"
          ? "No se pudo actualizar la versión consultante. Intentá de nuevo."
          : "No se pudo guardar la versión consultante. Intentá de nuevo.",
  };
}

function revalidateClientReportPaths(input: {
  clientId: string;
  transitAnalysisId: string;
  professionalReportId: string;
}) {
  const base = `/clients/${input.clientId}/transits/${input.transitAnalysisId}`;
  const reportBase = `${base}/reports/${input.professionalReportId}`;

  revalidatePath(base);
  revalidatePath(reportBase);
  revalidatePath(`${reportBase}/edit`);
  revalidatePath(`${reportBase}/original`);
  revalidatePath(`${reportBase}/client`);
  revalidatePath(`${reportBase}/client/edit`);
}
