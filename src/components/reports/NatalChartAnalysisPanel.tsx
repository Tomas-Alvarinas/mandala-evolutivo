"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import {
  generateNatalChartAnalysisAction,
  type NatalChartAnalysisState,
} from "@/lib/ai/natal-chart/actions";

type NatalChartAnalysisPanelProps = {
  clientId: string;
};

const initialState: NatalChartAnalysisState = { status: "idle" };

export function NatalChartAnalysisPanel({
  clientId,
}: NatalChartAnalysisPanelProps) {
  const router = useRouter();
  const submitLockRef = useRef(false);
  const [state, formAction, isPending] = useActionState(
    generateNatalChartAnalysisAction,
    initialState,
  );

  useEffect(() => {
    if (!isPending) {
      submitLockRef.current = false;
    }
  }, [isPending]);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-section-title">
          Informes de Carta Natal
        </h2>
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

      {!isPending && state.status === "success" ? (
        <Alert
          variant="success"
          className="mt-3"
          title="Informe guardado."
          actions={
            <Button
              href={`/clients/${clientId}/reports/${state.reportId}`}
              variant="secondary"
            >
              Ver informe
            </Button>
          }
        />
      ) : null}
    </div>
  );
}
