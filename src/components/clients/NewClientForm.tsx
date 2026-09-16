"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ClientPersonalFields } from "@/components/clients/ClientPersonalFields";
import { useNewClientFlow } from "@/components/clients/NewClientFlowProvider";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { parseClientForm } from "@/lib/clients/parse-client";

export function NewClientForm() {
  const router = useRouter();
  const { client, setClient } = useNewClientFlow();
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState(client?.firstName ?? "");
  const [lastName, setLastName] = useState(client?.lastName ?? "");
  const [age, setAge] = useState(client?.age ?? "");
  const [professionalNotes, setProfessionalNotes] = useState(
    client?.professionalNotes ?? "",
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = parseClientForm({
      firstName,
      lastName,
      age,
      professionalNotes,
    });

    if (!result.success) {
      setError(result.error);
      return;
    }

    setClient({
      firstName: result.data.firstName,
      lastName: result.data.lastName,
      age: String(result.data.age),
      professionalNotes: result.data.professionalNotes ?? undefined,
    });
    router.push("/clients/new/natal-chart");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
        onProfessionalNotesChange={setProfessionalNotes}
      />
      {error ? (
        <Alert variant="danger" role="alert" title={error} />
      ) : null}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="ghost" href="/clients">
          Cancelar
        </Button>
        <Button type="submit">Continuar</Button>
      </div>
    </form>
  );
}
