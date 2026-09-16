"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getClientById } from "@/lib/clients/repository";
import {
  createNatalChartClientReport as persistNatalChartClientReport,
  refreshNatalChartClientReportFromProfessional as persistNatalChartClientReportRefresh,
  updateNatalChartClientReport as persistNatalChartClientReportUpdate,
} from "./repository";
import type { NatalChartClientReport } from "./types";

export type NatalChartClientReportActionResult =
  | { success: true }
  | { success: false; error: string };

export async function createNatalChartClientReport(input: {
  clientId: string;
  reportId: string;
}): Promise<NatalChartClientReportActionResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const client = await getClientById(input.clientId);

  if (client.status === "unauthorized") {
    redirect("/login");
  }

  if (client.status !== "ok") {
    return {
      success: false,
      error: "No se pudo cargar este consultante.",
    };
  }

  const saved = await persistNatalChartClientReport({
    clientId: input.clientId,
    natalChartReportId: input.reportId,
    clientName: `${client.data.firstName} ${client.data.lastName}`,
  });

  return toActionResult(saved, input, "create");
}

export async function updateNatalChartClientReport(input: {
  clientId: string;
  reportId: string;
  clientReport: NatalChartClientReport;
}): Promise<NatalChartClientReportActionResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const saved = await persistNatalChartClientReportUpdate({
    clientId: input.clientId,
    natalChartReportId: input.reportId,
    clientReport: input.clientReport,
  });

  return toActionResult(saved, input, "update");
}

export async function refreshNatalChartClientReportFromProfessional(input: {
  clientId: string;
  reportId: string;
}): Promise<NatalChartClientReportActionResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const client = await getClientById(input.clientId);

  if (client.status === "unauthorized") {
    redirect("/login");
  }

  if (client.status !== "ok") {
    return {
      success: false,
      error: "No se pudo cargar este consultante.",
    };
  }

  const saved = await persistNatalChartClientReportRefresh({
    clientId: input.clientId,
    natalChartReportId: input.reportId,
    clientName: `${client.data.firstName} ${client.data.lastName}`,
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
  input: { clientId: string; reportId: string },
  mode: "create" | "update" | "refresh",
): NatalChartClientReportActionResult {
  if (saved.status === "unauthorized") {
    redirect("/login");
  }

  if (saved.status === "ok") {
    revalidateClientReportPaths(input.clientId, input.reportId);
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
          : "Marcá el informe como Listo para entregar antes de preparar la versión consultante.",
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
        "La versión consultante no es válida. Revisá que ningún texto quede vacío y que cada lista tenga al menos un elemento.",
    };
  }

  return {
    success: false,
    error:
      mode === "create"
        ? "No se pudo crear la versión consultante. Intentá de nuevo."
        : mode === "refresh"
          ? "No se pudo actualizar la versión consultante. Intentá de nuevo."
          : "No se pudo guardar la versión consultante. Intentá de nuevo.",
  };
}

function revalidateClientReportPaths(clientId: string, reportId: string) {
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/reports/${reportId}`);
  revalidatePath(`/clients/${clientId}/reports/${reportId}/edit`);
  revalidatePath(`/clients/${clientId}/reports/${reportId}/client`);
  revalidatePath(`/clients/${clientId}/reports/${reportId}/client/edit`);
}
