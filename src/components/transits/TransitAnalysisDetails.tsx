import type { ReactNode } from "react";
import {
  formatTransitAspect,
  formatTransitEclipse,
  formatTransitPosition,
  type TransitAnalysis,
} from "@/lib/transits";

type TransitAnalysisDetailsProps = {
  analysis: TransitAnalysis;
};

export function TransitAnalysisDetails({
  analysis,
}: TransitAnalysisDetailsProps) {
  return (
    <div className="space-y-8">
      <DetailSubsection title="Tránsitos">
        {analysis.positions.length === 0 ? (
          <EmptyNote>Sin tránsitos cargados.</EmptyNote>
        ) : (
          <ul>
            {analysis.positions.map((position, index) => (
              <DetailRow
                key={`${position.planet}-${position.sign}-${position.natalHouse}-${index}`}
              >
                {formatTransitPosition(position)}
              </DetailRow>
            ))}
          </ul>
        )}
      </DetailSubsection>

      <DetailSubsection title="Aspectos">
        {analysis.aspects.length === 0 ? (
          <EmptyNote>Sin aspectos cargados.</EmptyNote>
        ) : (
          <ul>
            {analysis.aspects.map((aspect, index) => (
              <DetailRow
                key={`${aspect.transitPlanet}-${aspect.aspect}-${aspect.natalPoint}-${index}`}
              >
                {formatTransitAspect(aspect)}
              </DetailRow>
            ))}
          </ul>
        )}
      </DetailSubsection>

      <DetailSubsection title="Eclipses">
        {analysis.eclipses.length === 0 ? (
          <EmptyNote>Sin eclipses cargados.</EmptyNote>
        ) : (
          <ul>
            {analysis.eclipses.map((eclipse, index) => (
              <DetailRow
                key={`${eclipse.eclipseType}-${eclipse.signA}-${eclipse.natalHouseA}-${eclipse.signB}-${eclipse.natalHouseB}-${index}`}
              >
                {formatTransitEclipse(eclipse)}
              </DetailRow>
            ))}
          </ul>
        )}
      </DetailSubsection>
    </div>
  );
}

function DetailSubsection({
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

function EmptyNote({ children }: { children: string }) {
  return <p className="text-sm text-muted">{children}</p>;
}

function DetailRow({ children }: { children: string }) {
  return (
    <li className="border-b border-border/70 py-2.5 text-sm last:border-0">
      {children}
    </li>
  );
}
