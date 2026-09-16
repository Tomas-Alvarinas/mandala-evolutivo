import { z } from "zod";
import type { SolarReturnClientReport } from "./types";

const nonEmptyString = z.string().min(1);

const sectionSchema = z
  .object({
    content: nonEmptyString,
  })
  .strict();

export const solarReturnClientReportSchema = z
  .object({
    annualTheme: sectionSchema,
    solarAscendant: sectionSchema,
    ascendantRuler: sectionSchema,
    sunDirection: sectionSchema,
    emotionalWorld: sectionSchema,
    personalPlanets: sectionSchema,
    energyConcentration: sectionSchema,
    lifeAreas: sectionSchema,
    evolutionaryChallenges: sectionSchema,
    opportunities: sectionSchema,
    learnings: sectionSchema,
    evolutionarySynthesis: sectionSchema,
  })
  .strict();

export type ParsedSolarReturnClientReport = z.infer<
  typeof solarReturnClientReportSchema
>;

type AssertEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

type SolarReturnClientReportMatchesSchema = AssertEqual<
  ParsedSolarReturnClientReport,
  SolarReturnClientReport
>;

const solarReturnClientReportMatchesSchema: SolarReturnClientReportMatchesSchema =
  true;

void solarReturnClientReportMatchesSchema;
