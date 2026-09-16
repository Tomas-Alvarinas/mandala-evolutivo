"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { toSolarReturn, type SolarReturnFormData } from "@/lib/solar-returns";
import {
  createSolarReturn as persistCreate,
  deleteSolarReturn as persistDelete,
  updateSolarReturn as persistUpdate,
} from "@/lib/solar-returns/repository";

export type SaveSolarReturnResult =
  | { success: true; solarReturnId: string }
  | { success: false; error: string };

const DUPLICATE_PERIOD_ERROR =
  "Ya existe una Revolución Solar con ese período para este consultante.";

export async function createSolarReturnAction(input: {
  clientId: string;
  form: SolarReturnFormData;
}): Promise<SaveSolarReturnResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = toSolarReturn(input.form);

  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }

  const saved = await persistCreate({
    clientId: input.clientId,
    solarReturn: parsed.data,
  });

  if (saved.status === "not_configured") {
    return {
      success: false,
      error: "Falta configurar el acceso a los datos para guardar revoluciones solares.",
    };
  }

  if (saved.status === "unauthorized") {
    redirect("/login");
  }

  if (saved.status === "not_found") {
    return { success: false, error: "Consultante inexistente." };
  }

  if (saved.status === "duplicate_period") {
    return { success: false, error: DUPLICATE_PERIOD_ERROR };
  }

  if (saved.status !== "ok") {
    return {
      success: false,
      error: "No se pudo guardar la Revolución Solar. Intentá de nuevo.",
    };
  }

  revalidateSolarReturnPaths(input.clientId, saved.data);

  return { success: true, solarReturnId: saved.data };
}

export async function updateSolarReturnAction(input: {
  clientId: string;
  solarReturnId: string;
  form: SolarReturnFormData;
}): Promise<SaveSolarReturnResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = toSolarReturn(input.form);

  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }

  const saved = await persistUpdate({
    solarReturnId: input.solarReturnId,
    solarReturn: parsed.data,
  });

  if (saved.status === "not_configured") {
    return {
      success: false,
      error: "Falta configurar el acceso a los datos para guardar revoluciones solares.",
    };
  }

  if (saved.status === "unauthorized") {
    redirect("/login");
  }

  if (saved.status === "not_found") {
    return { success: false, error: "Revolución Solar inexistente." };
  }

  if (saved.status === "duplicate_period") {
    return { success: false, error: DUPLICATE_PERIOD_ERROR };
  }

  if (saved.status !== "ok") {
    return {
      success: false,
      error: "No se pudo guardar. Intentá de nuevo.",
    };
  }

  revalidateSolarReturnPaths(input.clientId, saved.data);

  return { success: true, solarReturnId: saved.data };
}

export type DeleteSolarReturnResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteSolarReturnAction(input: {
  clientId: string;
  solarReturnId: string;
}): Promise<DeleteSolarReturnResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const deleted = await persistDelete(input.solarReturnId);

  if (deleted.status === "not_configured") {
    return {
      success: false,
      error: "Falta configurar el acceso a los datos para eliminar revoluciones solares.",
    };
  }

  if (deleted.status === "unauthorized") {
    redirect("/login");
  }

  if (deleted.status === "not_found") {
    return { success: false, error: "Revolución Solar inexistente." };
  }

  if (deleted.status !== "ok") {
    return {
      success: false,
      error: "No se pudo eliminar la Revolución Solar. Intentá de nuevo.",
    };
  }

  revalidatePath(`/clients/${input.clientId}`);
  revalidatePath(`/clients/${input.clientId}/solar-returns`);
  revalidatePath(
    `/clients/${input.clientId}/solar-returns/${input.solarReturnId}`,
    "layout",
  );

  return { success: true };
}

function revalidateSolarReturnPaths(clientId: string, solarReturnId: string) {
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/solar-returns`);
  revalidatePath(`/clients/${clientId}/solar-returns/new`);
  revalidatePath(`/clients/${clientId}/solar-returns/${solarReturnId}`);
  revalidatePath(`/clients/${clientId}/solar-returns/${solarReturnId}/edit`);
}
