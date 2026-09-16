import assert from "node:assert/strict";
import { createSampleTransitAnalysisReport } from "../sample";
import { TRANSIT_ANALYSIS_REPORT_SECTION_IDS } from "../constants";
import {
  buildTransitClientReportSnapshot,
  canExecuteRefreshTransitClientReportFromProfessional,
  shouldOfferRefreshTransitClientReportFromProfessional,
  toTransitClientReport,
  toTransitClientReportRefreshWrite,
} from "./from-professional";
import { isTransitClientReportSourceOutdated } from "./source-outdated";
import {
  getTransitProfessionalReportNextStep,
  shouldOfferPrepareTransitClientReport,
} from "./primary-action";

function run() {
  const professional = createSampleTransitAnalysisReport();
  const editedProfessional = {
    ...professional,
    mandalaImpact: {
      ...professional.mandalaImpact,
      content: "Contenido profesional editado por Paula.",
    },
  };

  const rejectedDraft = buildTransitClientReportSnapshot({
    professionalReport: editedProfessional,
    professionalStatus: "draft",
  });
  assert.equal(rejectedDraft.status, "not_ready");
  assert.equal("clientReport" in rejectedDraft, false);
  assert.equal("sourceReport" in rejectedDraft, false);

  const rejectedReviewed = buildTransitClientReportSnapshot({
    professionalReport: editedProfessional,
    professionalStatus: "reviewed",
  });
  assert.equal(rejectedReviewed.status, "not_ready");

  assert.equal(
    shouldOfferPrepareTransitClientReport({
      status: "draft",
      hasClientReport: false,
    }),
    false,
  );
  assert.equal(
    shouldOfferPrepareTransitClientReport({
      status: "reviewed",
      hasClientReport: false,
    }),
    false,
  );
  assert.equal(
    shouldOfferPrepareTransitClientReport({
      status: "ready",
      hasClientReport: false,
    }),
    true,
  );
  assert.equal(
    shouldOfferPrepareTransitClientReport({
      status: "ready",
      hasClientReport: true,
    }),
    false,
  );
  assert.equal(
    getTransitProfessionalReportNextStep({
      status: "draft",
      hasClientReport: false,
    }),
    "Marcá el informe profesional como Listo para entregar antes de preparar la versión consultante.",
  );
  assert.equal(
    getTransitProfessionalReportNextStep({
      status: "reviewed",
      hasClientReport: false,
    }),
    "Marcá el informe profesional como Listo para entregar antes de preparar la versión consultante.",
  );

  const created = buildTransitClientReportSnapshot({
    professionalReport: editedProfessional,
    professionalStatus: "ready",
  });
  assert.equal(created.status, "ok");
  if (created.status !== "ok") {
    throw new Error("expected a successful client report");
  }

  assert.deepEqual(created.sourceReport, editedProfessional);
  assert.notDeepEqual(created.sourceReport, professional);

  for (const sectionId of TRANSIT_ANALYSIS_REPORT_SECTION_IDS) {
    assert.equal(
      created.clientReport[sectionId].content,
      editedProfessional[sectionId].content,
    );
    assert.equal("astrologicalBasis" in created.clientReport[sectionId], false);
  }

  assert.equal(
    JSON.stringify(created.clientReport).includes("astrologicalBasis"),
    false,
  );
  assert.equal("metadata" in created.clientReport, false);

  const before = structuredClone(editedProfessional);
  const transformed = toTransitClientReport(editedProfessional);
  transformed.mandalaImpact.content = "mutación del output";
  assert.deepEqual(editedProfessional, before);
  assert.equal(
    editedProfessional.mandalaImpact.astrologicalBasis.length > 0,
    true,
  );
  assert.equal("astrologicalBasis" in transformed.mandalaImpact, false);

  assert.equal(shouldOfferRefreshTransitClientReportFromProfessional(false), false);
  assert.equal(
    canExecuteRefreshTransitClientReportFromProfessional({
      sourceOutdated: false,
      professionalStatus: "ready",
    }),
    false,
  );
  assert.equal(shouldOfferRefreshTransitClientReportFromProfessional(true), true);
  assert.equal(
    canExecuteRefreshTransitClientReportFromProfessional({
      sourceOutdated: true,
      professionalStatus: "draft",
    }),
    false,
  );
  assert.equal(
    canExecuteRefreshTransitClientReportFromProfessional({
      sourceOutdated: true,
      professionalStatus: "reviewed",
    }),
    false,
  );
  assert.equal(
    canExecuteRefreshTransitClientReportFromProfessional({
      sourceOutdated: true,
      professionalStatus: "ready",
    }),
    true,
  );

  const rejectedRefreshDraft = buildTransitClientReportSnapshot({
    professionalReport: editedProfessional,
    professionalStatus: "draft",
  });
  assert.equal(rejectedRefreshDraft.status, "not_ready");
  assert.equal("sourceReport" in rejectedRefreshDraft, false);
  assert.equal("clientReport" in rejectedRefreshDraft, false);

  const rejectedRefreshReviewed = buildTransitClientReportSnapshot({
    professionalReport: editedProfessional,
    professionalStatus: "reviewed",
  });
  assert.equal(rejectedRefreshReviewed.status, "not_ready");

  const manualClient = toTransitClientReport(professional);
  manualClient.learnings.content = "Cambio manual de Paula en la versión consultante.";

  const refreshed = buildTransitClientReportSnapshot({
    professionalReport: editedProfessional,
    professionalStatus: "ready",
  });
  assert.equal(refreshed.status, "ok");
  if (refreshed.status !== "ok") {
    throw new Error("expected a successful refresh snapshot");
  }

  const write = toTransitClientReportRefreshWrite(refreshed);
  assert.deepEqual(Object.keys(write).sort(), ["client_report", "source_report"]);
  assert.deepEqual(write.source_report, editedProfessional);
  assert.equal(
    write.client_report.mandalaImpact.content,
    editedProfessional.mandalaImpact.content,
  );
  assert.notEqual(
    write.client_report.learnings.content,
    manualClient.learnings.content,
  );
  assert.equal(
    JSON.stringify(write.client_report).includes("astrologicalBasis"),
    false,
  );
  assert.equal(
    isTransitClientReportSourceOutdated(
      write.source_report,
      editedProfessional,
    ),
    false,
  );
}

run();
console.log("transit client report transformer tests ok");
