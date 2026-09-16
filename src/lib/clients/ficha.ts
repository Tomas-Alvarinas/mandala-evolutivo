export const CLIENT_FICHA_SECTION_IDS = {
  natalChart: "carta-natal",
  transits: "transitos",
  solarReturns: "revolucion-solar",
} as const;

export const CLIENT_FICHA_HUB_ITEMS = [
  { id: CLIENT_FICHA_SECTION_IDS.natalChart, label: "Carta Natal" },
  { id: CLIENT_FICHA_SECTION_IDS.transits, label: "Tránsitos y Eclipses" },
  { id: CLIENT_FICHA_SECTION_IDS.solarReturns, label: "Revolución Solar" },
] as const;

export function formatClientFichaNatalSummary() {
  return "Cargada";
}

export function formatClientFichaNatalSectionSummary() {
  return "Carta natal cargada";
}

export function formatClientFichaTransitsSummary(count: number | null) {
  if (count === null) {
    return "No se pudieron cargar";
  }

  if (count === 0) {
    return "Todavía no hay períodos";
  }

  return count === 1
    ? "1 período cargado"
    : `${count} períodos cargados`;
}

export function formatClientFichaSolarReturnsSummary(input: {
  count: number | null;
  latestPeriodLabel: string | null;
}) {
  if (input.count === null) {
    return "No se pudieron cargar";
  }

  if (input.count === 0) {
    return "Todavía no hay revoluciones solares";
  }

  const countLabel =
    input.count === 1
      ? "1 revolución solar"
      : `${input.count} revoluciones solares`;

  if (!input.latestPeriodLabel) {
    return countLabel;
  }

  return `${countLabel} · ${input.latestPeriodLabel}`;
}

export function getClientFichaHubHref(input: {
  sectionId: (typeof CLIENT_FICHA_HUB_ITEMS)[number]["id"];
  clientId: string;
}) {
  switch (input.sectionId) {
    case CLIENT_FICHA_SECTION_IDS.natalChart:
      return `/clients/${input.clientId}/natal-chart`;
    case CLIENT_FICHA_SECTION_IDS.transits:
      return `/clients/${input.clientId}/transits`;
    case CLIENT_FICHA_SECTION_IDS.solarReturns:
      return `/clients/${input.clientId}/solar-returns`;
  }
}
