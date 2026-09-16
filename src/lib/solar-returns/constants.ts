import {
  ANGLES,
  ASTROLOGICAL_BODIES,
  type AngleId,
  type AstrologicalBodyId,
} from "@/lib/astrology";

export const SOLAR_RETURN_BODY_IDS = [
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

export type SolarReturnBodyId = (typeof SOLAR_RETURN_BODY_IDS)[number];

export const SOLAR_RETURN_BODIES = ASTROLOGICAL_BODIES.filter(
  (
    body,
  ): body is Extract<
    (typeof ASTROLOGICAL_BODIES)[number],
    { id: SolarReturnBodyId }
  > => (SOLAR_RETURN_BODY_IDS as readonly string[]).includes(body.id),
);

export const SOLAR_RETURN_ANGLE_IDS = [
  "ascendant",
  "midheaven",
] as const satisfies readonly AngleId[];

export type SolarReturnAngleId = (typeof SOLAR_RETURN_ANGLE_IDS)[number];

export const SOLAR_RETURN_POINT_IDS = [
  ...SOLAR_RETURN_BODY_IDS,
  ...SOLAR_RETURN_ANGLE_IDS,
] as const;

export type SolarReturnPointId = (typeof SOLAR_RETURN_POINT_IDS)[number];

export const SOLAR_RETURN_POINTS: ReadonlyArray<{
  id: SolarReturnPointId;
  label: string;
}> = [
  ...SOLAR_RETURN_BODIES,
  ...ANGLES.filter((angle) =>
    (SOLAR_RETURN_ANGLE_IDS as readonly string[]).includes(angle.id),
  ),
];

export const SOLAR_RETURN_EXCLUDED_POINTS = [
  "northNode",
  "southNode",
] as const;
