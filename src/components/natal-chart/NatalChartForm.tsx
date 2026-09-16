"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useNewClientFlow } from "@/components/clients/NewClientFlowProvider";
import { NatalChartEditor } from "@/components/natal-chart/NatalChartEditor";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  getNatalChartContinueError,
  toNatalChartFormData,
} from "@/lib/clients/natal-chart-form";
import { useIsClient } from "@/lib/clients/use-is-client";

export function NatalChartForm() {
  const router = useRouter();
  const isClient = useIsClient();
  const { client, natalChart, setNatalChart } = useNewClientFlow();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isClient && !client) {
      router.replace("/clients/new");
    }
  }, [client, isClient, router]);

  if (!isClient || !client) {
    return (
      <p className="text-sm text-muted">Preparando la carta natal…</p>
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = getNatalChartContinueError(
      toNatalChartFormData(natalChart),
    );

    if (validationError) {
      setError(validationError);
      return;
    }

    router.push("/clients/new/review");
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <NatalChartEditor
          natalChart={natalChart}
          onChange={setNatalChart}
          onDirty={() => setError(null)}
        />
      </Card>

      {error ? (
        <Alert variant="danger" className="mt-6" role="alert" title={error} />
      ) : null}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="secondary" href="/clients/new">
          Volver
        </Button>
        <Button type="submit">Continuar</Button>
      </div>
    </form>
  );
}
