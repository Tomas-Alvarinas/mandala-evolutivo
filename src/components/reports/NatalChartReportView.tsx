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
import { Card } from "@/components/ui/Card";
import { cx } from "@/lib/ui/cx";

type NatalChartReportViewProps = {
  report: NatalChartReport;
  variant?: "professional" | "original";
};

export function NatalChartReportView({
  report,
  variant = "professional",
}: NatalChartReportViewProps) {
  const compact = variant === "original";

  return (
    <article className="max-w-2xl">
      <div>
        {NATAL_CHART_REPORT_SECTION_IDS.map((sectionId) => (
          <section
            key={sectionId}
            className={cx(
              "border-t border-border/70 first:border-t-0 first:pt-0",
              compact ? "pt-8" : "pt-10",
            )}
          >
            <h2
              className={cx(
                "font-serif tracking-tight text-foreground",
                compact ? "text-xl" : "text-2xl",
              )}
            >
              {NATAL_CHART_REPORT_SECTION_LABELS[sectionId]}
            </h2>
            <div className={compact ? "mt-3" : "mt-4"}>
              <SectionBody sectionId={sectionId} report={report} />
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}

function SectionBody({
  sectionId,
  report,
}: {
  sectionId: NatalChartReportSectionId;
  report: NatalChartReport;
}) {
  switch (sectionId) {
    case "beliefsToExplore":
      return <StringList items={report.beliefsToExplore} />;
    case "byronKatieQuestions":
      return <StringList items={report.byronKatieQuestions} />;
    case "practicalActions":
      return <StringList items={report.practicalActions} />;
    case "empoweringWords":
      return <StringList items={report.empoweringWords} />;
    case "symbolsAndColors":
      return <SymbolsAndColorsBody value={report.symbolsAndColors} />;
    case "mandalaIntervention":
      return <MandalaInterventionBody value={report.mandalaIntervention} />;
    default:
      return <NarrativeBody section={report[sectionId]} />;
  }
}

function NarrativeBody({ section }: { section: ReportSection }) {
  return (
    <div>
      <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
        {section.content}
      </p>
      {section.astrologicalBasis.length > 0 ? (
        <div className="mt-6 rounded-xl bg-surface-subtle px-4 py-3">
          <h3 className="text-xs font-medium tracking-wide text-muted uppercase">
            Base astrológica
          </h3>
          <ul className="mt-2 space-y-1 text-sm leading-relaxed text-muted">
            {section.astrologicalBasis.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function StringList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">Sin elementos.</p>;
  }

  return (
    <ul className="list-disc space-y-2.5 pl-5 text-base leading-relaxed text-foreground">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

function SymbolsAndColorsBody({
  value,
}: {
  value: NatalChartReport["symbolsAndColors"];
}) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xs font-medium tracking-wide text-muted uppercase">
          Símbolos
        </h3>
        <ul className="mt-3 space-y-4">
          {value.symbols.map((symbol) => (
            <SymbolItem
              key={`${symbol.symbol}-${symbol.meaning}`}
              symbol={symbol}
            />
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-xs font-medium tracking-wide text-muted uppercase">
          Colores
        </h3>
        <ul className="mt-3 space-y-4">
          {value.colors.map((color) => (
            <ColorItem
              key={`${color.color}-${color.intention}`}
              color={color}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

function SymbolItem({ symbol }: { symbol: SymbolicResource }) {
  return (
    <li className="text-base leading-relaxed">
      <p className="font-medium text-foreground">{symbol.symbol}</p>
      <p className="mt-1 text-muted">{symbol.meaning}</p>
    </li>
  );
}

function ColorItem({ color }: { color: ColorResource }) {
  return (
    <li className="text-base leading-relaxed">
      <p className="font-medium text-foreground">{color.color}</p>
      <p className="mt-1 text-muted">{color.intention}</p>
    </li>
  );
}

function MandalaInterventionBody({
  value,
}: {
  value: MandalaIntervention;
}) {
  return (
    <Card variant="subtle" padding="default">
      <div className="space-y-5 text-base leading-relaxed">
        <div>
          <h3 className="text-xs font-medium tracking-wide text-muted uppercase">
            Intención
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-foreground">
            {value.intention}
          </p>
        </div>
        <div>
          <h3 className="text-xs font-medium tracking-wide text-muted uppercase">
            Consigna
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-foreground">
            {value.assignment}
          </p>
        </div>
        <div>
          <h3 className="text-xs font-medium tracking-wide text-muted uppercase">
            Elementos sugeridos
          </h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-foreground">
            {value.suggestedElements.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-medium tracking-wide text-muted uppercase">
            Preguntas de proceso
          </h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-foreground">
            {value.processQuestions.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

