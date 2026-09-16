"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useNewClientFlow } from "@/components/clients/NewClientFlowProvider";
import { NatalChartDetails } from "@/components/natal-chart/NatalChartDetails";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { saveClientWithNatalChart } from "@/lib/clients/actions";
import {
  parseNatalChart,
  toNatalChartFormData,
} from "@/lib/clients/natal-chart-form";
import { useIsClient } from "@/lib/clients/use-is-client";

export function NatalChartReview() {
  const router = useRouter();
  const isClient = useIsClient();
  const { client, natalChart } = useNewClientFlow();
  const chart = parseNatalChart(toNatalChartFormData(natalChart));
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    if (!client) {
      router.replace("/clients/new");
      return;
    }

    if (!chart) {
      router.replace("/clients/new/natal-chart");
    }
  }, [chart, client, isClient, router]);

  async function handleSave() {
    if (isSaving || !client) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const result = await saveClientWithNatalChart({
      client,
      natalChart: toNatalChartFormData(natalChart),
    });

    if (!result.success) {
      setSaveError(result.error);
      setIsSaving(false);
      return;
    }

    router.push(`/clients/${result.clientId}`);
  }

  if (!isClient || !client || !chart) {
    return <p className="text-sm text-muted">Preparando el resumen…</p>;
  }

  return (
    <div>
      <Card>
        <h2 className="font-serif text-xl tracking-tight text-foreground">
          Datos personales
        </h2>
        <p className="mt-4 text-base text-foreground">
          {client.firstName} {client.lastName}
        </p>
        <p className="mt-1 text-sm text-muted">{client.age} años</p>
        {client.professionalNotes ? (
          <div className="mt-6 max-w-2xl">
            <h3 className="text-xs font-medium tracking-wide text-muted uppercase">
              Notas de la profesional
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {client.professionalNotes}
            </p>
          </div>
        ) : null}
      </Card>

      <Card className="mt-8">
        <NatalChartDetails chart={chart} />
      </Card>

      {saveError ? (
        <Alert
          variant="danger"
          className="mt-6"
          role="alert"
          title={saveError}
        />
      ) : null}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          variant="secondary"
          href="/clients/new/natal-chart"
          className={isSaving ? "pointer-events-none opacity-50" : ""}
        >
          Volver
        </Button>
        <Button type="button" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Guardando consultante..." : "Guardar consultante"}
        </Button>
      </div>
    </div>
  );
}
