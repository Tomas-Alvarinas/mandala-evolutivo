/**
 * Schema Zod del informe de Carta Natal.
 *
 * Fuente de verdad runtime. TypeScript se infiere de Zod y se verifica
 * estructuralmente contra `NatalChartReport` para detectar desincronización.
 *
 * Gemini recibe el JSON Schema derivado (`z.toJSONSchema`), sin `metadata`.
 * Las `$ref` / `definitions` / `allOf` de Zod se inlinean antes de sanitizar.
 * La aplicación completa `version` y `generatedAt` después de validar.
 */

import { z } from "zod";
import type { NatalChartReport } from "@/lib/reports";

const nonEmptyString = z.string().min(1);

const reportSectionSchema = z
  .object({
    content: nonEmptyString.describe(
      "Texto interpretativo de la sección. Hipótesis de trabajo, no diagnóstico.",
    ),
    astrologicalBasis: z
      .array(nonEmptyString)
      .min(1)
      .describe(
        "Cadenas exactas de la lista de evidencia permitida que sostienen esta sección.",
      ),
  })
  .describe("Sección narrativa con fundamento astrológico trazable.");

const symbolicResourceSchema = z.object({
  symbol: nonEmptyString.describe("Símbolo propuesto, sin significado universal rígido."),
  meaning: nonEmptyString.describe(
    "Intención o pregunta asociada. Priorizar el significado subjetivo de la persona.",
  ),
});

const colorResourceSchema = z.object({
  color: nonEmptyString.describe(
    "Color propuesto como recurso expresivo, no como código universal.",
  ),
  intention: nonEmptyString.describe("Intención subjetiva asociada al color."),
});

export const geminiNatalChartReportSchema = z.object({
  evolutionaryMandalaSummary: reportSectionSchema.describe(
    "Síntesis del Mandala Evolutivo: temas dominantes, tensiones y polaridades.",
  ),
  identity: reportSectionSchema.describe("Esencia e identidad. Hipótesis, no definición de quién es."),
  emotionalWorld: reportSectionSchema.describe("Mundo emocional y necesidades de seguridad afectiva."),
  potential: reportSectionSchema.describe("Potencialidades, talentos y recursos."),
  evolutionaryChallenges: reportSectionSchema.describe("Desafíos evolutivos como caminos de desarrollo."),
  shadowPatterns: reportSectionSchema.describe("Sombra y patrones posibles, incluyendo polaridades."),
  systemicAndAstrogenealogicalReading: reportSectionSchema.describe(
    "Mirada sistémica y astrogenealógica: hipótesis sobre pertenencia, diferenciación, mandatos y recursos del sistema. No inventar historia familiar. No atribuir casas rígidamente a padres. No mencionar autoras. Sintetizar patrones de la carta, no repetir otras secciones.",
  ),
  innerDialogue: reportSectionSchema.describe(
    "Diálogo interno posible. Usar formulaciones como “una narrativa interna posible podría ser”.",
  ),
  relationships: reportSectionSchema.describe("Vínculos. Hipótesis relacionales, no biografía inventada."),
  security: reportSectionSchema.describe("Seguridad percibida, protección y pertenencia."),
  moneyAndResources: reportSectionSchema.describe(
    "Dinero y recursos como relación simbólica con el valor, no consejo financiero.",
  ),
  workAndVocation: reportSectionSchema.describe(
    "Trabajo y vocación: contextos estimulantes, no prescripción de carrera.",
  ),
  bodyWellbeingAndHabits: reportSectionSchema.describe(
    "Cuerpo, bienestar y hábitos. Solo relación subjetiva, hábitos y autocuidado. Sin diagnóstico ni tratamiento.",
  ),
  evolutionaryPurpose: reportSectionSchema.describe("Propósito evolutivo como dirección de exploración."),
  nervousSystemRegulation: reportSectionSchema.describe(
    "Preguntas de exploración sobre seguridad percibida y regulación. No diagnosticar el sistema nervioso.",
  ),
  survivalMode: reportSectionSchema.describe("Respuestas de protección posibles. No diagnosticarlas."),
  creativeMode: reportSectionSchema.describe("Expresión creativa y recursos vitales."),
  beliefsToExplore: z
    .array(nonEmptyString)
    .min(1)
    .describe("Creencias susceptibles de autoindagación. No afirmar que la persona las sostiene."),
  byronKatieQuestions: z
    .array(nonEmptyString)
    .min(1)
    .describe("Preguntas de autoindagación adaptadas al patrón. No son psicoterapia."),
  identityReprogramming: reportSectionSchema.describe(
    "Identidad habitual y práctica de nuevas respuestas. Sin afirmar cambios cerebrales literales.",
  ),
  dispenzaInspiredWork: reportSectionSchema.describe(
    "Trabajo inspirado en Joe Dispenza: identidad, atención, visualización. Sin física cuántica como hecho.",
  ),
  practicalActions: z
    .array(nonEmptyString)
    .min(1)
    .describe("Acciones concretas derivadas de los patrones identificados. No consejos genéricos."),
  empoweringWords: z
    .array(nonEmptyString)
    .min(1)
    .describe("Palabras o frases como dirección de práctica, no afirmaciones mágicas."),
  symbolsAndColors: z
    .object({
      symbols: z.array(symbolicResourceSchema).min(1),
      colors: z.array(colorResourceSchema).min(1),
    })
    .describe("Recursos expresivos. El significado subjetivo de la persona tiene prioridad."),
  mandalaIntervention: z
    .object({
      intention: nonEmptyString,
      assignment: nonEmptyString,
      suggestedElements: z.array(nonEmptyString).min(1),
      processQuestions: z.array(nonEmptyString).min(1),
    })
    .describe("Intervención del Mandala Evolutivo derivada de los patrones identificados."),
  finalSynthesis: reportSectionSchema.describe("Síntesis final. Aportar una perspectiva integradora, no repetir."),
});

