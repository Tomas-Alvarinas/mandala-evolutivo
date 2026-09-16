import {
  getAspectLabel,
  getAstrologicalBodyLabel,
  getAstrologicalPointLabel,
  getSignLabel,
  type HouseNumber,
  type NatalChart,
} from "@/lib/astrology";
import {
  buildNatalChartEvidence,
  createEvidenceWhitelist,
  formatPositionEvidence,
} from "@/lib/ai/natal-chart/evidence";
import {
  getEclipseTypeLabel,
  getTransitPlanetLabel,
  type TransitAnalysis,
  type TransitAspect,
  type TransitEclipse,
  type TransitPosition,
} from "@/lib/transits";

export { createEvidenceWhitelist };

export function formatTransitPositionEvidence(
  position: TransitPosition,
): string {
  return `${getTransitPlanetLabel(position.planet)} en tránsito en ${getSignLabel(position.sign)} por Casa ${position.natalHouse}`;
}

export function formatTransitAspectEvidence(aspect: TransitAspect): string {
  return `${getTransitPlanetLabel(aspect.transitPlanet)} en tránsito ${getAspectLabel(aspect.aspect).toLowerCase()} ${getAstrologicalPointLabel(aspect.natalPoint)} natal`;
}

export function formatTransitEclipseEvidence(eclipse: TransitEclipse): string {
  const typeLabel = getEclipseTypeLabel(eclipse.eclipseType).toLowerCase();
  return `Eclipse ${typeLabel}: ${getSignLabel(eclipse.signA)} Casa ${eclipse.natalHouseA} ↔ ${getSignLabel(eclipse.signB)} Casa ${eclipse.natalHouseB}`;
}

export function formatNatalBodyInHouseEvidence(
  bodyLabel: string,
  house: HouseNumber,
): string {
  return `${bodyLabel} natal en Casa ${house}`;
}

export function getEclipseActivatedHouses(
  analysis: TransitAnalysis,
): HouseNumber[] {
  const houses = new Set<HouseNumber>();

  for (const eclipse of analysis.eclipses) {
    houses.add(eclipse.natalHouseA);
    houses.add(eclipse.natalHouseB);
  }

  return [...houses].sort((left, right) => left - right);
}

export function getNatalPositionsInHouse(
  natalChart: NatalChart,
  house: HouseNumber,
) {
  return natalChart.positions.filter((position) => position.house === house);
}

export function buildEclipseHouseNatalEvidence(
  natalChart: NatalChart,
  analysis: TransitAnalysis,
): string[] {
  const items: string[] = [];

  for (const house of getEclipseActivatedHouses(analysis)) {
    for (const position of getNatalPositionsInHouse(natalChart, house)) {
      items.push(
        formatNatalBodyInHouseEvidence(
          getAstrologicalBodyLabel(position.point),
          house,
        ),
      );
      items.push(formatPositionEvidence(position));
    }
  }

  return items;
}

export function buildTransitAnalysisEvidence(input: {
  natalChart: NatalChart;
  transitAnalysis: TransitAnalysis;
}): string[] {
  const items = [
    ...buildNatalChartEvidence(input.natalChart),
    ...input.transitAnalysis.positions.map(formatTransitPositionEvidence),
    ...input.transitAnalysis.aspects.map(formatTransitAspectEvidence),
    ...input.transitAnalysis.eclipses.map(formatTransitEclipseEvidence),
    ...buildEclipseHouseNatalEvidence(input.natalChart, input.transitAnalysis),
  ];

  return [...new Set(items)];
}
