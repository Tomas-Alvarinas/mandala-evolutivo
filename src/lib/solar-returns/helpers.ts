import {
  ANGLES,
  ASPECTS,
  CHART_POINTS,
  HOUSE_NUMBERS,
  ZODIAC_SIGNS,
  getAspectLabel,
  getAstrologicalPointLabel,
  getSignLabel,
  isRulerPlanetId,
  type AspectId,
  type ChartPointId,
  type HouseNumber,
  type RulerPlanetId,
  type ZodiacSignId,
} from "@/lib/astrology";
import { formatIsoDateOnlyEs, isIsoDateOnly } from "@/lib/transits/helpers";
import {
  SOLAR_RETURN_ANGLE_IDS,
  SOLAR_RETURN_BODY_IDS,
  SOLAR_RETURN_EXCLUDED_POINTS,
  SOLAR_RETURN_POINT_IDS,
  type SolarReturnAngleId,
  type SolarReturnBodyId,
  type SolarReturnPointId,
} from "./constants";
import type {
  SolarReturnAspect,
  SolarReturnNatalAspect,
  SolarReturnPosition,
  SolarReturnSummary,
} from "./types";

export function isSolarReturnBodyId(value: string): value is SolarReturnBodyId {
  return (SOLAR_RETURN_BODY_IDS as readonly string[]).includes(value);
}

export function isSolarReturnAngleId(
  value: string,
): value is SolarReturnAngleId {
  return (SOLAR_RETURN_ANGLE_IDS as readonly string[]).includes(value);
}

export function isSolarReturnPointId(
  value: string,
): value is SolarReturnPointId {
  return (SOLAR_RETURN_POINT_IDS as readonly string[]).includes(value);
}

export function isExcludedSolarReturnPoint(value: string) {
  return (SOLAR_RETURN_EXCLUDED_POINTS as readonly string[]).includes(value);
}

export function isZodiacSignId(value: string): value is ZodiacSignId {
  return ZODIAC_SIGNS.some((sign) => sign.id === value);
}

export function isHouseNumber(value: number): value is HouseNumber {
  return HOUSE_NUMBERS.some((house) => house === value);
}

export function isChartPointId(value: string): value is ChartPointId {
  return CHART_POINTS.some((point) => point.id === value);
}

export function isAspectId(value: string): value is AspectId {
  return ASPECTS.some((aspect) => aspect.id === value);
}

export function isSolarReturnAscendantRuler(
  value: string,
): value is RulerPlanetId {
  return isRulerPlanetId(value);
}

export function isNonNegativeInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

export function isValidSolarReturnPeriod(input: {
  periodStart: string;
  periodEnd: string;
}): boolean {
  if (!isIsoDateOnly(input.periodStart) || !isIsoDateOnly(input.periodEnd)) {
    return false;
  }

  return input.periodEnd > input.periodStart;
}

export function solarReturnPositionKey(position: SolarReturnPosition): string {
  return position.point;
}

export function solarReturnAspectKey(aspect: SolarReturnAspect): string {
  return `${aspect.pointA}|${aspect.aspect}|${aspect.pointB}`;
}

export function solarReturnNatalAspectKey(
  contact: SolarReturnNatalAspect,
): string {
  return `${contact.solarReturnPoint}|${contact.aspect}|${contact.natalPoint}`;
}

export function getSolarReturnPointLabel(id: SolarReturnPointId): string {
  if (isSolarReturnAngleId(id)) {
    return ANGLES.find((angle) => angle.id === id)?.label ?? id;
  }

  return getAstrologicalPointLabel(id);
}

export function formatSolarReturnPeriod(input: {
  periodStart: string;
  periodEnd: string;
}): string {
  const start = formatIsoDateOnlyEs(input.periodStart) || input.periodStart;
  const end = formatIsoDateOnlyEs(input.periodEnd) || input.periodEnd;
  return `${start} – ${end}`;
}

export function formatSolarReturnPeriodYears(input: {
  periodStart: string;
  periodEnd: string;
}): string {
  const startYear = input.periodStart.slice(0, 4);
  const endYear = input.periodEnd.slice(0, 4);

  if (!/^\d{4}$/.test(startYear) || !/^\d{4}$/.test(endYear)) {
    return formatSolarReturnPeriod(input);
  }

  if (startYear === endYear) {
    return startYear;
  }

  return `${startYear}–${endYear}`;
}

export function formatSolarReturnPosition(position: SolarReturnPosition): string {
  const name = getSolarReturnPointLabel(position.point);
  const sign = getSignLabel(position.sign);
  const natalHouse = `Casa natal ${position.natalOverlayHouse}`;

  if (position.solarReturnHouse === null) {
    return `${name} · ${sign} · ${natalHouse}`;
  }

  return `${name} · ${sign} · Casa RS ${position.solarReturnHouse} · ${natalHouse}`;
}

export function formatSolarReturnAspect(aspect: SolarReturnAspect): string {
  return `${getSolarReturnPointLabel(aspect.pointA)} · ${getAspectLabel(aspect.aspect)} · ${getSolarReturnPointLabel(aspect.pointB)}`;
}

export function formatSolarReturnNatalAspect(
  contact: SolarReturnNatalAspect,
): string {
  return `${getSolarReturnPointLabel(contact.solarReturnPoint)} RS · ${getAspectLabel(contact.aspect)} · ${getAstrologicalPointLabel(contact.natalPoint)} natal`;
}

export function getLatestSolarReturnSummary(
  items: readonly SolarReturnSummary[],
): SolarReturnSummary | null {
  return [...items].sort((left, right) => {
    if (left.periodStart === right.periodStart) {
      return right.createdAt.localeCompare(left.createdAt);
    }

    return right.periodStart.localeCompare(left.periodStart);
  })[0] ?? null;
}

export { isIsoDateOnly, formatIsoDateOnlyEs };
