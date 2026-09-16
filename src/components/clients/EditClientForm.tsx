"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ClientPersonalFields } from "@/components/clients/ClientPersonalFields";
import { NatalChartEditor } from "@/components/natal-chart/NatalChartEditor";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { updateClientWithNatalChart } from "@/lib/clients/actions";
import {
  toNatalChart,
  toNatalChartFormData,
  type NatalChartDraft,
} from "@/lib/clients/natal-chart-form";
import { parseClientForm } from "@/lib/clients/parse-client";
import type { ClientFormValues } from "@/types/client";

type EditClientFormProps = {
  clientId: string;
  initialClient: ClientFormValues;
  initialNatalChart: NatalChartDraft;
};

export function EditClientForm({
  clientId,
  initialClient,
  initialNatalChart,
}: EditClientFormProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(initialClient.firstName);
  const [lastName, setLastName] = useState(initialClient.lastName);
  const [age, setAge] = useState(initialClient.age);
  const [professionalNotes, setProfessionalNotes] = useState(
    initialClient.professionalNotes ?? "",
  );
  const [natalChart, setNatalChart] = useState(initialNatalChart);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    const clientValues: ClientFormValues = {
      firstName,
      lastName,
      age,
      professionalNotes,
    };
    const clientResult = parseClientForm(clientValues);

    if (!clientResult.success) {
      setError(clientResult.error);
      return;
    }

    const natalChartResult = toNatalChart(toNatalChartFormData(natalChart));

    if (!natalChartResult.success) {
      setError(natalChartResult.error);
      return;
    }

    setIsSaving(true);
    setError(null);

    const result = await updateClientWithNatalChart({
      clientId,
      client: clientValues,
      natalChart: toNatalChartFormData(natalChart),
    });

    if (!result.success) {
      setError(result.error);
      setIsSaving(false);
      return;
    }

    router.push(`/clients/${clientId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <h2 className="font-serif text-xl tracking-tight text-foreground">
          Datos personales
        </h2>
        <div className="mt-6 flex flex-col gap-6">
          <ClientPersonalFields
            firstName={firstName}
            lastName={lastName}
            age={age}
            professionalNotes={professionalNotes}
            onFirstNameChange={(value) => {
              setError(null);
              setFirstName(value);
            }}
            onLastNameChange={(value) => {
              setError(null);
              setLastName(value);
            }}
            onAgeChange={(value) => {
              setError(null);
              setAge(value);
            }}
            onProfessionalNotesChange={(value) => {
              setError(null);
              setProfessionalNotes(value);
            }}
          />
        </div>
      </Card>

      <Card className="mt-8">
        <h2 className="font-serif text-xl tracking-tight text-foreground">
          Carta Natal
        </h2>
        <div className="mt-8">
          <NatalChartEditor
            natalChart={natalChart}
            onChange={setNatalChart}
            onDirty={() => setError(null)}
          />
        </div>
      </Card>

      {error ? (
        <Alert variant="danger" className="mt-6" role="alert" title={error} />
      ) : null}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          variant="ghost"
          href={`/clients/${clientId}`}
          className={isSaving ? "pointer-events-none opacity-50" : ""}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Guardando cambios..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
