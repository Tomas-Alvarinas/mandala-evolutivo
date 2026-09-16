import type { NatalChart } from "@/lib/astrology";
import type { TransitAnalysis } from "@/lib/transits";
import type { TransitAnalysisEngineInput } from "./context";

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
  configurations: [
    { type: "stellium", points: ["sun", "mercury", "venus"] },
  ],
  houseRulers: [
    { house: 5, planet: "sun", sign: "leo" },
  ],
};

const SAMPLE_TRANSIT_ANALYSIS: TransitAnalysis = {
  id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
  clientId: "ffffffff-1111-4222-8333-444444444444",
  analysisDate: "2026-09-02",
  createdAt: "2026-09-02T12:00:00.000Z",
  updatedAt: "2026-09-02T12:00:00.000Z",
  positions: [
    { planet: "jupiter", sign: "leo", natalHouse: 5 },
    { planet: "saturn", sign: "pisces", natalHouse: 12 },
  ],
  aspects: [
    { transitPlanet: "jupiter", aspect: "square", natalPoint: "venus" },
    { transitPlanet: "saturn", aspect: "conjunction", natalPoint: "neptune" },
  ],
  eclipses: [
    {
      eclipseType: "solar",
      signA: "leo",
      natalHouseA: 1,
      signB: "aquarius",
      natalHouseB: 7,
    },
  ],
};

export function createSampleTransitEngineInput(): TransitAnalysisEngineInput {
  return {
    firstName: "Paula",
    lastName: "Prueba",
    age: 41,
    natalChart: SAMPLE_NATAL_CHART,
    transitAnalysis: SAMPLE_TRANSIT_ANALYSIS,
  };
}
