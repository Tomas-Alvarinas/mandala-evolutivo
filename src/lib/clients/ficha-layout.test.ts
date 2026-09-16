import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CLIENT_FICHA_HUB_ITEMS,
  CLIENT_FICHA_SECTION_IDS,
  formatClientFichaNatalSectionSummary,
  formatClientFichaNatalSummary,
} from "./ficha";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(DIRNAME, "../../..");

function readRepo(...parts: string[]) {
  return readFileSync(path.join(ROOT, ...parts), "utf8");
}

function run() {
  assert.deepEqual(
    CLIENT_FICHA_HUB_ITEMS.map((item) => item.label),
    ["Carta Natal", "Tránsitos y Eclipses", "Revolución Solar"],
  );
  assert.equal(CLIENT_FICHA_HUB_ITEMS.length, 3);
  assert.equal(CLIENT_FICHA_SECTION_IDS.natalChart, "carta-natal");
  assert.equal(CLIENT_FICHA_SECTION_IDS.transits, "transitos");
  assert.equal(CLIENT_FICHA_SECTION_IDS.solarReturns, "revolucion-solar");
  assert.equal("reports" in CLIENT_FICHA_SECTION_IDS, false);

  const hub = readRepo("src/components/clients/ClientFichaHub.tsx");
  assert.ok(hub.includes('grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3'));
  assert.equal(hub.includes("flex flex-wrap gap-2"), false);
  assert.equal(hub.includes("sm:grid-cols-3"), false);
  assert.equal(hub.includes("lg:grid-cols-4"), false);
  assert.ok(hub.includes("CLIENT_FICHA_HUB_ITEMS.map"));
  assert.ok(hub.includes("getClientFichaHubHref"));
  assert.ok(hub.includes('variant="interactive"'));
  assert.equal(hub.includes("Ver →"), false);
  assert.ok(hub.includes("FichaNatalIcon"));
  assert.equal(hub.includes("FichaReportsIcon"), false);
  assert.equal(hub.includes("Informes"), false);
  assert.ok(hub.includes("FichaTransitsIcon"));
  assert.ok(hub.includes("FichaSolarIcon"));
  assert.ok(hub.includes("FICHA_HUB_ICONS"));
  assert.ok(hub.includes('aria-hidden="true"'));
  assert.ok(hub.includes("bg-surface-subtle"));
  assert.ok(hub.includes("text-accent"));
  assert.ok(hub.includes("rounded-full"));
  assert.equal(hub.includes("href={`#${item.id}`}"), false);
  assert.equal(hub.includes("href={`#"), false);

  const ficha = readRepo("src/app/clients/[id]/page.tsx");
  assert.ok(ficha.includes("ClientFichaHub"));
  assert.ok(ficha.includes("Editar consultante"));
  assert.equal(ficha.includes("NatalChartSection"), false);
  assert.equal(ficha.includes("NatalChartReportsSection"), false);
  assert.equal(ficha.includes("TransitAnalysesSection"), false);
  assert.equal(ficha.includes("SolarReturnsSection"), false);
  assert.equal(ficha.includes("CLIENT_FICHA_SECTION_IDS"), false);
  assert.equal(ficha.includes("NatalChartDetails"), false);
  assert.equal(ficha.includes("NatalChartAnalysisPanel"), false);
  assert.equal(ficha.includes("Análisis de Carta Natal"), false);
  assert.equal(ficha.includes("Generar análisis"), false);
  assert.equal(ficha.includes("Nueva Carta Natal"), false);
  assert.equal(ficha.includes("getNatalChartReports"), false);
  assert.equal(ficha.includes("latestNatalReportId"), false);

  const natalSection = readRepo("src/components/natal-chart/NatalChartSection.tsx");
  assert.ok(natalSection.includes("Ver Carta Natal"));
  assert.ok(natalSection.includes("Editar Carta Natal"));
  assert.equal(natalSection.includes("Cargar Carta Natal"), false);
  assert.equal(natalSection.includes("hasNatalChart"), false);
  assert.ok(natalSection.includes("`/clients/${clientId}/natal-chart`"));
  assert.ok(natalSection.includes("`/clients/${clientId}/edit`"));
  assert.equal(natalSection.includes("Nueva Carta Natal"), false);
  assert.equal(formatClientFichaNatalSummary(), "Cargada");
  assert.equal(
    formatClientFichaNatalSectionSummary(),
    "Carta natal cargada",
  );

  const reportsSection = readRepo(
    "src/components/reports/NatalChartReportsSection.tsx",
  );
  const analysisPanel = readRepo(
    "src/components/reports/NatalChartAnalysisPanel.tsx",
  );
  assert.equal(reportsSection.includes("Informes de Carta Natal"), false);
  assert.ok(reportsSection.includes("NatalChartAnalysisPanel"));
  assert.ok(reportsSection.includes("Más reciente"));
  assert.ok(reportsSection.includes("Ver informe →"));
  assert.ok(reportsSection.includes("Todavía no hay informes generados."));
  assert.equal(reportsSection.includes("Generá el primer informe"), false);
  assert.equal(reportsSection.includes("generateNatalChartAnalysisAction"), false);
  assert.ok(analysisPanel.includes("Informes de Carta Natal"));
  assert.ok(analysisPanel.includes("Generar nuevo informe"));
  assert.ok(analysisPanel.includes("generateNatalChartAnalysisAction"));
  assert.ok(
    analysisPanel.includes(
      'className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"',
    ),
  );
  assert.ok(analysisPanel.includes('variant="secondary"'));
  assert.ok(analysisPanel.includes("w-full sm:w-auto"));
  assert.equal(analysisPanel.includes("<Card"), false);
  assert.equal(analysisPanel.includes("Cada generación crea un informe nuevo"), false);
  assert.equal(analysisPanel.includes(">Generar informe<"), false);
  assert.equal(analysisPanel.includes("Análisis de Carta Natal"), false);
  assert.equal(analysisPanel.includes("Generar análisis"), false);

  const natalPage = readRepo("src/app/clients/[id]/natal-chart/page.tsx");
  assert.ok(natalPage.includes("NatalChartDetails"));
  assert.ok(natalPage.includes("NatalChartReportsSection"));
  assert.ok(natalPage.includes("Editar Carta Natal"));
  assert.ok(natalPage.includes("`/clients/${client.id}/edit`"));

  const transitsSection = readRepo(
    "src/components/transits/TransitAnalysesSection.tsx",
  );
  const solarSection = readRepo(
    "src/components/solar-returns/SolarReturnsSection.tsx",
  );
  assert.ok(transitsSection.includes("Tránsitos y Eclipses"));
  assert.ok(transitsSection.includes("Nuevo período de tránsitos"));
  assert.ok(
    transitsSection.includes(
      'className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"',
    ),
  );
  assert.equal(transitsSection.includes("Generar nuevo informe"), false);
  assert.equal(
    transitsSection.includes("generateNatalChartAnalysisAction"),
    false,
  );
  assert.ok(solarSection.includes("Revolución Solar"));
  assert.ok(solarSection.includes("Nueva Revolución Solar"));
  assert.ok(
    solarSection.includes(
      'className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"',
    ),
  );
  assert.equal(solarSection.includes("Generar nuevo informe"), false);
}

run();
console.log("client ficha layout tests ok");
