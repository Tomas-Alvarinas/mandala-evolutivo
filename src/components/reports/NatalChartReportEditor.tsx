"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { updateNatalChartProfessionalReport } from "@/lib/reports/natal-chart/actions";
import {
  NATAL_CHART_REPORT_SECTION_IDS,
  NATAL_CHART_REPORT_SECTION_LABELS,
  type ColorResource,
  type MandalaIntervention,
  type NatalChartReport,
  type NatalChartReportSectionId,
  type ReportSection,
  type SymbolicResource,
} from "@/lib/reports";

type NatalChartReportEditorProps = {
  clientId: string;
  reportId: string;
  report: NatalChartReport;
};

export function NatalChartReportEditor({
  clientId,
  reportId,
  report,
}: NatalChartReportEditorProps) {
  const router = useRouter();
  const detailHref = `/clients/${clientId}/reports/${reportId}`;
  const [draft, setDraft] = useState<NatalChartReport>(report);
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

    const result = await updateNatalChartProfessionalReport({
      clientId,
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
        {NATAL_CHART_REPORT_SECTION_IDS.map((sectionId) => (
          <section
            key={sectionId}
            className="border-t border-border/70 pt-8 first:border-t-0 first:pt-0"
          >
            <h2 className="font-serif text-xl tracking-tight text-foreground">
              {NATAL_CHART_REPORT_SECTION_LABELS[sectionId]}
            </h2>
            <div className="mt-4">
              <SectionEditor
                sectionId={sectionId}
                report={draft}
                onChange={setDraft}
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

function SectionEditor({
  sectionId,
  report,
  onChange,
}: {
  sectionId: NatalChartReportSectionId;
  report: NatalChartReport;
  onChange: (report: NatalChartReport) => void;
}) {
  switch (sectionId) {
    case "beliefsToExplore":
      return (
        <StringListEditor
          items={report.beliefsToExplore}
          itemLabel="Creencia"
          addLabel="Agregar creencia"
          onChange={(beliefsToExplore) =>
            onChange({ ...report, beliefsToExplore })
          }
        />
      );
    case "byronKatieQuestions":
      return (
        <StringListEditor
          items={report.byronKatieQuestions}
          itemLabel="Pregunta"
          addLabel="Agregar pregunta"
          onChange={(byronKatieQuestions) =>
            onChange({ ...report, byronKatieQuestions })
          }
        />
      );
    case "practicalActions":
      return (
        <StringListEditor
          items={report.practicalActions}
          itemLabel="Acción"
          addLabel="Agregar acción"
          onChange={(practicalActions) =>
            onChange({ ...report, practicalActions })
          }
        />
      );
    case "empoweringWords":
      return (
        <StringListEditor
          items={report.empoweringWords}
          itemLabel="Palabra o frase"
          addLabel="Agregar palabra"
          onChange={(empoweringWords) =>
            onChange({ ...report, empoweringWords })
          }
        />
      );
    case "symbolsAndColors":
      return (
        <SymbolsAndColorsEditor
          value={report.symbolsAndColors}
          onChange={(symbolsAndColors) =>
            onChange({ ...report, symbolsAndColors })
          }
        />
      );
    case "mandalaIntervention":
      return (
        <MandalaInterventionEditor
          value={report.mandalaIntervention}
          onChange={(mandalaIntervention) =>
            onChange({ ...report, mandalaIntervention })
          }
        />
      );
    default:
      return (
        <NarrativeSectionEditor
          sectionId={sectionId}
          section={report[sectionId]}
          onChange={(section) => onChange({ ...report, [sectionId]: section })}
        />
      );
  }
}

function NarrativeSectionEditor({
  sectionId,
  section,
  onChange,
}: {
  sectionId: NatalChartReportSectionId;
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
            onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
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

function SymbolsAndColorsEditor({
  value,
  onChange,
}: {
  value: NatalChartReport["symbolsAndColors"];
  onChange: (value: NatalChartReport["symbolsAndColors"]) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-xs font-medium tracking-wide text-muted uppercase">
          Símbolos
        </h3>
        {value.symbols.map((symbol, index) => (
          <SymbolEditor
            key={`symbol-${index}`}
            index={index}
            symbol={symbol}
            canRemove={value.symbols.length > 1}
            onChange={(nextSymbol) => {
              const symbols = [...value.symbols];
              symbols[index] = nextSymbol;
              onChange({ ...value, symbols });
            }}
            onRemove={() =>
              onChange({
                ...value,
                symbols: value.symbols.filter((_, itemIndex) => itemIndex !== index),
              })
            }
          />
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            onChange({
              ...value,
              symbols: [...value.symbols, { symbol: "", meaning: "" }],
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
        {value.colors.map((color, index) => (
          <ColorEditor
            key={`color-${index}`}
            index={index}
            color={color}
            canRemove={value.colors.length > 1}
            onChange={(nextColor) => {
              const colors = [...value.colors];
              colors[index] = nextColor;
              onChange({ ...value, colors });
            }}
            onRemove={() =>
              onChange({
                ...value,
                colors: value.colors.filter((_, itemIndex) => itemIndex !== index),
              })
            }
          />
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            onChange({
              ...value,
              colors: [...value.colors, { color: "", intention: "" }],
            })
          }
        >
          Agregar color
        </Button>
      </div>
    </div>
  );
}

function SymbolEditor({
  index,
  symbol,
  canRemove,
  onChange,
  onRemove,
}: {
  index: number;
  symbol: SymbolicResource;
  canRemove: boolean;
  onChange: (symbol: SymbolicResource) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-3 border-b border-border/70 pb-4 last:border-0 last:pb-0">
      <Input
        id={`symbol-${index}`}
        label={`Símbolo ${index + 1}`}
        value={symbol.symbol}
        onChange={(event) => onChange({ ...symbol, symbol: event.target.value })}
      />
      <Textarea
        id={`symbol-meaning-${index}`}
        label="Significado"
        rows={3}
        value={symbol.meaning}
        onChange={(event) =>
          onChange({ ...symbol, meaning: event.target.value })
        }
      />
      <Button type="button" variant="ghost" disabled={!canRemove} onClick={onRemove}>
        Quitar
      </Button>
    </div>
  );
}

function ColorEditor({
  index,
  color,
  canRemove,
  onChange,
  onRemove,
}: {
  index: number;
  color: ColorResource;
  canRemove: boolean;
  onChange: (color: ColorResource) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-3 border-b border-border/70 pb-4 last:border-0 last:pb-0">
      <Input
        id={`color-${index}`}
        label={`Color ${index + 1}`}
        value={color.color}
        onChange={(event) => onChange({ ...color, color: event.target.value })}
      />
      <Textarea
        id={`color-intention-${index}`}
        label="Intención"
        rows={3}
        value={color.intention}
        onChange={(event) =>
          onChange({ ...color, intention: event.target.value })
        }
      />
      <Button type="button" variant="ghost" disabled={!canRemove} onClick={onRemove}>
        Quitar
      </Button>
    </div>
  );
}

function MandalaInterventionEditor({
  value,
  onChange,
}: {
  value: MandalaIntervention;
  onChange: (value: MandalaIntervention) => void;
}) {
  return (
    <div className="space-y-6">
      <Textarea
        id="mandala-intention"
        label="Intención"
        rows={5}
        value={value.intention}
        onChange={(event) =>
          onChange({ ...value, intention: event.target.value })
        }
      />
      <Textarea
        id="mandala-assignment"
        label="Consigna"
        rows={5}
        value={value.assignment}
        onChange={(event) =>
          onChange({ ...value, assignment: event.target.value })
        }
      />
      <StringListEditor
        items={value.suggestedElements}
        itemLabel="Elemento sugerido"
        addLabel="Agregar elemento"
        onChange={(suggestedElements) =>
          onChange({ ...value, suggestedElements })
        }
      />
      <StringListEditor
        items={value.processQuestions}
        itemLabel="Pregunta de proceso"
        addLabel="Agregar pregunta"
        onChange={(processQuestions) =>
          onChange({ ...value, processQuestions })
        }
      />
    </div>
  );
}
