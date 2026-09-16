import type { ReactNode } from "react";
import {
  formatConfigurationParticipantLabels,
  getAngleLabel,
  getAspectLabel,
  getAstrologicalBodyLabel,
  getAstrologicalPointLabel,
  getConfigurationLabel,
  getHouseLabel,
  getSignLabel,
  type NatalChart,
} from "@/lib/astrology";

type NatalChartDetailsProps = {
  chart: NatalChart;
  showTitle?: boolean;
};

export function NatalChartDetails({
  chart,
  showTitle = true,
}: NatalChartDetailsProps) {
  const houseRulers = chart.houseRulers ?? [];

  return (
    <div>
      {showTitle ? (
        <h2 className="font-serif text-xl tracking-tight text-foreground">
          Carta Natal
        </h2>
      ) : null}

      <div className={showTitle ? "mt-8 space-y-8" : "space-y-8"}>
        <ChartSubsection title="Posiciones">
          <ul>
            {chart.positions.map((position) => (
              <ScanRow
                key={position.point}
                primary={getAstrologicalBodyLabel(position.point)}
                secondary={getSignLabel(position.sign)}
                tertiary={getHouseLabel(position.house)}
              />
            ))}
          </ul>
        </ChartSubsection>

        <ChartSubsection title="Ángulos">
          <ul>
            <ScanRow
              primary={getAngleLabel("ascendant")}
              secondary={getSignLabel(chart.ascendant)}
            />
            <ScanRow
              primary={getAngleLabel("midheaven")}
              secondary={getSignLabel(chart.midheaven)}
            />
          </ul>
        </ChartSubsection>

        <ChartSubsection title="Aspectos">
          {chart.aspects.length === 0 ? (
            <EmptyChartNote>Sin aspectos cargados.</EmptyChartNote>
          ) : (
            <ul>
              {chart.aspects.map((aspect, index) => (
                <li
                  key={`${aspect.pointA}-${aspect.aspect}-${aspect.pointB}-${index}`}
                  className="border-b border-border/70 py-2.5 text-sm last:border-0"
                >
                  {getAstrologicalPointLabel(aspect.pointA)} —{" "}
                  {getAspectLabel(aspect.aspect)} —{" "}
                  {getAstrologicalPointLabel(aspect.pointB)}
                </li>
              ))}
            </ul>
          )}
        </ChartSubsection>

        <ChartSubsection title="Regentes">
          {houseRulers.length === 0 ? (
            <EmptyChartNote>Sin regentes cargados.</EmptyChartNote>
          ) : (
            <ul>
              {houseRulers.map((ruler) => (
                <ScanRow
                  key={ruler.house}
                  primary={getHouseLabel(ruler.house)}
                  secondary={`${getAstrologicalBodyLabel(ruler.planet)} en ${getSignLabel(ruler.sign)}`}
                />
              ))}
            </ul>
          )}
        </ChartSubsection>

        <ChartSubsection title="Configuraciones">
          {chart.configurations.length === 0 ? (
            <EmptyChartNote>Sin configuraciones cargadas.</EmptyChartNote>
          ) : (
            <ul>
              {chart.configurations.map((configuration) => (
                <li
                  key={configuration.type}
                  className="border-b border-border/70 py-2.5 last:border-0"
                >
                  <p className="text-sm font-medium text-foreground">
                    {getConfigurationLabel(configuration.type)}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    {formatConfigurationParticipantLabels(
                      configuration.points,
                      " · ",
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </ChartSubsection>
      </div>
    </div>
  );
}

function ChartSubsection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="text-xs font-medium tracking-wide text-muted uppercase">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function EmptyChartNote({ children }: { children: string }) {
  return <p className="text-sm text-muted">{children}</p>;
}

function ScanRow({
  primary,
  secondary,
  tertiary,
}: {
  primary: string;
  secondary: string;
  tertiary?: string;
}) {
  return (
    <li className="border-b border-border/70 py-2.5 last:border-0">
      <div className="sm:hidden">
        <p className="text-sm font-medium text-foreground">{primary}</p>
        <p className="mt-0.5 text-sm text-muted">
          {tertiary ? `${secondary} · ${tertiary}` : secondary}
        </p>
      </div>
      <div
        className={
          tertiary
            ? "hidden sm:grid sm:grid-cols-[minmax(8rem,1.1fr)_minmax(8rem,1fr)_minmax(6rem,0.9fr)] sm:items-baseline sm:gap-4"
            : "hidden sm:grid sm:grid-cols-[minmax(8rem,1.1fr)_minmax(8rem,1fr)] sm:items-baseline sm:gap-4"
        }
      >
        <span className="text-sm font-medium text-foreground">{primary}</span>
        <span className="text-sm text-foreground">{secondary}</span>
        {tertiary ? (
          <span className="text-sm text-muted">{tertiary}</span>
        ) : null}
      </div>
    </li>
  );
}
