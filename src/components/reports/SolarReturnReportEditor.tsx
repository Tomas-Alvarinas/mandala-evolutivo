"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { updateSolarReturnProfessionalReport } from "@/lib/reports/solar-returns/actions";
import {
  SOLAR_RETURN_REPORT_SECTION_IDS,
  SOLAR_RETURN_REPORT_SECTION_LABELS,
  type SolarReturnReport,
  type SolarReturnReportSectionId,
} from "@/lib/reports";
import type { ReportSection } from "@/lib/reports/natal-chart/types";

type SolarReturnReportEditorProps = {
  clientId: string;
  solarReturnId: string;
  reportId: string;
  report: SolarReturnReport;
};

export function SolarReturnReportEditor({
  clientId,
  solarReturnId,
  reportId,
  report,
}: SolarReturnReportEditorProps) {
  const router = useRouter();
  const detailHref = `/clients/${clientId}/solar-returns/${solarReturnId}/reports/${reportId}`;
  const [draft, setDraft] = useState<SolarReturnReport>(report);
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

    router.push(detailHref);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setError(null);

    const result = await updateSolarReturnProfessionalReport({
      clientId,
      solarReturnId,
      reportId,
      report: draft,
    });

    if (!result.success) {
      setError(result.error);
      setIsSaving(false);
      return;
    }

    router.push(detailHref);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl pb-28">
      <fieldset disabled={isSaving} className="min-w-0">
        {SOLAR_RETURN_REPORT_SECTION_IDS.map((sectionId) => (
          <section
            key={sectionId}
            className="border-t border-border/70 pt-8 first:border-t-0 first:pt-0"
          >
            <h2 className="font-serif text-xl tracking-tight text-foreground">
              {SOLAR_RETURN_REPORT_SECTION_LABELS[sectionId]}
            </h2>
            <div className="mt-4">
              <NarrativeSectionEditor
                sectionId={sectionId}
                section={draft[sectionId]}
                onChange={(section) =>
                  setDraft({ ...draft, [sectionId]: section })
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

function NarrativeSectionEditor({
  sectionId,
  section,
  onChange,
}: {
  sectionId: SolarReturnReportSectionId;
  section: ReportSection;
  onChange: (section: ReportSection) => void;
}) {
  return (
    <div>
      <Textarea
        id={`${sectionId}-content`}
        label="Texto profesional"
        rows={10}
        value={section.content}
        onChange={(event) =>
          onChange({ ...section, content: event.target.value })
        }
      />
      <AstrologicalBasisReadOnly items={section.astrologicalBasis} />
    </div>
  );
}

function AstrologicalBasisReadOnly({ items }: { items: string[] }) {
  return (
    <div className="mt-5 rounded-xl bg-surface-subtle px-4 py-3">
      <h3 className="text-xs font-medium tracking-wide text-muted uppercase">
        Base astrológica
      </h3>
      <p className="mt-1 text-xs text-muted">Solo lectura. No se edita.</p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Sin referencias astrológicas.</p>
      ) : (
        <ul className="mt-2 space-y-1 text-sm text-muted">
          {items.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
