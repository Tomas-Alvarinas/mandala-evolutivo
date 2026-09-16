"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { fieldErrorClassName } from "@/lib/ui/control-classes";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    login,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Input
        id="email"
        name="email"
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        required
      />
      <Input
        id="password"
        name="password"
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        required
      />
      {state?.error ? (
        <p className={fieldErrorClassName} role="alert">
          {state.error}
        </p>
      ) : null}
      <div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Ingresando..." : "Ingresar"}
        </Button>
      </div>
    </form>
  );
}
