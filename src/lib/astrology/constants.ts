export const ASTROLOGICAL_BODIES = [
  { id: "sun", label: "Sol" },
  { id: "moon", label: "Luna" },
  { id: "mercury", label: "Mercurio" },
  { id: "venus", label: "Venus" },
  { id: "mars", label: "Marte" },
  { id: "jupiter", label: "Júpiter" },
  { id: "saturn", label: "Saturno" },
  { id: "uranus", label: "Urano" },
  { id: "neptune", label: "Neptuno" },
  { id: "pluto", label: "Plutón" },
  { id: "chiron", label: "Quirón" },
  { id: "northNode", label: "Nodo Norte" },
  { id: "southNode", label: "Nodo Sur" },
] as const;

export const ANGLES = [
  { id: "ascendant", label: "Ascendente" },
  { id: "midheaven", label: "Medio Cielo" },
] as const;

export const CHART_POINTS = [...ASTROLOGICAL_BODIES, ...ANGLES] as const;

export const ZODIAC_SIGNS = [
  { id: "aries", label: "Aries" },
  { id: "taurus", label: "Tauro" },
  { id: "gemini", label: "Géminis" },
  { id: "cancer", label: "Cáncer" },
  { id: "leo", label: "Leo" },
  { id: "virgo", label: "Virgo" },
  { id: "libra", label: "Libra" },
  { id: "scorpio", label: "Escorpio" },
  { id: "sagittarius", label: "Sagitario" },
  { id: "capricorn", label: "Capricornio" },
  { id: "aquarius", label: "Acuario" },
  { id: "pisces", label: "Piscis" },
] as const;

export const HOUSE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export const ASPECTS = [
  { id: "conjunction", label: "Conjunción" },
  { id: "opposition", label: "Oposición" },
  { id: "square", label: "Cuadratura" },
  { id: "trine", label: "Trígono" },
  { id: "sextile", label: "Sextil" },
  { id: "quincunx", label: "Quincuncio" },
] as const;

export const CHART_CONFIGURATIONS = [
  { id: "tSquare", label: "T cuadrada" },
  { id: "grandTrine", label: "Gran trígono" },
  { id: "yod", label: "Yod" },
  { id: "grandCross", label: "Gran cruz" },
  { id: "stellium", label: "Stellium" },
] as const;

export type AstrologicalBodyId = (typeof ASTROLOGICAL_BODIES)[number]["id"];
export type AngleId = (typeof ANGLES)[number]["id"];
export type ChartPointId = AstrologicalBodyId | AngleId;
export type ZodiacSignId = (typeof ZODIAC_SIGNS)[number]["id"];
export type HouseNumber = (typeof HOUSE_NUMBERS)[number];
export type AspectId = (typeof ASPECTS)[number]["id"];
export type ConfigurationId = (typeof CHART_CONFIGURATIONS)[number]["id"];

export const RULER_PLANET_IDS = [
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
] as const satisfies readonly AstrologicalBodyId[];

export type RulerPlanetId = (typeof RULER_PLANET_IDS)[number];

export const RULER_PLANETS = ASTROLOGICAL_BODIES.filter(
  (
    body,
  ): body is Extract<
    (typeof ASTROLOGICAL_BODIES)[number],
    { id: RulerPlanetId }
  > => (RULER_PLANET_IDS as readonly string[]).includes(body.id),
);

export const CONFIGURATION_POINT_RULES = {
  tSquare: { min: 3, max: 3 },
  grandTrine: { min: 3, max: 3 },
  yod: { min: 3, max: 3 },
  grandCross: { min: 4, max: 4 },
  stellium: { min: 3, max: 5 },
} as const satisfies Record<ConfigurationId, { min: number; max: number }>;

export const SIGN_RULERS = {
  aries: "mars",
  taurus: "venus",
  gemini: "mercury",
  cancer: "moon",
  leo: "sun",
  virgo: "mercury",
  libra: "venus",
  scorpio: "pluto",
  sagittarius: "jupiter",
  capricorn: "saturn",
  aquarius: "uranus",
  pisces: "neptune",
} as const satisfies Record<ZodiacSignId, AstrologicalBodyId>;
