import { Card } from "@/components/ui/Card";
import {
  getClientReportWebPresentation,
  type NatalChartClientReport,
  type NatalChartClientSection,
} from "@/lib/reports/natal-chart/client-report";

type NatalChartClientReportViewProps = {
  report: NatalChartClientReport;
};

export function NatalChartClientReportView({
  report,
}: NatalChartClientReportViewProps) {
  const presentation = getClientReportWebPresentation(report);
  const showIntroduction =
    !presentation.hideIntroduction && report.introduction.content.trim() !== "";
  const showClosing =
    !presentation.hideClosing && report.closing.content.trim() !== "";

  return (
    <article className="max-w-2xl">
      <header>
        <p className="text-xs font-medium tracking-wide text-muted uppercase">
          {report.cover.subtitle}
        </p>
        <p className="mt-3 font-serif text-3xl tracking-tight text-foreground">
          {report.cover.title}
        </p>
        <p className="mt-2 text-muted">{report.cover.clientName}</p>
      </header>

      {showIntroduction ? (
        <section className="mt-10">
          <h2 className="font-serif text-2xl tracking-tight text-foreground">
            Introducción
          </h2>
          <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-foreground">
            {report.introduction.content}
          </p>
        </section>
      ) : null}

      {report.sections.map((section, index) => (
        <section
          key={`${section.sourceSectionId}-${index}`}
          className="mt-10 border-t border-border/70 pt-10 first:border-t-0"
        >
          <h2 className="font-serif text-2xl tracking-tight text-foreground">
            {section.title}
          </h2>
          <div className="mt-4">
            <SectionBody section={section} />
          </div>
        </section>
      ))}

      {showClosing ? (
        <section className="mt-10 border-t border-border/70 pt-10">
          <h2 className="font-serif text-2xl tracking-tight text-foreground">
            Cierre
          </h2>
          <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-foreground">
            {report.closing.content}
          </p>
        </section>
      ) : null}
    </article>
  );
}

function SectionBody({ section }: { section: NatalChartClientSection }) {
  switch (section.kind) {
    case "narrative":
      return (
        <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
          {section.content}
        </p>
      );
    case "list":
      return (
        <ul className="list-disc space-y-2.5 pl-5 text-base leading-relaxed text-foreground">
          {section.items.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      );
    case "symbolsAndColors":
      return (
        <div className="space-y-8">
          <div>
            <h3 className="text-xs font-medium tracking-wide text-muted uppercase">
              Símbolos
            </h3>
            <ul className="mt-3 space-y-4">
              {section.symbols.map((item, index) => (
                <li key={`${item.symbol}-${index}`} className="text-base">
                  <p className="font-medium text-foreground">{item.symbol}</p>
                  <p className="mt-1 text-muted">{item.meaning}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-medium tracking-wide text-muted uppercase">
              Colores
            </h3>
            <ul className="mt-3 space-y-4">
              {section.colors.map((item, index) => (
                <li key={`${item.color}-${index}`} className="text-base">
                  <p className="font-medium text-foreground">{item.color}</p>
                  <p className="mt-1 text-muted">{item.intention}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    case "mandala":
      return (
        <Card variant="subtle" padding="default">
          <div className="space-y-5 text-base leading-relaxed">
            <div>
              <h3 className="text-xs font-medium tracking-wide text-muted uppercase">
                Intención
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-foreground">
                {section.intention}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-medium tracking-wide text-muted uppercase">
                Consigna
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-foreground">
                {section.assignment}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-medium tracking-wide text-muted uppercase">
                Elementos
              </h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-foreground">
                {section.elements.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-medium tracking-wide text-muted uppercase">
                Preguntas
              </h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-foreground">
                {section.questions.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      );
  }
}