export const natalChartReportSchema = geminiNatalChartReportSchema.extend({
  metadata: z.object({
    version: nonEmptyString,
    generatedAt: nonEmptyString,
  }),
});

export type GeminiNatalChartReport = z.infer<typeof geminiNatalChartReportSchema>;
export type ParsedNatalChartReport = z.infer<typeof natalChartReportSchema>;

type AssertEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

type NatalChartReportMatchesSchema = AssertEqual<
  ParsedNatalChartReport,
  NatalChartReport
>;

const natalChartReportMatchesSchema: NatalChartReportMatchesSchema = true;

void natalChartReportMatchesSchema;

const GEMINI_JSON_SCHEMA_KEYS = new Set([
  "$id",
  "$defs",
  "$ref",
  "$anchor",
  "type",
  "format",
  "title",
  "description",
  "enum",
  "items",
  "prefixItems",
  "minItems",
  "maxItems",
  "minimum",
  "maximum",
  "anyOf",
  "oneOf",
  "properties",
  "additionalProperties",
  "required",
  "propertyOrdering",
]);

export function toGeminiJsonSchema(
  schema: z.ZodType,
): Record<string, unknown> {
  const jsonSchema = z.toJSONSchema(schema, {
    target: "draft-07",
    reused: "ref",
    override: (ctx) => {
      const json = ctx.jsonSchema as Record<string, unknown>;
      const properties = json.properties;

      if (properties && typeof properties === "object" && !Array.isArray(properties)) {
        json.propertyOrdering = Object.keys(properties);
      }
    },
  });

  const inlined = inlineLocalJsonSchema(jsonSchema);
  assertNoForbiddenSchemaKeywords(inlined);

  const sanitized = sanitizeGeminiJsonSchema(inlined) as Record<string, unknown>;
  assertRequiredSubsetOfProperties(sanitized);
  assertNoForbiddenSchemaKeywords(sanitized);
  return sanitized;
}

const FORBIDDEN_GEMINI_SCHEMA_KEYS = ["$ref", "$defs", "definitions", "allOf"] as const;

function inlineLocalJsonSchema(schema: unknown): Record<string, unknown> {
  const root = cloneJson(schema);
  const resolved = resolveJsonSchemaNode(root, root, new Set());
  const stripped = stripDefinitionRegistries(resolved);
  const record = asRecord(stripped);

  if (!record) {
    throw new Error("JSON Schema inválido para Gemini: el schema inlined no es un objeto.");
  }

  return record;
}

function resolveJsonSchemaNode(
  value: unknown,
  root: unknown,
  resolving: Set<string>,
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => resolveJsonSchemaNode(item, root, resolving));
  }

  const schema = asRecord(value);

  if (!schema) {
    return value;
  }

  if (typeof schema.$ref === "string") {
    const { $ref, ...rest } = schema;
    const resolved = resolveLocalRef($ref, root, resolving);
    return mergeJsonSchemas(resolved, resolveJsonSchemaNode(rest, root, resolving));
  }

  if (Array.isArray(schema.allOf)) {
    const { allOf, ...rest } = schema;
    let merged: unknown = {};

    for (const part of allOf) {
      merged = mergeJsonSchemas(
        merged,
        resolveJsonSchemaNode(part, root, resolving),
      );
    }

    return mergeJsonSchemas(merged, resolveJsonSchemaNode(rest, root, resolving));
  }

  const result: Record<string, unknown> = {};

  for (const [key, child] of Object.entries(schema)) {
    if (key === "definitions" || key === "$defs") {
      continue;
    }

    result[key] = resolveJsonSchemaNode(child, root, resolving);
  }

  return result;
}

