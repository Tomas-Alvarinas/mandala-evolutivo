"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SolarReturnEditor } from "@/components/solar-returns/SolarReturnEditor";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  createSolarReturnAction,
  updateSolarReturnAction,
} from "@/lib/solar-returns/actions";
import {
  toSolarReturn,
  toSolarReturnFormData,
  type SolarReturnDraft,
} from "@/lib/solar-returns";

type SolarReturnFormProps = {
  clientId: string;
  solarReturnId?: string;
  initialDraft: SolarReturnDraft;
  cancelHref: string;
};

export function SolarReturnForm({
  clientId,
  solarReturnId,
  initialDraft,
  cancelHref,
}: SolarReturnFormProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(initialDraft);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isEdit = Boolean(solarReturnId);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    const form = toSolarReturnFormData(draft);
    const parsed = toSolarReturn(form);

    if (!parsed.success) {
      setError(parsed.error);
      return;
    }

    setIsSaving(true);
    setError(null);

    const result = solarReturnId
      ? await updateSolarReturnAction({
          clientId,
          solarReturnId,
          form,
        })
      : await createSolarReturnAction({
          clientId,
          form,
        });

    if (!result.success) {
      setError(result.error);
      setIsSaving(false);
      return;
    }

    router.push(`/clients/${clientId}/solar-returns/${result.solarReturnId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <SolarReturnEditor
          value={draft}
          onChange={setDraft}
          onDirty={() => setError(null)}
        />
      </Card>

      {error ? (
        <Alert variant="danger" className="mt-6" role="alert" title={error} />
      ) : null}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          variant="ghost"
          href={cancelHref}
          className={isSaving ? "pointer-events-none opacity-50" : ""}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving
            ? isEdit
              ? "Guardando cambios..."
              : "Guardando..."
            : isEdit
              ? "Guardar cambios"
              : "Guardar Revolución Solar"}
        </Button>
      </div>
    </form>
  );
}
