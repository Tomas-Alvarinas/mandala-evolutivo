import {
  ASPECTS,
  CHART_POINTS,
  HOUSE_NUMBERS,
  ZODIAC_SIGNS,
  getAspectLabel,
  getAstrologicalBodyLabel,
  getAstrologicalPointLabel,
  getHouseLabel,
  getSignLabel,
  type AspectId,
  type ChartPointId,
  type HouseNumber,
  type ZodiacSignId,
} from "@/lib/astrology";
import {
  ECLIPSE_TYPES,
  TRANSIT_PLANET_IDS,
  type EclipseType,
  type TransitPlanetId,
} from "./constants";
import type {
  TransitAspect,
  TransitEclipse,
  TransitPosition,
} from "./types";

const ISO_DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isTransitPlanetId(value: string): value is TransitPlanetId {
  return (TRANSIT_PLANET_IDS as readonly string[]).includes(value);
}

export function isEclipseType(value: string): value is EclipseType {
  return ECLIPSE_TYPES.some((entry) => entry.id === value);
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

export function isIsoDateOnly(value: string): boolean {
  const match = ISO_DATE_ONLY.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function todayIsoDate(
  timeZone = "America/Argentina/Buenos_Aires",
): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function formatIsoDateOnlyEs(value: string): string {
  const match = ISO_DATE_ONLY.exec(value);

  if (!match) {
    return "";
  }

  const day = Number(match[3]);
  const month = Number(match[2]);
  const year = Number(match[1]);
  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ] as const;

  return `${day} de ${months[month - 1]} de ${year}`;
}

export function getTransitPlanetLabel(id: TransitPlanetId): string {
  return getAstrologicalBodyLabel(id);
}

export function getEclipseTypeLabel(id: EclipseType): string {
  const match = ECLIPSE_TYPES.find((entry) => entry.id === id);

  if (!match) {
    throw new Error(`Unknown eclipse type: ${id}`);
  }

  return match.label;
}

export function transitPositionKey(position: TransitPosition): string {
  return position.planet;
}

export function transitAspectKey(aspect: TransitAspect): string {
  return `${aspect.transitPlanet}|${aspect.aspect}|${aspect.natalPoint}`;
}

export function transitEclipseAxisKey(
  eclipse: Pick<
    TransitEclipse,
    "signA" | "natalHouseA" | "signB" | "natalHouseB"
  >,
): string {
  const left = `${eclipse.signA}:${eclipse.natalHouseA}`;
  const right = `${eclipse.signB}:${eclipse.natalHouseB}`;
  return left <= right ? `${left}|${right}` : `${right}|${left}`;
}

export function transitEclipseKey(eclipse: TransitEclipse): string {
  return `${eclipse.eclipseType}|${transitEclipseAxisKey(eclipse)}`;
}

export function isSameEclipseAxis(
  left: Pick<TransitEclipse, "signA" | "natalHouseA" | "signB" | "natalHouseB">,
  right: Pick<TransitEclipse, "signA" | "natalHouseA" | "signB" | "natalHouseB">,
): boolean {
  return transitEclipseAxisKey(left) === transitEclipseAxisKey(right);
}

export function formatTransitPosition(position: TransitPosition): string {
  return `${getTransitPlanetLabel(position.planet)} · ${getSignLabel(position.sign)} · ${getHouseLabel(position.natalHouse)}`;
}

export function formatTransitAspect(aspect: TransitAspect): string {
  return `${getTransitPlanetLabel(aspect.transitPlanet)} · ${getAspectLabel(aspect.aspect)} · ${getAstrologicalPointLabel(aspect.natalPoint)} natal`;
}

export function formatTransitEclipse(eclipse: TransitEclipse): string {
  const typeLabel = getEclipseTypeLabel(eclipse.eclipseType).toLowerCase();
  return `Eclipse ${typeLabel} · ${getSignLabel(eclipse.signA)} ${getHouseLabel(eclipse.natalHouseA)} ↔ ${getSignLabel(eclipse.signB)} ${getHouseLabel(eclipse.natalHouseB)}`;
}
