import type { NatalChart } from "@/lib/astrology";
import type { SolarReturn } from "@/lib/solar-returns";
import type { SolarReturnEngineInput } from "./context";

const SAMPLE_NATAL_CHART: NatalChart = {
  ascendant: "aries",
  midheaven: "capricorn",
  positions: [
    { point: "sun", sign: "leo", house: 5 },
    { point: "moon", sign: "cancer", house: 4 },
    { point: "mercury", sign: "virgo", house: 6 },
    { point: "venus", sign: "taurus", house: 2 },
    { point: "mars", sign: "aries", house: 1 },
    { point: "jupiter", sign: "sagittarius", house: 9 },
    { point: "saturn", sign: "capricorn", house: 10 },
    { point: "uranus", sign: "aquarius", house: 11 },
    { point: "neptune", sign: "pisces", house: 12 },
    { point: "pluto", sign: "scorpio", house: 8 },
    { point: "chiron", sign: "gemini", house: 3 },
    { point: "northNode", sign: "libra", house: 7 },
    { point: "southNode", sign: "aries", house: 1 },
  ],
  aspects: [
    { pointA: "sun", aspect: "square", pointB: "saturn" },
    { pointA: "moon", aspect: "trine", pointB: "venus" },
  ],
  configurations: [{ type: "stellium", points: ["sun", "mercury", "venus"] }],
  houseRulers: [{ house: 5, planet: "sun", sign: "leo" }],
};

const SAMPLE_SOLAR_RETURN: SolarReturn = {
  id: "bbbbbbbb-cccc-4ddd-8eee-ffffffffffff",
  clientId: "ffffffff-1111-4222-8333-444444444444",
  periodStart: "2026-09-01",
  periodEnd: "2027-09-01",
  createdAt: "2026-09-01T12:00:00.000Z",
  updatedAt: "2026-09-01T12:00:00.000Z",
  ascendantRuler: "venus",
  professionalNotes: "No enviar al modelo.",
  positions: [
    { point: "sun", sign: "leo", solarReturnHouse: 5, natalOverlayHouse: 5 },
    { point: "moon", sign: "cancer", solarReturnHouse: 4, natalOverlayHouse: 4 },
    {
      point: "mercury",
      sign: "virgo",
      solarReturnHouse: 6,
      natalOverlayHouse: 6,
    },
    {
      point: "venus",
      sign: "capricorn",
      solarReturnHouse: 10,
      natalOverlayHouse: 2,
    },
    { point: "mars", sign: "aries", solarReturnHouse: 1, natalOverlayHouse: 1 },
    {
      point: "jupiter",
      sign: "sagittarius",
      solarReturnHouse: 9,
      natalOverlayHouse: 9,
    },
    {
      point: "saturn",
      sign: "aquarius",
      solarReturnHouse: 11,
      natalOverlayHouse: 11,
    },
    {
      point: "uranus",
      sign: "aquarius",
      solarReturnHouse: 11,
      natalOverlayHouse: 11,
    },
    {
      point: "neptune",
      sign: "pisces",
      solarReturnHouse: 12,
      natalOverlayHouse: 12,
    },
    {
      point: "pluto",
      sign: "scorpio",
      solarReturnHouse: 8,
      natalOverlayHouse: 8,
    },
    {
      point: "chiron",
      sign: "gemini",
      solarReturnHouse: 3,
      natalOverlayHouse: 3,
    },
    {
      point: "ascendant",
      sign: "taurus",
      solarReturnHouse: null,
      natalOverlayHouse: 6,
    },
    {
      point: "midheaven",
      sign: "capricorn",
      solarReturnHouse: null,
      natalOverlayHouse: 2,
    },
  ],
  aspects: [
    { pointA: "venus", aspect: "conjunction", pointB: "mars" },
  ],
  natalContacts: [
    { solarReturnPoint: "venus", aspect: "conjunction", natalPoint: "saturn" },
    { solarReturnPoint: "sun", aspect: "trine", natalPoint: "northNode" },
  ],
  elementSummary: {
    fire: 2,
    earth: 5,
    air: 1,
    water: 3,
  },
};

export function createSampleSolarReturnEngineInput(): SolarReturnEngineInput {
  return {
    firstName: "Paula",
    lastName: "Prueba",
    age: 41,
    natalChart: SAMPLE_NATAL_CHART,
    solarReturn: SAMPLE_SOLAR_RETURN,
  };
}
