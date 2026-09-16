import type { NatalChartClientMandalaSection } from "@/lib/reports/natal-chart/client-report";

type ClientReportMandalaProps = {
  section: NatalChartClientMandalaSection;
};

export function ClientReportMandala({ section }: ClientReportMandalaProps) {
  return (
    <div className="mandala">
      <div className="mandala-block">
        <h3 className="mandala-label">Intención</h3>
        <p className="prose">{section.intention}</p>
      </div>
      <div className="mandala-block">
        <h3 className="mandala-label">Consigna</h3>
        <p className="prose">{section.assignment}</p>
      </div>
      <div className="mandala-block">
        <h3 className="mandala-label">Elementos sugeridos</h3>
        <ul className="list">
          {section.elements.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="mandala-block">
        <h3 className="mandala-label">Preguntas de proceso</h3>
        <ul className="list list-questions">
          {section.questions.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
