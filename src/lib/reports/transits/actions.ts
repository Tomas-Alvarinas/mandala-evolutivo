"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/session";
import type { TransitAnalysisReport } from "./types";
import {
  updateTransitAnalysisProfessionalReport as persistProfessionalReport,
  updateTransitAnalysisReportStatus as persistReportStatus,
} from "./repository";
import {
  parseTransitAnalysisReportStatus,
  type TransitAnalysisReportStatus,
} from "./status";

export type UpdateTransitAnalysisReportResult =
  | { success: true }
  | { success: false; error: string };

function reportPaths(input: {
  clientId: string;
  transitAnalysisId: string;
  reportId: string;
}) {
  const base = `/clients/${input.clientId}/transits/${input.transitAnalysisId}`;
  return [
    base,
    `${base}/reports/${input.reportId}`,
    `${base}/reports/${input.reportId}/edit`,
    `${base}/reports/${input.reportId}/original`,
    `${base}/reports/${input.reportId}/client`,
    `${base}/reports/${input.reportId}/client/edit`,
  ];
}

export async function updateTransitAnalysisProfessionalReport(input: {
  clientId: string;
  transitAnalysisId: string;
  reportId: string;
  report: TransitAnalysisReport;
}): Promise<UpdateTransitAnalysisReportResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const saved = await persistProfessionalReport({
    clientId: input.clientId,
    transitAnalysisId: input.transitAnalysisId,
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
        "El informe editado no es válido. Revisá que ningún texto quede vacío.",
    };
  }

  if (saved.status !== "ok") {
    return {
      success: false,
      error: "No se pudo guardar el informe. Intentá de nuevo.",
    };
  }

  for (const path of reportPaths(input)) {
    revalidatePath(path);
  }

  return { success: true };
}

export async function updateTransitAnalysisReportStatus(input: {
  clientId: string;
  transitAnalysisId: string;
  reportId: string;
  status: TransitAnalysisReportStatus;
}): Promise<UpdateTransitAnalysisReportResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  if (!parseTransitAnalysisReportStatus(input.status)) {
    return {
      success: false,
      error: "El estado del informe no es válido.",
    };
  }

  const saved = await persistReportStatus({
    clientId: input.clientId,
    transitAnalysisId: input.transitAnalysisId,
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

  for (const path of reportPaths(input)) {
    revalidatePath(path);
  }

  return { success: true };
}
