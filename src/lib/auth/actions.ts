"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginState = {
  error: string;
} | null;

export async function login(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Falta configurar el acceso a los datos para iniciar sesión.",
    };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Ingresá correo y contraseña." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("[auth] Login failed", { code: error.code });
    return { error: "Email o contraseña incorrectos." };
  }

  redirect("/");
}

export async function logout() {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}
