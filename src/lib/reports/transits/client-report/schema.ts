import { z } from "zod";
import type { TransitClientReport } from "./types";

const nonEmptyString = z.string().min(1);

const sectionSchema = z.object({
  content: nonEmptyString,
});

export const transitClientReportSchema = z.object({
  mandalaImpact: sectionSchema,
  activatedAreas: sectionSchema,
  evolutionaryChallenges: sectionSchema,
  availableResources: sectionSchema,
  opportunities: sectionSchema,
  learnings: sectionSchema,
});

export type ParsedTransitClientReport = z.infer<typeof transitClientReportSchema>;

type AssertEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

type TransitClientReportMatchesSchema = AssertEqual<
  ParsedTransitClientReport,
  TransitClientReport
>;

const transitClientReportMatchesSchema: TransitClientReportMatchesSchema = true;

void transitClientReportMatchesSchema;
