"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { updateNatalChartClientReport } from "@/lib/reports/natal-chart/client-report/actions";
import type {
  NatalChartClientReport,
  NatalChartClientSection,
} from "@/lib/reports/natal-chart/client-report";

type NatalChartClientReportEditorProps = {
  clientId: string;
  reportId: string;
  report: NatalChartClientReport;
};

export function NatalChartClientReportEditor({
  clientId,
  reportId,
  report,
}: NatalChartClientReportEditorProps) {
  const router = useRouter();
  const viewHref = `/clients/${clientId}/reports/${reportId}/client`;
  const [draft, setDraft] = useState<NatalChartClientReport>(report);
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

    const result = await updateNatalChartClientReport({
      clientId,
      reportId,
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

  function updateSection(
    index: number,
    section: NatalChartClientSection,
  ) {
    const sections = [...draft.sections];
    sections[index] = section;
    setDraft({ ...draft, sections });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl pb-28">
      <fieldset disabled={isSaving} className="min-w-0">
        <section>
          <h2 className="font-serif text-xl tracking-tight text-foreground">
            Portada
          </h2>
          <div className="mt-4 space-y-4">
            <Input
              id="cover-title"
              label="Título"
              value={draft.cover.title}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  cover: { ...draft.cover, title: event.target.value },
                })
              }
            />
            <Input
              id="cover-subtitle"
              label="Subtítulo"
              value={draft.cover.subtitle}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  cover: { ...draft.cover, subtitle: event.target.value },
                })
              }
            />
            <Input
              id="cover-client-name"
              label="Nombre"
              value={draft.cover.clientName}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  cover: { ...draft.cover, clientName: event.target.value },
                })
              }
            />
          </div>
        </section>

        <section className="mt-8 border-t border-border/70 pt-8">
          <Textarea
            id="introduction"
            label="Introducción"
            rows={8}
            value={draft.introduction.content}
            onChange={(event) =>
              setDraft({
                ...draft,
                introduction: { content: event.target.value },
              })
            }
          />
        </section>

        {draft.sections.map((section, index) => (
          <section
            key={`${section.sourceSectionId}-${index}`}
            className="mt-8 border-t border-border/70 pt-8"
          >
            <SectionEditor
              index={index}
              section={section}
              onChange={(next) => updateSection(index, next)}
            />
          </section>
        ))}

        <section className="mt-8 border-t border-border/70 pt-8">
          <Textarea
            id="closing"
            label="Cierre"
            rows={8}
            value={draft.closing.content}
            onChange={(event) =>
              setDraft({
                ...draft,
                closing: { content: event.target.value },
              })
            }
          />
        </section>
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

function SectionEditor({
  index,
  section,
  onChange,
}: {
  index: number;
  section: NatalChartClientSection;
  onChange: (section: NatalChartClientSection) => void;
}) {
  return (
    <div className="space-y-4">
      <Input
        id={`section-title-${index}`}
        label="Título"
        value={section.title}
        onChange={(event) => onChange({ ...section, title: event.target.value })}
      />
      {section.kind === "narrative" ? (
        <Textarea
          id={`section-content-${index}`}
          label="Contenido"
          rows={8}
          value={section.content}
          onChange={(event) =>
            onChange({ ...section, content: event.target.value })
          }
        />
      ) : null}
      {section.kind === "list" ? (
        <StringListEditor
          items={section.items}
          itemLabel="Ítem"
          addLabel="Agregar ítem"
          onChange={(items) => onChange({ ...section, items })}
        />
      ) : null}
      {section.kind === "symbolsAndColors" ? (
        <SymbolsEditor
          section={section}
          onChange={onChange}
        />
      ) : null}
      {section.kind === "mandala" ? (
        <MandalaEditor section={section} onChange={onChange} />
      ) : null}
    </div>
  );
}

function StringListEditor({
  items,
  itemLabel,
  addLabel,
  onChange,
}: {
  items: string[];
  itemLabel: string;
  addLabel: string;
  onChange: (items: string[]) => void;
}) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={`${itemLabel}-${index}`} className="space-y-2">
          <Textarea
            id={`${itemLabel}-${index}`}
            label={`${itemLabel} ${index + 1}`}
            rows={3}
            value={item}
            onChange={(event) => {
              const next = [...items];
              next[index] = event.target.value;
              onChange(next);
            }}
          />
          <Button
            type="button"
            variant="ghost"
            disabled={items.length <= 1}
            onClick={() =>
              onChange(items.filter((_, itemIndex) => itemIndex !== index))
            }
          >
            Quitar
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        onClick={() => onChange([...items, ""])}
      >
        {addLabel}
      </Button>
    </div>
  );
}

