"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TransitAnalysisEditor } from "@/components/transits/TransitAnalysisEditor";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  createTransitAnalysisAction,
  updateTransitAnalysisAction,
} from "@/lib/transits/actions";
import {
  toTransitAnalysis,
  toTransitAnalysisFormData,
  type TransitAnalysisDraft,
} from "@/lib/transits";

type TransitAnalysisFormProps = {
  clientId: string;
  analysisId?: string;
  initialDraft: TransitAnalysisDraft;
  cancelHref: string;
};

export function TransitAnalysisForm({
  clientId,
  analysisId,
  initialDraft,
  cancelHref,
}: TransitAnalysisFormProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(initialDraft);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isEdit = Boolean(analysisId);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    const form = toTransitAnalysisFormData(draft);
    const parsed = toTransitAnalysis(form);

    if (!parsed.success) {
      setError(parsed.error);
      return;
    }

    setIsSaving(true);
    setError(null);

    const result = analysisId
      ? await updateTransitAnalysisAction({
          clientId,
          analysisId,
          form,
        })
      : await createTransitAnalysisAction({
          clientId,
          form,
        });

    if (!result.success) {
      setError(result.error);
      setIsSaving(false);
      return;
    }

    router.push(`/clients/${clientId}/transits/${result.analysisId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <TransitAnalysisEditor
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
              : "Guardar tránsitos"}
        </Button>
      </div>
    </form>
  );
}
