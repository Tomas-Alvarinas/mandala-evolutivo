import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(DIRNAME, "../../..");

function run() {
  const migration = readFileSync(
    path.join(ROOT, "supabase/migrations/20260907120000_create_solar_returns.sql"),
    "utf8",
  );
  const repository = readFileSync(path.join(DIRNAME, "repository.ts"), "utf8");
  const actions = readFileSync(path.join(DIRNAME, "actions.ts"), "utf8");

  for (const table of [
    "solar_returns",
    "solar_return_positions",
    "solar_return_aspects",
    "solar_return_natal_aspects",
  ]) {
    assert.ok(migration.includes(`CREATE TABLE public.${table}`), table);
    assert.ok(
      migration.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      `${table} rls`,
    );
  }

  assert.ok(migration.includes("ON DELETE CASCADE"));
  assert.ok(migration.includes("UNIQUE (client_id, period_start, period_end)"));
  assert.ok(migration.includes("CHECK (period_end > period_start)"));
  assert.ok(migration.includes("fire_count integer NOT NULL CHECK (fire_count >= 0)"));
  assert.ok(migration.includes("UNIQUE (solar_return_id, point)"));
  assert.ok(migration.includes("CHECK (point_a <> point_b)"));
  assert.ok(
    migration.includes("UNIQUE (solar_return_id, point_a, aspect, point_b)"),
  );
  assert.ok(
    migration.includes(
      "UNIQUE (solar_return_id, solar_return_point, aspect, natal_point)",
    ),
  );
  assert.ok(migration.includes("create_solar_return"));
  assert.ok(migration.includes("update_solar_return"));
  assert.ok(migration.includes("SECURITY INVOKER"));
  assert.ok(migration.includes("clients.user_id = auth.uid()"));
  assert.ok(migration.includes("REVOKE ALL ON TABLE"));
  assert.ok(!migration.includes("TO anon;"));
  assert.ok(!migration.includes("service_role"));
  assert.ok(migration.includes("DELETE FROM public.solar_return_positions"));
  assert.ok(migration.includes("DELETE FROM public.solar_return_aspects"));
  assert.ok(migration.includes("DELETE FROM public.solar_return_natal_aspects"));

  const positionsTable = migration.slice(
    migration.indexOf("CREATE TABLE public.solar_return_positions"),
    migration.indexOf("CREATE TABLE public.solar_return_aspects"),
  );
  assert.equal(positionsTable.includes("northNode"), false);
  assert.equal(positionsTable.includes("southNode"), false);
  assert.ok(positionsTable.includes("'chiron'"));
  assert.ok(positionsTable.includes("'ascendant'"));
  assert.ok(
    positionsTable.includes("point IN ('ascendant', 'midheaven')"),
  );

  const natalAspectsTable = migration.slice(
    migration.indexOf("CREATE TABLE public.solar_return_natal_aspects"),
    migration.indexOf("CREATE INDEX solar_returns_client_id_idx"),
  );
  assert.ok(natalAspectsTable.includes("'northNode'"));
  assert.ok(natalAspectsTable.includes("'southNode'"));

  const parentTable = migration.slice(
    migration.indexOf("CREATE TABLE public.solar_returns"),
    migration.indexOf("CREATE TABLE public.solar_return_positions"),
  );
  assert.ok(parentTable.includes("'pluto'"));
  assert.equal(parentTable.includes("'chiron'"), false);
  assert.equal(parentTable.includes("northNode"), false);

  assert.ok(repository.includes("export async function createSolarReturn"));
  assert.ok(repository.includes("export async function updateSolarReturn"));
  assert.ok(repository.includes("export async function listSolarReturnsByClientId"));
  assert.ok(repository.includes("export const getSolarReturnById"));
  assert.ok(repository.includes('supabase.rpc("create_solar_return"'));
  assert.ok(repository.includes('supabase.rpc("update_solar_return"'));
  assert.ok(repository.includes('.from("solar_returns")'));
  assert.ok(repository.includes('.order("period_start", { ascending: false })'));
  assert.ok(repository.includes('.order("created_at", { ascending: false })'));
  assert.ok(repository.includes("solarReturnHouse"));
  assert.ok(repository.includes("natalOverlayHouse"));
  assert.ok(repository.includes("duplicate_period"));
  assert.equal(repository.includes("createSupabaseBrowserClient"), false);
  assert.ok(repository.includes("export async function deleteSolarReturn"));
  assert.ok(repository.includes(".delete()"));
  assert.equal(repository.includes("gemini"), false);

  const persistCreateIndex = actions.indexOf("persistCreate(");
  const persistUpdateIndex = actions.indexOf("persistUpdate(");
  const parseIndex = actions.indexOf("toSolarReturn(input.form)");
  assert.ok(parseIndex >= 0);
  assert.ok(persistCreateIndex > parseIndex);
  assert.ok(persistUpdateIndex > parseIndex);
  assert.ok(actions.includes("createSolarReturnAction"));
  assert.ok(actions.includes("updateSolarReturnAction"));
  assert.ok(actions.includes("deleteSolarReturnAction"));
  assert.equal(actions.includes("generateNatalChart"), false);
  assert.equal(actions.includes("gemini"), false);

  const deleteAction = actions.slice(
    actions.indexOf("export async function deleteSolarReturnAction"),
    actions.indexOf("function revalidateSolarReturnPaths"),
  );
  assert.ok(deleteAction.includes('revalidatePath(`/clients/${input.clientId}`)'));
  assert.ok(
    deleteAction.includes(
      'revalidatePath(`/clients/${input.clientId}/solar-returns`)',
    ),
  );
  assert.ok(deleteAction.includes('"layout"'));
  assert.ok(deleteAction.includes("solar-returns/${input.solarReturnId}"));
}

run();
console.log("solar return persistence tests ok");
