import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createEmptyTransitAnalysisDraft,
  toTransitAnalysis,
  toTransitAnalysisFormData,
} from "./form";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(DIRNAME, "../../..");

function readRepo(...parts: string[]) {
  return readFileSync(path.join(ROOT, ...parts), "utf8");
}

function run() {
  const editor = readRepo("src/components/transits/TransitAnalysisEditor.tsx");
  const newPage = readRepo("src/app/clients/[id]/transits/new/page.tsx");
  const editPage = readRepo(
    "src/app/clients/[id]/transits/[transitAnalysisId]/edit/page.tsx",
  );

  assert.ok(editor.includes('title="Tránsitos"'));
  assert.ok(editor.includes('title="Aspectos"'));
  assert.ok(editor.includes('title="Eclipses"'));
  assert.ok(editor.includes("value.positions.map"));
  assert.ok(editor.includes("value.aspects.map"));
  assert.ok(editor.includes("value.eclipses.map"));
  assert.ok(editor.includes("Agregar otro tránsito"));
  assert.ok(editor.includes("Agregar otro aspecto"));
  assert.ok(editor.includes("Agregar otro eclipse"));
  assert.ok(editor.includes("emptyPositionDraft"));
  assert.ok(editor.includes("emptyAspectDraft"));
  assert.ok(editor.includes("emptyEclipseDraft"));
  assert.ok(editor.includes("Eliminar tránsito"));
  assert.ok(editor.includes("Eliminar aspecto"));
  assert.ok(editor.includes("Eliminar eclipse"));
  assert.ok(editor.includes("disabledIds={usedTransitPlanetsExcept(position.uiId)}"));
  assert.ok(editor.includes("`transit-position-${position.uiId}-planet`"));
  assert.ok(editor.includes("`transit-aspect-${aspect.uiId}-planet`"));
  assert.ok(editor.includes("`transit-eclipse-${eclipse.uiId}-type`"));
  assert.equal(editor.includes("positionComposer"), false);
  assert.equal(editor.includes("aspectComposer"), false);
  assert.equal(editor.includes("eclipseComposer"), false);
  assert.equal(editor.includes("CommittedRow"), false);
  assert.equal(editor.includes(">Agregar tránsito<"), false);
  assert.equal(editor.includes(">Agregar aspecto<"), false);
  assert.equal(editor.includes(">Agregar eclipse<"), false);
  assert.equal(editor.includes("Sin tránsitos cargados."), false);
  assert.equal(editor.includes("Sin aspectos cargados."), false);
  assert.equal(editor.includes("Sin eclipses cargados."), false);

  assert.ok(newPage.includes("createEmptyTransitAnalysisDraft"));
  assert.ok(editPage.includes("transitAnalysisToDraft"));

  const emptyDraft = createEmptyTransitAnalysisDraft("2026-09-01");
  assert.equal(emptyDraft.positions.length, 1);
  assert.equal(emptyDraft.positions[0].planet, null);
  const serializedEmpty = toTransitAnalysis(toTransitAnalysisFormData(emptyDraft));
  assert.equal(serializedEmpty.success, false);
}

run();
console.log("transit analysis editor ux tests ok");
