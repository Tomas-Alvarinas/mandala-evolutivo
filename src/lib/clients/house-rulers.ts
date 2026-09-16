import {
  HOUSE_NUMBERS,
  ZODIAC_SIGNS,
  isRulerPlanetId,
  type HouseRuler,
} from "@/lib/astrology";

export type HouseRulerRow = {
  house: number;
  planet: string;
  sign: string;
};

export type HouseRulersLoadResult =
  | { status: "ok"; data: HouseRuler[] }
  | { status: "error" };

export function houseRulersFromQuery(input: {
  data: HouseRulerRow[] | null | undefined;
  error: { message?: string; code?: string } | null;
}): HouseRulersLoadResult {
  if (input.error) {
    return { status: "error" };
  }

  return mapHouseRulerRows(input.data);
}

export function mapHouseRulerRows(
  rows: HouseRulerRow[] | null | undefined,
): HouseRulersLoadResult {
  const mapped = (rows ?? []).map((ruler) => {
    const house = HOUSE_NUMBERS.find((value) => value === ruler.house) ?? null;
    const planet = isRulerPlanetId(ruler.planet) ? ruler.planet : null;
    const sign = ZODIAC_SIGNS.find((entry) => entry.id === ruler.sign)?.id ?? null;

    if (house === null || !planet || !sign) {
      return null;
    }

    return { house, planet, sign } satisfies HouseRuler;
  });

  if (mapped.some((ruler) => ruler === null)) {
    return { status: "error" };
  }

  const houseRulers = mapped.filter(
    (ruler): ruler is HouseRuler => ruler !== null,
  );
  const seenHouses = new Set<number>();

  for (const ruler of houseRulers) {
    if (seenHouses.has(ruler.house)) {
      return { status: "error" };
    }

    seenHouses.add(ruler.house);
  }

  houseRulers.sort((left, right) => left.house - right.house);
  return { status: "ok", data: houseRulers };
}