function resolveLocalRef(
  ref: string,
  root: unknown,
  resolving: Set<string>,
): unknown {
  if (!ref.startsWith("#/")) {
    throw new Error(`JSON Schema inválido para Gemini: referencia no local "${ref}".`);
  }

  if (resolving.has(ref)) {
    throw new Error(`JSON Schema inválido para Gemini: referencia circular "${ref}".`);
  }

  resolving.add(ref);

  const target = lookupJsonPointer(root, ref);

  if (target === undefined) {
    resolving.delete(ref);
    throw new Error(`JSON Schema inválido para Gemini: no se encontró "${ref}".`);
  }

  const resolved = resolveJsonSchemaNode(cloneJson(target), root, resolving);
  resolving.delete(ref);
  return resolved;
}

function lookupJsonPointer(root: unknown, ref: string): unknown {
  const segments = ref
    .slice(2)
    .split("/")
    .map((segment) => segment.replaceAll("~1", "/").replaceAll("~0", "~"));

  let current: unknown = root;

  for (const segment of segments) {
    const record = asRecord(current);

    if (!record || !(segment in record)) {
      return undefined;
    }

    current = record[segment];
  }

  return current;
}

function mergeJsonSchemas(base: unknown, overlay: unknown): unknown {
  const baseRecord = asRecord(base);
  const overlayRecord = asRecord(overlay);

  if (!baseRecord) {
    return overlay;
  }

  if (!overlayRecord) {
    return base;
  }

  const merged: Record<string, unknown> = {
    ...baseRecord,
    ...overlayRecord,
  };

  const baseProperties = asRecord(baseRecord.properties);
  const overlayProperties = asRecord(overlayRecord.properties);

  if (baseProperties || overlayProperties) {
    merged.properties = {
      ...baseProperties,
      ...overlayProperties,
    };
  }

  if (Array.isArray(baseRecord.required) || Array.isArray(overlayRecord.required)) {
    merged.required = uniqueStrings([
      ...(Array.isArray(baseRecord.required) ? baseRecord.required : []),
      ...(Array.isArray(overlayRecord.required) ? overlayRecord.required : []),
    ]);
  }

  return merged;
}

function stripDefinitionRegistries(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripDefinitionRegistries);
  }

  const schema = asRecord(value);

  if (!schema) {
    return value;
  }

  const result: Record<string, unknown> = {};

  for (const [key, child] of Object.entries(schema)) {
    if (key === "definitions" || key === "$defs" || key === "$schema") {
      continue;
    }

    result[key] = stripDefinitionRegistries(child);
  }

  return result;
}

function assertNoForbiddenSchemaKeywords(value: unknown): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      assertNoForbiddenSchemaKeywords(item);
    }

    return;
  }

  const schema = asRecord(value);

  if (!schema) {
    return;
  }

  for (const key of FORBIDDEN_GEMINI_SCHEMA_KEYS) {
    if (key in schema) {
      throw new Error(
        `JSON Schema inválido para Gemini: el schema final no puede contener "${key}".`,
      );
    }
  }

  for (const child of Object.values(schema)) {
    assertNoForbiddenSchemaKeywords(child);
  }
}

function cloneJson<T>(value: T): T {
  return structuredClone(value);
}

function uniqueStrings(values: unknown[]): string[] {
  const result: string[] = [];

  for (const value of values) {
    if (typeof value === "string" && !result.includes(value)) {
      result.push(value);
    }
  }

  return result;
}

function sanitizeGeminiJsonSchema(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeGeminiJsonSchema);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const result: Record<string, unknown> = {};

  for (const [key, child] of Object.entries(value)) {
    if (!GEMINI_JSON_SCHEMA_KEYS.has(key)) {
      continue;
    }

    result[key] =
      key === "properties" || key === "$defs"
        ? sanitizeNamedSchemaMap(child)
        : sanitizeGeminiJsonSchema(child);
  }

  return result;
}

function sanitizeNamedSchemaMap(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeGeminiJsonSchema);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const result: Record<string, unknown> = {};

  for (const [name, schema] of Object.entries(value)) {
    result[name] = sanitizeGeminiJsonSchema(schema);
  }

  return result;
}

function assertRequiredSubsetOfProperties(value: unknown): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      assertRequiredSubsetOfProperties(item);
    }

    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  const schema = value as Record<string, unknown>;
  const required = schema.required;
  const properties = schema.properties;

  if (Array.isArray(required)) {
    const propertyNames =
      properties && typeof properties === "object" && !Array.isArray(properties)
        ? new Set(Object.keys(properties))
        : new Set<string>();

    for (const field of required) {
      if (typeof field === "string" && !propertyNames.has(field)) {
        throw new Error(
          `JSON Schema inválido para Gemini: required incluye "${field}" pero no está en properties.`,
        );
      }
    }
  }

  for (const child of Object.values(schema)) {
    assertRequiredSubsetOfProperties(child);
  }
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  return value as Record<string, unknown>;
}

export function getNatalChartGeminiJsonSchema(): Record<string, unknown> {
  return toGeminiJsonSchema(geminiNatalChartReportSchema);
}
