import {
  ANGLES,
  ASPECTS,
  ASTROLOGICAL_BODIES,
  CHART_CONFIGURATIONS,
  CHART_POINTS,
  CONFIGURATION_POINT_RULES,
  RULER_PLANETS,
  SIGN_RULERS,
  ZODIAC_SIGNS,
  type AngleId,
  type AspectId,
  type AstrologicalBodyId,
  type ChartPointId,
  type ConfigurationId,
  type HouseNumber,
  type RulerPlanetId,
  type ZodiacSignId,
} from "./constants";
import type { HouseRuler } from "./types";

function getLabel<T extends { readonly id: string; readonly label: string }>(
  items: readonly T[],
  id: T["id"],
): T["label"] {
  const item = items.find((entry) => entry.id === id);

  if (!item) {
    throw new Error(`Unknown astrological id: ${id}`);
  }

  return item.label;
}

export function getAstrologicalBodyLabel(id: AstrologicalBodyId): string {
  return getLabel(ASTROLOGICAL_BODIES, id);
}

export function getAngleLabel(id: AngleId): string {
  return getLabel(ANGLES, id);
}

export function getAstrologicalPointLabel(id: ChartPointId): string {
  return getLabel(CHART_POINTS, id);
}

export function getSignLabel(id: ZodiacSignId): string {
  return getLabel(ZODIAC_SIGNS, id);
}

export function getHouseLabel(house: HouseNumber): string {
  return `Casa ${house}`;
}

export function getAspectLabel(id: AspectId): string {
  return getLabel(ASPECTS, id);
}

export function getConfigurationLabel(id: ConfigurationId): string {
  return getLabel(CHART_CONFIGURATIONS, id);
}

export function getConfigurationPointRule(type: ConfigurationId) {
  return CONFIGURATION_POINT_RULES[type];
}

export function createConfigurationPointSlots(
  type: ConfigurationId,
): Array<ChartPointId | null> {
  return Array.from(
    { length: getConfigurationPointRule(type).min },
    () => null,
  );
}

export function resizeConfigurationPointSlots(
  type: ConfigurationId,
  current: ReadonlyArray<ChartPointId | null>,
): Array<ChartPointId | null> {
  const { min, max } = getConfigurationPointRule(type);
  const next = current.slice(0, max);

  while (next.length < min) {
    next.push(null);
  }

  return next;
}

export function canAddConfigurationPoint(
  type: ConfigurationId,
  count: number,
): boolean {
  return count < getConfigurationPointRule(type).max;
}

export function canRemoveConfigurationPoint(
  type: ConfigurationId,
  count: number,
): boolean {
  return count > getConfigurationPointRule(type).min;
}

export function formatConfigurationParticipantLabels(
  points: readonly ChartPointId[],
  separator: string,
): string {
  return points.map(getAstrologicalPointLabel).join(separator);
}

export function isRulerPlanetId(value: string): value is RulerPlanetId {
  return RULER_PLANETS.some((planet) => planet.id === value);
}

export function formatHouseRuler(ruler: HouseRuler): string {
  return `Regente de ${getHouseLabel(ruler.house)}: ${getAstrologicalBodyLabel(ruler.planet)} en ${getSignLabel(ruler.sign)}`;
}

export function getSignRuler(sign: ZodiacSignId): AstrologicalBodyId {
  return SIGN_RULERS[sign];
}
