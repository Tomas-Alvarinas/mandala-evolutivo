import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(DIRNAME, "../../..");

function run() {
  const migration = readFileSync(
    path.join(
      ROOT,
      "supabase/migrations/20260901195300_create_transit_analyses.sql",
    ),
    "utf8",
  );
  const repository = readFileSync(
    path.join(DIRNAME, "repository.ts"),
    "utf8",
  );
  const actions = readFileSync(path.join(DIRNAME, "actions.ts"), "utf8");

  for (const table of [
    "transit_analyses",
    "transit_positions",
    "transit_aspects",
    "transit_eclipses",
  ]) {
    assert.ok(migration.includes(`CREATE TABLE public.${table}`), table);
    assert.ok(
      migration.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      `${table} rls`,
    );
  }

  assert.ok(migration.includes("ON DELETE CASCADE"));
  assert.ok(migration.includes("create_transit_analysis"));
  assert.ok(migration.includes("update_transit_analysis"));
  assert.ok(migration.includes("SECURITY INVOKER"));
  assert.ok(migration.includes("clients.user_id = auth.uid()"));
  assert.ok(migration.includes("REVOKE ALL ON TABLE"));
  assert.ok(!migration.includes("TO anon;"));
  assert.ok(!migration.includes("service_role"));
  assert.ok(migration.includes("CHECK (sign_a <> sign_b)"));
  assert.ok(migration.includes("CHECK (natal_house_a <> natal_house_b)"));
  assert.ok(
    migration.includes(
      "UNIQUE (transit_analysis_id, eclipse_type, eclipse_axis_key)",
    ),
  );
  assert.ok(
    migration.includes("UNIQUE (transit_analysis_id, planet)"),
  );
  assert.equal(
    migration.includes("UNIQUE (transit_analysis_id, planet, sign, natal_house)"),
    false,
  );
  assert.ok(
    migration.includes(
      "UNIQUE (transit_analysis_id, transit_planet, aspect, natal_point)",
    ),
  );
  assert.ok(migration.includes("DELETE FROM public.transit_positions"));
  assert.ok(migration.includes("DELETE FROM public.transit_aspects"));
  assert.ok(migration.includes("DELETE FROM public.transit_eclipses"));

  assert.ok(repository.includes("export async function createTransitAnalysis"));
  assert.ok(repository.includes("export async function updateTransitAnalysis"));
  assert.ok(repository.includes("export async function deleteTransitAnalysis"));
  assert.ok(repository.includes("export async function listTransitAnalysesByClientId"));
  assert.ok(repository.includes("export const getTransitAnalysisById"));
  assert.ok(repository.includes('supabase.rpc("create_transit_analysis"'));
  assert.ok(repository.includes('supabase.rpc("update_transit_analysis"'));
  assert.ok(repository.includes('.from("transit_analyses")'));
  assert.ok(repository.includes(".delete()"));
  assert.equal(repository.includes("createSupabaseBrowserClient"), false);
  assert.equal(repository.includes("natal_charts"), false);

  const persistCreateIndex = actions.indexOf("persistCreate(");
  const persistUpdateIndex = actions.indexOf("persistUpdate(");
  const parseIndex = actions.indexOf("toTransitAnalysis(input.form)");
  assert.ok(parseIndex >= 0);
  assert.ok(persistCreateIndex > parseIndex);
  assert.ok(persistUpdateIndex > parseIndex);
  assert.ok(actions.includes("createTransitAnalysisAction"));
  assert.ok(actions.includes("updateTransitAnalysisAction"));
  assert.ok(actions.includes("deleteTransitAnalysisAction"));
  assert.equal(actions.includes("generateNatalChart"), false);
  assert.equal(actions.includes("gemini"), false);

  const deleteAction = actions.slice(
    actions.indexOf("export async function deleteTransitAnalysisAction"),
    actions.indexOf("function revalidateTransitPaths"),
  );
  assert.ok(deleteAction.includes('revalidatePath(`/clients/${input.clientId}`)'));
  assert.ok(deleteAction.includes('revalidatePath(`/clients/${input.clientId}/transits`)'));
  assert.ok(
    deleteAction.includes(
      'revalidatePath(`/clients/${input.clientId}/transits/${input.analysisId}`, "layout")',
    ),
  );
}

run();
console.log("transit analysis persistence tests ok");
