/**
 * Evidencia astrológica canónica para Carta Natal.
 *
 * Decisión V1: strings formateados + whitelist, no IDs estructurados.
 *
 * `NatalChartReport.astrologicalBasis` ya es `string[]`. Identificadores
 * del tipo `position:moon` o `aspect:moon:opposition:saturn` serían más
 * robustos ante variaciones de puntuación, pero exigirían cambiar el
 * contrato o una capa de traducción. Un formatter único + coincidencia
 * exacta es suficiente para V1 y deja el texto legible para la profesional.
 *
 * El mismo formatter se usa para:
 * 1. la whitelist
 * 2. el contexto enviado a Gemini
 * 3. la validación del output
 */

import {
  ASTROLOGICAL_BODIES,
  formatHouseRuler,
  getAngleLabel,
  getAspectLabel,
  getAstrologicalBodyLabel,
  getAstrologicalPointLabel,
  getConfigurationLabel,
  formatConfigurationParticipantLabels,
  getSignLabel,
  getSignRuler,
  type AngleId,
  type AstrologicalPosition,
  type ChartConfiguration,
  type NatalAspect,
  type NatalChart,
  type ZodiacSignId,
} from "@/lib/astrology";

export const EXPECTED_NATAL_POSITION_COUNT = ASTROLOGICAL_BODIES.length;

export type AscendantRulerEvidence = {
  bodyId: ReturnType<typeof getSignRuler>;
  bodyLabel: string;
  position: AstrologicalPosition;
};

export function formatPositionEvidence(
  position: AstrologicalPosition,
): string {
  return `${getAstrologicalBodyLabel(position.point)} en ${getSignLabel(position.sign)} — Casa ${position.house}`;
}

export function formatAngleEvidence(
  angle: AngleId,
  sign: ZodiacSignId,
): string {
  return `${getAngleLabel(angle)} en ${getSignLabel(sign)}`;
}

export function formatAspectEvidence(aspect: NatalAspect): string {
  return `${getAstrologicalPointLabel(aspect.pointA)} ${getAspectLabel(aspect.aspect).toLowerCase()} ${getAstrologicalPointLabel(aspect.pointB)}`;
}

export function formatConfigurationEvidence(
  configuration: ChartConfiguration,
): string {
  return `${getConfigurationLabel(configuration.type)}: ${formatConfigurationParticipantLabels(configuration.points, " — ")}`;
}

export { formatHouseRuler as formatHouseRulerEvidence };

export function getAscendantRulerEvidence(
  chart: NatalChart,
): AscendantRulerEvidence {
  const bodyId = getSignRuler(chart.ascendant);
  const position = chart.positions.find((entry) => entry.point === bodyId);

  if (!position) {
    throw new Error("Missing ascendant ruler position in natal chart.");
  }

  return {
    bodyId,
    bodyLabel: getAstrologicalBodyLabel(bodyId),
    position,
  };
}

export function buildNatalChartEvidence(chart: NatalChart): string[] {
  const items = [
    ...chart.positions.map(formatPositionEvidence),
    formatAngleEvidence("ascendant", chart.ascendant),
    formatAngleEvidence("midheaven", chart.midheaven),
    ...chart.aspects.map(formatAspectEvidence),
    ...chart.configurations.map(formatConfigurationEvidence),
    ...(chart.houseRulers ?? []).map(formatHouseRuler),
  ];

  return [...new Set(items)];
}

export function createEvidenceWhitelist(items: string[]): Set<string> {
  return new Set(items);
}
