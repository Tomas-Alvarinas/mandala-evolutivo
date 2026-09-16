import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIRNAME, "../../../../..");

function run() {
  const repository = readFileSync(path.join(DIRNAME, "repository.ts"), "utf8");
  const natalMigration = readFileSync(
    path.join(
      ROOT,
      "supabase/migrations/20260827234000_create_natal_chart_client_reports.sql",
    ),
    "utf8",
  );
  const transitRepository = readFileSync(
    path.join(
      ROOT,
      "src/lib/reports/transits/client-report/repository.ts",
    ),
    "utf8",
  );

  const createFn = repository.slice(
    repository.indexOf("export async function createNatalChartClientReport"),
    repository.indexOf("export async function getNatalChartClientReport"),
  );

  assert.ok(createFn.includes('if (existing.status === "ok")'));
  assert.ok(createFn.includes('return { status: "ok", data: existing.data.id }'));
  assert.ok(
    createFn.includes(
      'if (existing.status === "ok") {\n    return { status: "ok", data: existing.data.id };',
    ),
  );
  assert.ok(createFn.includes('error.code === "23505"'));
  assert.ok(createFn.includes("const raced = await getNatalChartClientReport"));
  assert.ok(createFn.includes('return { status: "ok", data: raced.data.id }'));
  assert.equal(createFn.split(".insert({").length - 1, 1);

  assert.ok(natalMigration.includes("natal_chart_report_id uuid NOT NULL UNIQUE"));
  assert.ok(natalMigration.includes("CREATE TABLE public.natal_chart_client_reports"));

  const transitCreateFn = transitRepository.slice(
    transitRepository.indexOf("export async function createTransitClientReport"),
    transitRepository.indexOf(
      "export async function getTransitClientReportByProfessionalReportId",
    ),
  );
  assert.ok(transitCreateFn.includes('if (existing.status === "ok")'));
  assert.ok(
    transitCreateFn.includes("return { status: \"ok\", data: existing.data.id }"),
  );
  assert.ok(transitCreateFn.includes('error.code === "23505"'));
  assert.ok(
    transitCreateFn.includes(
      "return { status: \"ok\", data: raced.data.id }",
    ),
  );
}

run();
console.log("natal client report create idempotency tests ok");
