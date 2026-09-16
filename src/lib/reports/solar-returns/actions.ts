"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/session";
import type { SolarReturnReport } from "./types";
import {
  updateSolarReturnProfessionalReport as persistProfessionalReport,
  updateSolarReturnReportStatus as persistReportStatus,
} from "./repository";
import {
  parseSolarReturnReportStatus,
  type SolarReturnReportStatus,
} from "./status";

export type UpdateSolarReturnReportResult =
  | { success: true }
  | { success: false; error: string };

function reportPaths(input: {
  clientId: string;
  solarReturnId: string;
  reportId: string;
}) {
  const base = `/clients/${input.clientId}/solar-returns/${input.solarReturnId}`;
  return [
    base,
    `${base}/reports/${input.reportId}`,
    `${base}/reports/${input.reportId}/edit`,
    `${base}/reports/${input.reportId}/original`,
    `${base}/reports/${input.reportId}/client`,
    `${base}/reports/${input.reportId}/client/edit`,
  ];
}

export async function updateSolarReturnProfessionalReport(input: {
  clientId: string;
  solarReturnId: string;
  reportId: string;
  report: SolarReturnReport;
}): Promise<UpdateSolarReturnReportResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const saved = await persistProfessionalReport({
    clientId: input.clientId,
    solarReturnId: input.solarReturnId,
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

export async function updateSolarReturnReportStatus(input: {
  clientId: string;
  solarReturnId: string;
  reportId: string;
  status: SolarReturnReportStatus;
}): Promise<UpdateSolarReturnReportResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  if (!parseSolarReturnReportStatus(input.status)) {
    return {
      success: false,
      error: "El estado del informe no es válido.",
    };
  }

  const saved = await persistReportStatus({
    clientId: input.clientId,
    solarReturnId: input.solarReturnId,
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
