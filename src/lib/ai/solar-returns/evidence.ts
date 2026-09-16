import {
  getAspectLabel,
  getAstrologicalBodyLabel,
  getAstrologicalPointLabel,
  getSignLabel,
  type NatalChart,
} from "@/lib/astrology";
import {
  buildNatalChartEvidence,
  createEvidenceWhitelist,
} from "@/lib/ai/natal-chart/evidence";
import {
  SOLAR_RETURN_POINT_IDS,
  getSolarReturnPointLabel,
  type SolarReturn,
  type SolarReturnAspect,
  type SolarReturnNatalAspect,
  type SolarReturnPosition,
} from "@/lib/solar-returns";

export { createEvidenceWhitelist };

export const EXPECTED_SOLAR_RETURN_POSITION_COUNT = SOLAR_RETURN_POINT_IDS.length;

const ELEMENT_LABELS = {
  fire: "Fuego",
  earth: "Tierra",
  air: "Aire",
  water: "Agua",
} as const;

export function formatSolarReturnPositionEvidence(
  position: SolarReturnPosition,
): string {
  const name = getSolarReturnPointLabel(position.point);
  const sign = getSignLabel(position.sign);
  const natalHouse = `Casa natal ${position.natalOverlayHouse}`;

  if (position.solarReturnHouse === null) {
    return `${name} RS en ${sign} — ${natalHouse}`;
  }

  return `${name} RS en ${sign} — Casa RS ${position.solarReturnHouse} — ${natalHouse}`;
}

export function formatSolarReturnAspectEvidence(
  aspect: SolarReturnAspect,
): string {
  return `${getSolarReturnPointLabel(aspect.pointA)} RS ${getAspectLabel(aspect.aspect).toLowerCase()} ${getSolarReturnPointLabel(aspect.pointB)} RS`;
}

export function formatSolarReturnNatalContactEvidence(
  contact: SolarReturnNatalAspect,
): string {
  return `${getSolarReturnPointLabel(contact.solarReturnPoint)} RS ${getAspectLabel(contact.aspect).toLowerCase()} ${getAstrologicalPointLabel(contact.natalPoint)} natal`;
}

export function formatSolarReturnElementEvidence(
  element: keyof typeof ELEMENT_LABELS,
  count: number,
): string {
  return `${ELEMENT_LABELS[element]}: ${count}`;
}

export function formatSolarReturnAscendantRulerEvidence(
  rulerLabel: string,
): string {
  return `Regente del Ascendente RS: ${rulerLabel}`;
}

export function getSolarReturnAscendant(
  solarReturn: SolarReturn,
): SolarReturnPosition | null {
  return (
    solarReturn.positions.find((position) => position.point === "ascendant") ??
    null
  );
}

export function getSolarReturnMidheaven(
  solarReturn: SolarReturn,
): SolarReturnPosition | null {
  return (
    solarReturn.positions.find((position) => position.point === "midheaven") ??
    null
  );
}

export function getSolarReturnRulerLabel(solarReturn: SolarReturn): string {
  return getAstrologicalBodyLabel(solarReturn.ascendantRuler);
}

export function getSolarReturnRulerPosition(
  solarReturn: SolarReturn,
): SolarReturnPosition | null {
  return (
    solarReturn.positions.find(
      (position) => position.point === solarReturn.ascendantRuler,
    ) ?? null
  );
}

export function buildSolarReturnEvidence(input: {
  natalChart: NatalChart;
  solarReturn: SolarReturn;
}): string[] {
  const rulerLabel = getSolarReturnRulerLabel(input.solarReturn);
  const items = [
    ...buildNatalChartEvidence(input.natalChart),
    ...input.solarReturn.positions.map(formatSolarReturnPositionEvidence),
    formatSolarReturnAscendantRulerEvidence(rulerLabel),
    ...input.solarReturn.aspects.map(formatSolarReturnAspectEvidence),
    ...input.solarReturn.natalContacts.map(formatSolarReturnNatalContactEvidence),
    formatSolarReturnElementEvidence("fire", input.solarReturn.elementSummary.fire),
    formatSolarReturnElementEvidence(
      "earth",
      input.solarReturn.elementSummary.earth,
    ),
    formatSolarReturnElementEvidence("air", input.solarReturn.elementSummary.air),
    formatSolarReturnElementEvidence(
      "water",
      input.solarReturn.elementSummary.water,
    ),
  ];

  return [...new Set(items)];
}

export function isNatalOnlyNodeEvidence(value: string): boolean {
  return /\bNodo (Norte|Sur) natal\b/.test(value);
}

export function mentionsSolarReturnNode(value: string): boolean {
  return /\bNodo (Norte|Sur) RS\b/.test(value);
}
