import { z } from "zod";
import { NATAL_CHART_REPORT_SECTION_IDS } from "../constants";
import type { NatalChartClientReport } from "./types";

const nonEmptyString = z.string().min(1);
const sourceSectionIdSchema = z.enum(NATAL_CHART_REPORT_SECTION_IDS);

const narrativeSectionSchema = z.object({
  sourceSectionId: sourceSectionIdSchema,
  kind: z.literal("narrative"),
  title: nonEmptyString,
  content: nonEmptyString,
});

const listSectionSchema = z.object({
  sourceSectionId: sourceSectionIdSchema,
  kind: z.literal("list"),
  title: nonEmptyString,
  items: z.array(nonEmptyString).min(1),
});

const symbolsSectionSchema = z.object({
  sourceSectionId: sourceSectionIdSchema,
  kind: z.literal("symbolsAndColors"),
  title: nonEmptyString,
  symbols: z
    .array(
      z.object({
        symbol: nonEmptyString,
        meaning: nonEmptyString,
      }),
    )
    .min(1),
  colors: z
    .array(
      z.object({
        color: nonEmptyString,
        intention: nonEmptyString,
      }),
    )
    .min(1),
});

const mandalaSectionSchema = z.object({
  sourceSectionId: sourceSectionIdSchema,
  kind: z.literal("mandala"),
  title: nonEmptyString,
  intention: nonEmptyString,
  assignment: nonEmptyString,
  elements: z.array(nonEmptyString).min(1),
  questions: z.array(nonEmptyString).min(1),
});

export const natalChartClientReportSchema = z.object({
  metadata: z.object({
    version: nonEmptyString,
    createdAt: nonEmptyString,
  }),
  cover: z.object({
    title: nonEmptyString,
    subtitle: nonEmptyString,
    clientName: nonEmptyString,
  }),
  introduction: z.object({
    content: nonEmptyString,
  }),
  sections: z
    .array(
      z.discriminatedUnion("kind", [
        narrativeSectionSchema,
        listSectionSchema,
        symbolsSectionSchema,
        mandalaSectionSchema,
      ]),
    )
    .min(1),
  closing: z.object({
    content: nonEmptyString,
  }),
});

export type ParsedNatalChartClientReport = z.infer<
  typeof natalChartClientReportSchema
>;

type AssertEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

type NatalChartClientReportMatchesSchema = AssertEqual<
  ParsedNatalChartClientReport,
  NatalChartClientReport
>;

const natalChartClientReportMatchesSchema: NatalChartClientReportMatchesSchema =
  true;

void natalChartClientReportMatchesSchema;
