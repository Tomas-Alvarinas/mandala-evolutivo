import {
  ASTROLOGICAL_BODIES,
  type AstrologicalBodyId,
} from "@/lib/astrology";

export const TRANSIT_PLANET_IDS = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
  "chiron",
] as const satisfies readonly AstrologicalBodyId[];

export type TransitPlanetId = (typeof TRANSIT_PLANET_IDS)[number];

export const TRANSIT_PLANETS = ASTROLOGICAL_BODIES.filter(
  (
    body,
  ): body is Extract<
    (typeof ASTROLOGICAL_BODIES)[number],
    { id: TransitPlanetId }
  > => (TRANSIT_PLANET_IDS as readonly string[]).includes(body.id),
);

export const ECLIPSE_TYPES = [
  { id: "solar", label: "Solar" },
  { id: "lunar", label: "Lunar" },
] as const;

export type EclipseType = (typeof ECLIPSE_TYPES)[number]["id"];
