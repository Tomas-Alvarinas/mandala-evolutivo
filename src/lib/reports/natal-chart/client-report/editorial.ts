import type { NatalChartClientReport, NatalChartClientSection } from "./types";

export function applyNatalChartClientReportEdits(
  original: NatalChartClientReport,
  edited: NatalChartClientReport,
): NatalChartClientReport | null {
  if (original.sections.length !== edited.sections.length) {
    return null;
  }

  const sections: NatalChartClientSection[] = [];

  for (const [index, section] of original.sections.entries()) {
    const next = edited.sections[index];

    if (
      !next ||
      next.kind !== section.kind ||
      next.sourceSectionId !== section.sourceSectionId
    ) {
      return null;
    }

    sections.push(mergeSection(section, next));
  }

  return {
    metadata: original.metadata,
    cover: {
      title: edited.cover.title,
      subtitle: edited.cover.subtitle,
      clientName: edited.cover.clientName,
    },
    introduction: {
      content: edited.introduction.content,
    },
    sections,
    closing: {
      content: edited.closing.content,
    },
  };
}

function mergeSection(
  original: NatalChartClientSection,
  edited: NatalChartClientSection,
): NatalChartClientSection {
  switch (original.kind) {
    case "narrative":
      if (edited.kind !== "narrative") {
        return original;
      }

      return {
        ...original,
        title: edited.title,
        content: edited.content,
      };
    case "list":
      if (edited.kind !== "list") {
        return original;
      }

      return {
        ...original,
        title: edited.title,
        items: edited.items,
      };
    case "symbolsAndColors":
      if (edited.kind !== "symbolsAndColors") {
        return original;
      }

      return {
        ...original,
        title: edited.title,
        symbols: edited.symbols,
        colors: edited.colors,
      };
    case "mandala":
      if (edited.kind !== "mandala") {
        return original;
      }

      return {
        ...original,
        title: edited.title,
        intention: edited.intention,
        assignment: edited.assignment,
        elements: edited.elements,
        questions: edited.questions,
      };
  }
}
