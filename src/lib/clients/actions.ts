"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/session";
import {
  toNatalChart,
  type NatalChartResult,
} from "@/lib/clients/natal-chart-form";
import { parseClientForm } from "@/lib/clients/parse-client";
import {
  createClientWithNatalChart,
  deleteClient as persistClientDelete,
  updateClientWithNatalChart as persistClientUpdate,
} from "@/lib/clients/repository";
import type { NatalChartFormData } from "@/lib/astrology";
import type { ClientFormValues } from "@/types/client";

export type SaveClientResult =
  | { success: true; clientId: string }
  | { success: false; error: string };

export async function saveClientWithNatalChart(input: {
  client: ClientFormValues;
  natalChart: NatalChartFormData;
}): Promise<SaveClientResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const clientResult = parseClientForm(input.client);

  if (!clientResult.success) {
    return { success: false, error: clientResult.error };
  }

  const natalChartResult: NatalChartResult = toNatalChart(input.natalChart);

  if (!natalChartResult.success) {
    return { success: false, error: natalChartResult.error };
  }

  const saved = await createClientWithNatalChart({
    client: clientResult.data,
    natalChart: natalChartResult.data,
  });

  if (saved.status === "not_configured") {
    return {
      success: false,
      error:
        "Falta configurar el acceso a los datos para guardar consultantes.",
    };
  }

  if (saved.status === "unauthorized") {
    redirect("/login");
  }

  if (saved.status !== "ok") {
    return {
      success: false,
      error: "No se pudo guardar el consultante. Intentá de nuevo.",
    };
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${saved.data}`);

  return { success: true, clientId: saved.data };
}

export async function updateClientWithNatalChart(input: {
  clientId: string;
  client: ClientFormValues;
  natalChart: NatalChartFormData;
}): Promise<SaveClientResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const clientResult = parseClientForm(input.client);

  if (!clientResult.success) {
    return { success: false, error: clientResult.error };
  }

  const natalChartResult: NatalChartResult = toNatalChart(input.natalChart);

  if (!natalChartResult.success) {
    return { success: false, error: natalChartResult.error };
  }

  const saved = await persistClientUpdate({
    clientId: input.clientId,
    client: clientResult.data,
    natalChart: natalChartResult.data,
  });

  if (saved.status === "not_configured") {
    return {
      success: false,
      error:
        "Falta configurar el acceso a los datos para guardar consultantes.",
    };
  }

  if (saved.status === "unauthorized") {
    redirect("/login");
  }

  if (saved.status === "not_found") {
    return {
      success: false,
      error: "Consultante inexistente.",
    };
  }

  if (saved.status !== "ok") {
    return {
      success: false,
      error: "No se pudo guardar. Intentá de nuevo.",
    };
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${saved.data}`);
  revalidatePath(`/clients/${saved.data}/edit`);

  return { success: true, clientId: saved.data };
}

export type DeleteClientResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteClient(
  clientId: string,
): Promise<DeleteClientResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const deleted = await persistClientDelete(clientId);

  if (deleted.status === "not_configured") {
    return {
      success: false,
      error:
        "Falta configurar el acceso a los datos para guardar consultantes.",
    };
  }

  if (deleted.status === "unauthorized") {
    redirect("/login");
  }

  if (deleted.status === "not_found") {
    return {
      success: false,
      error: "Consultante inexistente.",
    };
  }

  if (deleted.status !== "ok") {
    return {
      success: false,
      error: "No se pudo eliminar el consultante. Intentá nuevamente.",
    };
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/edit`);

  return { success: true };
}
