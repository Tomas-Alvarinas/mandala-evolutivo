import assert from "node:assert/strict";
import {
  CLIENT_FICHA_HUB_ITEMS,
  CLIENT_FICHA_SECTION_IDS,
  formatClientFichaNatalSectionSummary,
  formatClientFichaNatalSummary,
  formatClientFichaSolarReturnsSummary,
  formatClientFichaTransitsSummary,
  getClientFichaHubHref,
} from "./ficha";

function run() {
  assert.equal(CLIENT_FICHA_SECTION_IDS.natalChart, "carta-natal");
  assert.equal(CLIENT_FICHA_SECTION_IDS.transits, "transitos");
  assert.equal(CLIENT_FICHA_SECTION_IDS.solarReturns, "revolucion-solar");
  assert.equal("reports" in CLIENT_FICHA_SECTION_IDS, false);
  assert.deepEqual(
    CLIENT_FICHA_HUB_ITEMS.map((item) => item.label),
    ["Carta Natal", "Tránsitos y Eclipses", "Revolución Solar"],
  );
  assert.equal(CLIENT_FICHA_HUB_ITEMS.length, 3);
  assert.equal(formatClientFichaNatalSummary(), "Cargada");
  assert.equal(
    formatClientFichaNatalSectionSummary(),
    "Carta natal cargada",
  );
  assert.equal(formatClientFichaTransitsSummary(0), "Todavía no hay períodos");
  assert.equal(formatClientFichaTransitsSummary(1), "1 período cargado");
  assert.equal(formatClientFichaTransitsSummary(3), "3 períodos cargados");
  assert.equal(
    formatClientFichaSolarReturnsSummary({
      count: 0,
      latestPeriodLabel: null,
    }),
    "Todavía no hay revoluciones solares",
  );
  assert.equal(
    formatClientFichaSolarReturnsSummary({
      count: 1,
      latestPeriodLabel: "2026–2027",
    }),
    "1 revolución solar · 2026–2027",
  );
  assert.equal(
    formatClientFichaSolarReturnsSummary({
      count: 3,
      latestPeriodLabel: "2028–2029",
    }),
    "3 revoluciones solares · 2028–2029",
  );
  assert.equal(
    getClientFichaHubHref({
      sectionId: CLIENT_FICHA_SECTION_IDS.natalChart,
      clientId: "client-1",
    }),
    "/clients/client-1/natal-chart",
  );
  assert.equal(
    getClientFichaHubHref({
      sectionId: CLIENT_FICHA_SECTION_IDS.transits,
      clientId: "client-1",
    }),
    "/clients/client-1/transits",
  );
  assert.equal(
    getClientFichaHubHref({
      sectionId: CLIENT_FICHA_SECTION_IDS.solarReturns,
      clientId: "client-1",
    }),
    "/clients/client-1/solar-returns",
  );
}

run();
console.log("client ficha summary tests ok");
