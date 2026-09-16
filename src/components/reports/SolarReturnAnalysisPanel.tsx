"use client";

import { useActionState, useEffect, useRef } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import {
  generateSolarReturnAnalysisAction,
  type SolarReturnGenerationState,
} from "@/lib/ai/solar-returns/actions";

type SolarReturnAnalysisPanelProps = {
  clientId: string;
  solarReturnId: string;
};

const initialState: SolarReturnGenerationState = { status: "idle" };

export function SolarReturnAnalysisPanel({
  clientId,
  solarReturnId,
}: SolarReturnAnalysisPanelProps) {
  const submitLockRef = useRef(false);
  const [state, formAction, isPending] = useActionState(
    generateSolarReturnAnalysisAction,
    initialState,
  );

  useEffect(() => {
    if (!isPending) {
      submitLockRef.current = false;
    }
  }, [isPending]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-section-title">Informes generados</h2>
        <form
          action={formAction}
          className="w-full sm:w-auto"
          aria-busy={isPending}
          onSubmit={(event) => {
            if (isPending || submitLockRef.current) {
              event.preventDefault();
              return;
            }

            submitLockRef.current = true;
          }}
        >
          <input type="hidden" name="clientId" value={clientId} />
          <input type="hidden" name="solarReturnId" value={solarReturnId} />
          <Button
            type="submit"
            variant="secondary"
            className="w-full sm:w-auto"
            disabled={isPending}
          >
            {isPending ? "Generando informe..." : "Generar nuevo informe"}
          </Button>
        </form>
      </div>

      {isPending ? (
        <p className="mt-3 text-sm text-muted" aria-live="polite">
          El informe puede demorar algunos minutos.
        </p>
      ) : null}

      {!isPending && state.status === "error" ? (
        <Alert
          variant="danger"
          className="mt-3"
          role="alert"
          title={state.message}
        >
          {process.env.NODE_ENV === "development"
            ? `Código: ${state.code}`
            : undefined}
        </Alert>
      ) : null}
    </div>
  );
}
