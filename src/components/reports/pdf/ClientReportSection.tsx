import type {
  NatalChartClientListSection,
  NatalChartClientSection,
  NatalChartClientSymbolsSection,
} from "@/lib/reports/natal-chart/client-report";
import { ClientReportMandala } from "./ClientReportMandala";

type ClientReportSectionProps = {
  section: NatalChartClientSection;
};

export function ClientReportSection({ section }: ClientReportSectionProps) {
  const isMandala = section.kind === "mandala";
  const sectionClass = ["section", isMandala ? "section-mandala" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={sectionClass}>
      <div className="heading-block">
        <h2 className="section-title">{section.title}</h2>
      </div>
      <SectionBody section={section} />
    </section>
  );
}

function SectionBody({ section }: { section: NatalChartClientSection }) {
  switch (section.kind) {
    case "narrative":
      return <p className="prose">{section.content}</p>;
    case "list":
      return <ListBody section={section} />;
    case "symbolsAndColors":
      return <SymbolsBody section={section} />;
    case "mandala":
      return <ClientReportMandala section={section} />;
  }
}

const SHORT_LIST_ITEM_LIMIT = 6;
const SHORT_LIST_CHAR_LIMIT = 900;

function shouldKeepListTogether(items: string[]) {
  if (items.length > SHORT_LIST_ITEM_LIMIT) {
    return false;
  }

  return items.join("").length <= SHORT_LIST_CHAR_LIMIT;
}

function listBlockClass(items: string[]) {
  return shouldKeepListTogether(items)
    ? "list-block"
    : "list-block list-block-allow-break";
}

function ListBody({ section }: { section: NatalChartClientListSection }) {
  const blockClass = listBlockClass(section.items);

  if (section.sourceSectionId === "empoweringWords") {
    return (
      <ul className={`word-list ${blockClass}`}>
        {section.items.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    );
  }

  if (section.sourceSectionId === "practicalActions") {
    return (
      <div className={blockClass}>
        <ol className="list list-numbered">
          {section.items.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ol>
      </div>
    );
  }

  const isQuestions = section.sourceSectionId === "byronKatieQuestions";

  return (
    <div className={blockClass}>
      <ul className={isQuestions ? "list list-questions" : "list"}>
        {section.items.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function SymbolsBody({ section }: { section: NatalChartClientSymbolsSection }) {
  const itemCount = section.symbols.length + section.colors.length;
  const keepTogether = itemCount <= 6;

  return (
    <div className={keepTogether ? "list-block" : undefined}>
      <div className="group">
        <h3 className="group-label">Símbolos</h3>
        {section.symbols.map((item, index) => (
          <article
            key={`${item.symbol}-${index}`}
            className="resource-item"
          >
            <p className="resource-name">{item.symbol}</p>
            <p className="resource-meaning">{item.meaning}</p>
          </article>
        ))}
      </div>
      <div className="group">
        <h3 className="group-label">Colores</h3>
        {section.colors.map((item, index) => (
          <article key={`${item.color}-${index}`} className="resource-item">
            <p className="resource-name">{item.color}</p>
            <p className="resource-meaning">{item.intention}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
