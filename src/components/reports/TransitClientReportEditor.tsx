"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { updateTransitClientReport } from "@/lib/reports/transits/client-report/actions";
import {
  TRANSIT_ANALYSIS_REPORT_SECTION_IDS,
  TRANSIT_ANALYSIS_REPORT_SECTION_LABELS,
  type TransitClientReport,
} from "@/lib/reports";

type TransitClientReportEditorProps = {
  clientId: string;
  transitAnalysisId: string;
  reportId: string;
  report: TransitClientReport;
};

export function TransitClientReportEditor({
  clientId,
  transitAnalysisId,
  reportId,
  report,
}: TransitClientReportEditorProps) {
  const router = useRouter();
  const viewHref = `/clients/${clientId}/transits/${transitAnalysisId}/reports/${reportId}/client`;
  const [draft, setDraft] = useState<TransitClientReport>(report);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isDirty = JSON.stringify(draft) !== JSON.stringify(report);

  useEffect(() => {
    if (!isDirty || isSaving) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty, isSaving]);

  function handleCancel() {
    if (
      isDirty &&
      !window.confirm("Hay cambios sin guardar. ¿Salir sin guardar?")
    ) {
      return;
    }

    router.push(viewHref);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setError(null);

    const result = await updateTransitClientReport({
      clientId,
      transitAnalysisId,
      professionalReportId: reportId,
      clientReport: draft,
    });

    if (!result.success) {
      setError(result.error);
      setIsSaving(false);
      return;
    }

    router.push(viewHref);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl pb-28">
      <fieldset disabled={isSaving} className="min-w-0">
        {TRANSIT_ANALYSIS_REPORT_SECTION_IDS.map((sectionId) => (
          <section
            key={sectionId}
            className="border-t border-border/70 pt-8 first:border-t-0 first:pt-0"
          >
            <h2 className="font-serif text-xl tracking-tight text-foreground">
              {TRANSIT_ANALYSIS_REPORT_SECTION_LABELS[sectionId]}
            </h2>
            <div className="mt-4">
              <Textarea
                id={`${sectionId}-content`}
                label="Texto"
                rows={10}
                value={draft[sectionId].content}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    [sectionId]: { content: event.target.value },
                  })
                }
              />
            </div>
          </section>
        ))}
      </fieldset>

      {error ? (
        <Alert variant="danger" className="mt-6" role="alert" title={error} />
      ) : null}

      <div className="sticky bottom-0 z-10 mt-10 border-t border-border bg-background/95 py-4 backdrop-blur-sm">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            disabled={isSaving}
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </div>
    </form>
  );
}