function SymbolsEditor({
  section,
  onChange,
}: {
  section: Extract<NatalChartClientSection, { kind: "symbolsAndColors" }>;
  onChange: (section: NatalChartClientSection) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-xs font-medium tracking-wide text-muted uppercase">
          Símbolos
        </h3>
        {section.symbols.map((item, index) => (
          <div
            key={`symbol-${index}`}
            className="space-y-3 border-b border-border/70 pb-4 last:border-0 last:pb-0"
          >
            <Input
              id={`symbol-${index}`}
              label={`Símbolo ${index + 1}`}
              value={item.symbol}
              onChange={(event) => {
                const symbols = [...section.symbols];
                symbols[index] = { ...item, symbol: event.target.value };
                onChange({ ...section, symbols });
              }}
            />
            <Textarea
              id={`symbol-meaning-${index}`}
              label="Significado"
              rows={3}
              value={item.meaning}
              onChange={(event) => {
                const symbols = [...section.symbols];
                symbols[index] = { ...item, meaning: event.target.value };
                onChange({ ...section, symbols });
              }}
            />
            <Button
              type="button"
              variant="ghost"
              disabled={section.symbols.length <= 1}
              onClick={() =>
                onChange({
                  ...section,
                  symbols: section.symbols.filter((_, itemIndex) => itemIndex !== index),
                })
              }
            >
              Quitar
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            onChange({
              ...section,
              symbols: [...section.symbols, { symbol: "", meaning: "" }],
            })
          }
        >
          Agregar símbolo
        </Button>
      </div>
      <div className="space-y-4">
        <h3 className="text-xs font-medium tracking-wide text-muted uppercase">
          Colores
        </h3>
        {section.colors.map((item, index) => (
          <div
            key={`color-${index}`}
            className="space-y-3 border-b border-border/70 pb-4 last:border-0 last:pb-0"
          >
            <Input
              id={`color-${index}`}
              label={`Color ${index + 1}`}
              value={item.color}
              onChange={(event) => {
                const colors = [...section.colors];
                colors[index] = { ...item, color: event.target.value };
                onChange({ ...section, colors });
              }}
            />
            <Textarea
              id={`color-intention-${index}`}
              label="Intención"
              rows={3}
              value={item.intention}
              onChange={(event) => {
                const colors = [...section.colors];
                colors[index] = { ...item, intention: event.target.value };
                onChange({ ...section, colors });
              }}
            />
            <Button
              type="button"
              variant="ghost"
              disabled={section.colors.length <= 1}
              onClick={() =>
                onChange({
                  ...section,
                  colors: section.colors.filter((_, itemIndex) => itemIndex !== index),
                })
              }
            >
              Quitar
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            onChange({
              ...section,
              colors: [...section.colors, { color: "", intention: "" }],
            })
          }
        >
          Agregar color
        </Button>
      </div>
    </div>
  );
}

function MandalaEditor({
  section,
  onChange,
}: {
  section: Extract<NatalChartClientSection, { kind: "mandala" }>;
  onChange: (section: NatalChartClientSection) => void;
}) {
  return (
    <div className="space-y-4">
      <Textarea
        id="mandala-intention"
        label="Intención"
        rows={4}
        value={section.intention}
        onChange={(event) =>
          onChange({ ...section, intention: event.target.value })
        }
      />
      <Textarea
        id="mandala-assignment"
        label="Consigna"
        rows={4}
        value={section.assignment}
        onChange={(event) =>
          onChange({ ...section, assignment: event.target.value })
        }
      />
      <StringListEditor
        items={section.elements}
        itemLabel="Elemento"
        addLabel="Agregar elemento"
        onChange={(elements) => onChange({ ...section, elements })}
      />
      <StringListEditor
        items={section.questions}
        itemLabel="Pregunta"
        addLabel="Agregar pregunta"
        onChange={(questions) => onChange({ ...section, questions })}
      />
    </div>
  );
}
