import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(DIRNAME, "../../..");

function readRepo(...parts: string[]) {
  return readFileSync(path.join(ROOT, ...parts), "utf8");
}

function run() {
  const editor = readRepo("src/components/solar-returns/SolarReturnEditor.tsx");
  const form = readRepo("src/components/solar-returns/SolarReturnForm.tsx");
  const details = readRepo("src/components/solar-returns/SolarReturnDetails.tsx");
  const list = readRepo("src/components/solar-returns/SolarReturnList.tsx");
  const section = readRepo("src/components/solar-returns/SolarReturnsSection.tsx");
  const listPage = readRepo("src/app/clients/[id]/solar-returns/page.tsx");
  const newPage = readRepo("src/app/clients/[id]/solar-returns/new/page.tsx");
  const detailPage = readRepo(
    "src/app/clients/[id]/solar-returns/[solarReturnId]/page.tsx",
  );
  const editPage = readRepo(
    "src/app/clients/[id]/solar-returns/[solarReturnId]/edit/page.tsx",
  );
  const hub = readRepo("src/components/clients/ClientFichaHub.tsx");
  const ficha = readRepo("src/app/clients/[id]/page.tsx");
  const home = readRepo("src/app/page.tsx");
  const pending = readRepo("src/lib/home/pending-work.ts");

  assert.ok(editor.includes("Regente del Ascendente"));
  assert.ok(editor.includes("Casa RS"));
  assert.ok(editor.includes("Casa natal"));
  assert.ok(editor.includes("Aspectos de Revolución Solar"));
  assert.ok(editor.includes("Contactos con Carta Natal"));
  assert.ok(editor.includes("Síntesis de elementos"));
  assert.ok(editor.includes("Cargá manualmente la síntesis utilizada"));
  assert.ok(editor.includes("Agregar otro aspecto"));
  assert.ok(editor.includes("Agregar otro contacto"));
  assert.equal(editor.includes(">Agregar aspecto<"), false);
  assert.equal(editor.includes(">Agregar contacto<"), false);
  assert.equal(editor.includes("aspectComposer"), false);
  assert.equal(editor.includes("contactComposer"), false);
  assert.equal(editor.includes("CommittedRow"), false);
  assert.equal(editor.includes("Sin aspectos cargados."), false);
  assert.equal(editor.includes("Sin contactos con Carta Natal."), false);
  assert.ok(editor.includes("value.aspects.map"));
  assert.ok(editor.includes("value.natalContacts.map"));
  assert.ok(editor.includes("emptyAspectDraft"));
  assert.ok(editor.includes("emptyNatalContactDraft"));
  assert.ok(editor.includes("`solar-return-contact-${contact.uiId}-rs-point`"));
  assert.ok(editor.includes("`solar-return-aspect-${aspect.uiId}-point-a`"));
  assert.equal(editor.includes("gemini"), false);

  assert.ok(form.includes("createSolarReturnAction"));
  assert.ok(form.includes("updateSolarReturnAction"));
  assert.ok(form.includes("Guardar Revolución Solar"));
  assert.ok(form.includes("Cancelar"));

  assert.ok(details.includes("Regente del Ascendente"));
  assert.ok(details.includes("Contactos con Carta Natal"));
  assert.ok(details.includes("Síntesis de elementos"));
  assert.equal(details.includes("Generar informe"), false);

  assert.ok(list.includes("formatSolarReturnPeriod"));
  assert.ok(list.includes("Ver →"));
  assert.ok(list.includes("showDelete"));
  assert.ok(list.includes("DeleteSolarReturnControl"));
  assert.ok(list.includes("formatLongDateEs"));
  assert.equal(list.includes("formatNumericDateEs"), false);

  assert.ok(section.includes("Nueva Revolución Solar"));
  assert.ok(section.includes("Ver todas"));
  assert.ok(section.includes("FICHA_PREVIEW_LIMIT = 3"));

  assert.ok(listPage.includes("Todavía no hay revoluciones solares cargadas."));
  assert.ok(listPage.includes("Nueva Revolución Solar"));
  assert.ok(listPage.includes("showDelete"));
  assert.ok(newPage.includes("createEmptySolarReturnDraft"));
  assert.ok(detailPage.includes("Editar Revolución Solar"));
  assert.ok(detailPage.includes("SolarReturnReportsSection"));
  assert.ok(detailPage.includes("listSolarReturnReports"));
  assert.ok(detailPage.includes("DeleteSolarReturnControl"));
  assert.ok(detailPage.includes("maxDuration = 300"));
  assert.ok(editPage.includes("solarReturnToDraft"));
  assert.equal(editPage.includes("EXISTING"), false);

  const generatePanel = readRepo(
    "src/components/reports/SolarReturnAnalysisPanel.tsx",
  );
  const reportsSection = readRepo(
    "src/components/reports/SolarReturnReportsSection.tsx",
  );
  const reportView = readRepo("src/components/reports/SolarReturnReportView.tsx");
  const reportPage = readRepo(
    "src/app/clients/[id]/solar-returns/[solarReturnId]/reports/[reportId]/page.tsx",
  );
  const originalPage = readRepo(
    "src/app/clients/[id]/solar-returns/[solarReturnId]/reports/[reportId]/original/page.tsx",
  );
  const reportEditPage = readRepo(
    "src/app/clients/[id]/solar-returns/[solarReturnId]/reports/[reportId]/edit/page.tsx",
  );
  assert.ok(generatePanel.includes("Generar nuevo informe"));
  assert.ok(generatePanel.includes("generateSolarReturnAnalysisAction"));
  assert.ok(generatePanel.includes('name="clientId"'));
  assert.ok(generatePanel.includes('name="solarReturnId"'));
  assert.ok(reportsSection.includes("Más reciente"));
  assert.ok(reportsSection.includes("Ver informe →"));
  assert.ok(reportsSection.includes("Todavía no hay informes generados."));
  assert.ok(reportsSection.includes("SolarReturnReportStatusBadge"));
  assert.ok(reportView.includes("Base astrológica"));
  assert.equal(reportView.includes("Tito Maciá"), false);
  assert.equal(reportView.includes("JSON"), false);
  assert.equal(reportPage.includes("NatalChartReportEditor"), false);
  assert.equal(reportPage.includes("DownloadReportPdfButton"), false);
  assert.equal(reportPage.includes("/client/edit"), false);
  assert.ok(reportPage.includes("getSolarReturnClientReportByProfessionalReportId"));
  assert.ok(reportPage.includes("SolarReturnReportStatusSelect"));
  assert.ok(reportPage.includes("stored.report"));
  assert.ok(originalPage.includes("stored.generatedReport"));
  assert.ok(originalPage.includes("ORIGINAL_VERSION_NOTICE_TITLE"));
  assert.equal(originalPage.includes("SolarReturnReportEditor"), false);
  assert.ok(reportEditPage.includes("SolarReturnReportEditor"));
  assert.ok(reportEditPage.includes("vuelve a Borrador"));

  assert.ok(hub.includes("CLIENT_FICHA_HUB_ITEMS"));
  assert.ok(hub.includes("formatClientFichaSolarReturnsSummary"));
  assert.ok(hub.includes("lg:grid-cols-3"));
  assert.equal(hub.includes("lg:grid-cols-4"), false);
  assert.ok(hub.includes("getClientFichaHubHref"));
  assert.equal(ficha.includes("SolarReturnsSection"), false);

  assert.ok(home.includes("getPendingSolarReturnWork"));
  assert.ok(pending.includes("solar"));
  assert.ok(pending.includes('"natal" | "transits" | "solar"'));
}

run();
console.log("solar return ui tests ok");
