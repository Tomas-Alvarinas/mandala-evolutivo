import {
  SOLAR_RETURN_METHODOLOGY_VERSION,
  SOLAR_RETURN_REPORT_SECTION_IDS,
  SOLAR_RETURN_REPORT_VERSION,
} from "./constants";
import type { SolarReturnReport } from "./types";

const SECTION = {
  content:
    "Puede ser un año en el que se active una zona natal ya conocida.",
  astrologicalBasis: [
    "Venus RS en Capricornio — Casa RS 10 — Casa natal 2",
  ],
};

export function createSampleSolarReturnReport(input?: {
  solarReturnId?: string;
  periodStart?: string;
  periodEnd?: string;
  generatedAt?: string;
}): SolarReturnReport {
  const sections = Object.fromEntries(
    SOLAR_RETURN_REPORT_SECTION_IDS.map((sectionId) => [sectionId, SECTION]),
  ) as Pick<SolarReturnReport, (typeof SOLAR_RETURN_REPORT_SECTION_IDS)[number]>;

  return {
    metadata: {
      reportVersion: SOLAR_RETURN_REPORT_VERSION,
      methodologyVersion: SOLAR_RETURN_METHODOLOGY_VERSION,
      generatedAt: input?.generatedAt ?? "2026-09-07T18:00:00.000Z",
      solarReturnId:
        input?.solarReturnId ?? "bbbbbbbb-cccc-4ddd-8eee-ffffffffffff",
      periodStart: input?.periodStart ?? "2026-09-01",
      periodEnd: input?.periodEnd ?? "2027-09-01",
    },
    ...sections,
  };
}
