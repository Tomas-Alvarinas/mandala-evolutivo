"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/session";
import type { NatalChartReport } from "@/lib/reports";
import {
  updateNatalChartReport,
  updateNatalChartReportStatus as persistNatalChartReportStatus,
} from "./repository";
import {
  parseNatalChartReportStatus,
  type NatalChartReportStatus,
} from "./status";

export type UpdateNatalChartReportResult =
  | { success: true }
  | { success: false; error: string };

export async function updateNatalChartProfessionalReport(input: {
  clientId: string;
  reportId: string;
  report: NatalChartReport;
}): Promise<UpdateNatalChartReportResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const saved = await updateNatalChartReport({
    clientId: input.clientId,
    reportId: input.reportId,
    report: input.report,
  });

  if (saved.status === "unauthorized") {
    redirect("/login");
  }

  if (saved.status === "not_configured") {
    return {
      success: false,
      error: "Falta configurar el acceso a los datos para guardar el informe.",
    };
  }

  if (saved.status === "not_found") {
    return {
      success: false,
      error: "No se encontró este informe.",
    };
  }

  if (saved.status === "invalid") {
    return {
      success: false,
      error:
        "El informe editado no es válido. Revisá que ningún texto quede vacío y que cada lista tenga al menos un elemento.",
    };
  }

  if (saved.status !== "ok") {
    return {
      success: false,
      error: "No se pudo guardar el informe. Intentá de nuevo.",
    };
  }

  revalidateNatalChartReportPaths(input.clientId, input.reportId);

  return { success: true };
}

export async function updateNatalChartReportStatus(input: {
  clientId: string;
  reportId: string;
  status: NatalChartReportStatus;
}): Promise<UpdateNatalChartReportResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  if (!parseNatalChartReportStatus(input.status)) {
    return {
      success: false,
      error: "El estado del informe no es válido.",
    };
  }

  const saved = await persistNatalChartReportStatus({
    clientId: input.clientId,
    reportId: input.reportId,
    status: input.status,
  });

  if (saved.status === "unauthorized") {
    redirect("/login");
  }

  if (saved.status === "not_configured") {
    return {
      success: false,
      error: "Falta configurar el acceso a los datos para actualizar el estado.",
    };
  }

  if (saved.status === "not_found") {
    return {
      success: false,
      error: "No se encontró este informe.",
    };
  }

  if (saved.status === "invalid") {
    return {
      success: false,
      error: "El estado del informe no es válido.",
    };
  }

  if (saved.status !== "ok") {
    return {
      success: false,
      error: "No se pudo actualizar el estado. Intentá de nuevo.",
    };
  }

  revalidateNatalChartReportPaths(input.clientId, input.reportId);

  return { success: true };
}

function revalidateNatalChartReportPaths(clientId: string, reportId: string) {
  const reportBase = `/clients/${clientId}/reports/${reportId}`;

  revalidatePath(`/clients/${clientId}`);
  revalidatePath(reportBase);
  revalidatePath(`${reportBase}/edit`);
  revalidatePath(`${reportBase}/original`);
  revalidatePath(`${reportBase}/client`);
  revalidatePath(`${reportBase}/client/edit`);
}
