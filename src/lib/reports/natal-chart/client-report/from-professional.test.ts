import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createProfessionalPdfSampleReport } from "@/lib/reports/natal-chart/professional-pdf/sample";
import { buildNatalChartClientReport } from "./build";
import { areNatalChartValuesStructurallyEqual } from "./equality";
import {
  buildClientReportSnapshotFromProfessional,
  canExecuteRefreshClientReportFromProfessional,
  shouldOfferRefreshClientReportFromProfessional,
  toClientReportRefreshWrite,
} from "./from-professional";

const CLIENT_NAME = "Tomas Alvariñas";
const CREATED_AT = "2026-08-28T18:00:00.000Z";
const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

function run() {
  const professional = createProfessionalPdfSampleReport();
  const outdatedProfessional = {
    ...professional,
    identity: {
      ...professional.identity,
      content: "Identidad profesional actualizada para el refresh.",
    },
  };

  // CASO 1: sourceOutdated false → no action
  assert.equal(shouldOfferRefreshClientReportFromProfessional(false), false);
  assert.equal(
    canExecuteRefreshClientReportFromProfessional({
      sourceOutdated: false,
      professionalStatus: "ready",
    }),
    false,
  );

  // CASO 2: sourceOutdated true + reviewed/draft → rejected, no write
  assert.equal(shouldOfferRefreshClientReportFromProfessional(true), true);
  assert.equal(
    canExecuteRefreshClientReportFromProfessional({
      sourceOutdated: true,
      professionalStatus: "reviewed",
    }),
    false,
  );

  const rejectedReviewed = buildClientReportSnapshotFromProfessional({
    professionalReport: outdatedProfessional,
    professionalStatus: "reviewed",
    clientName: CLIENT_NAME,
    createdAt: CREATED_AT,
  });
  assert.equal(rejectedReviewed.status, "not_ready");
  assert.equal("sourceReport" in rejectedReviewed, false);
  assert.equal("clientReport" in rejectedReviewed, false);

  const rejectedDraft = buildClientReportSnapshotFromProfessional({
    professionalReport: outdatedProfessional,
    professionalStatus: "draft",
    clientName: CLIENT_NAME,
    createdAt: CREATED_AT,
  });
  assert.equal(rejectedDraft.status, "not_ready");

  // CASO 3: sourceOutdated true + ready → source_report and client_report together
  const refreshed = buildClientReportSnapshotFromProfessional({
    professionalReport: outdatedProfessional,
    professionalStatus: "ready",
    clientName: CLIENT_NAME,
    createdAt: CREATED_AT,
  });
  assert.equal(refreshed.status, "ok");
  if (refreshed.status !== "ok") {
    throw new Error("expected a successful rebuild");
  }

  const write = toClientReportRefreshWrite(refreshed);
  assert.deepEqual(Object.keys(write).sort(), [
    "client_report",
    "source_report",
  ]);
  assert.equal(
    areNatalChartValuesStructurallyEqual(
      write.source_report,
      outdatedProfessional,
    ),
    true,
  );

  const identitySection = write.client_report.sections.find(
    (section) => section.sourceSectionId === "identity",
  );
  assert.equal(identitySection?.kind, "narrative");
  if (identitySection?.kind === "narrative") {
    assert.equal(
      identitySection.content,
      "Identidad profesional actualizada para el refresh.",
    );
  }

  // CASO 4: after the update, sourceOutdated is false
  assert.equal(
    areNatalChartValuesStructurallyEqual(
      refreshed.sourceReport,
      outdatedProfessional,
    ),
    true,
  );
  assert.equal(
    shouldOfferRefreshClientReportFromProfessional(
      !areNatalChartValuesStructurallyEqual(
        refreshed.sourceReport,
        outdatedProfessional,
      ),
    ),
    false,
  );

  // CASO 5: same transformer as initial creation
  const created = buildNatalChartClientReport({
    report: outdatedProfessional,
    clientName: CLIENT_NAME,
    createdAt: CREATED_AT,
  });
  assert.deepEqual(refreshed.clientReport, created);

  // CASO 6: no Gemini
  const refreshSource = readFileSync(
    path.join(DIRNAME, "from-professional.ts"),
    "utf8",
  );
  const repositorySource = readFileSync(path.join(DIRNAME, "repository.ts"), "utf8");
  const actionSource = readFileSync(path.join(DIRNAME, "actions.ts"), "utf8");
  for (const source of [refreshSource, repositorySource, actionSource]) {
    assert.doesNotMatch(source, /@\/lib\/ai\/gemini/);
    assert.doesNotMatch(source, /generateNatalChart/);
    assert.doesNotMatch(source, /@google\/genai/);
  }

  // CASO 7: a failed rebuild does not produce a partial write
  const invalid = buildClientReportSnapshotFromProfessional({
    professionalReport: { identity: "broken" },
    professionalStatus: "ready",
    clientName: CLIENT_NAME,
    createdAt: CREATED_AT,
  });
  assert.equal(invalid.status, "invalid");
  assert.equal("sourceReport" in invalid, false);
  assert.equal("clientReport" in invalid, false);
}

run();
console.log("client-report refresh tests ok");
