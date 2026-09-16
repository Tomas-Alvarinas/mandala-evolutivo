import assert from "node:assert/strict";
import { createSampleSolarReturnReport } from "../sample";
import { SOLAR_RETURN_REPORT_SECTION_IDS } from "../constants";
import {
  buildSolarReturnClientReportSnapshot,
  canExecuteRefreshSolarReturnClientReportFromProfessional,
  shouldOfferRefreshSolarReturnClientReportFromProfessional,
  toSolarReturnClientReport,
  toSolarReturnClientReportRefreshWrite,
} from "./from-professional";
import { isSolarReturnClientReportSourceOutdated } from "./source-outdated";
import {
  getSolarReturnProfessionalReportNextStep,
  shouldOfferPrepareSolarReturnClientReport,
} from "./primary-action";

function run() {
  const professional = createSampleSolarReturnReport();
  const editedProfessional = {
    ...professional,
    annualTheme: {
      ...professional.annualTheme,
      content: "Contenido profesional editado por Paula.",
    },
  };

  const rejectedDraft = buildSolarReturnClientReportSnapshot({
    professionalReport: editedProfessional,
    professionalStatus: "draft",
  });
  assert.equal(rejectedDraft.status, "not_ready");
  assert.equal("clientReport" in rejectedDraft, false);
  assert.equal("sourceReport" in rejectedDraft, false);

  const rejectedReviewed = buildSolarReturnClientReportSnapshot({
    professionalReport: editedProfessional,
    professionalStatus: "reviewed",
  });
  assert.equal(rejectedReviewed.status, "not_ready");

  assert.equal(
    shouldOfferPrepareSolarReturnClientReport({
      status: "draft",
      hasClientReport: false,
    }),
    false,
  );
  assert.equal(
    shouldOfferPrepareSolarReturnClientReport({
      status: "reviewed",
      hasClientReport: false,
    }),
    false,
  );
  assert.equal(
    shouldOfferPrepareSolarReturnClientReport({
      status: "ready",
      hasClientReport: false,
    }),
    true,
  );
  assert.equal(
    shouldOfferPrepareSolarReturnClientReport({
      status: "ready",
      hasClientReport: true,
    }),
    false,
  );
  assert.equal(
    getSolarReturnProfessionalReportNextStep({
      status: "draft",
      hasClientReport: false,
    }),
    "Marcá el informe profesional como Listo para entregar antes de preparar la versión consultante.",
  );
  assert.equal(
    getSolarReturnProfessionalReportNextStep({
      status: "reviewed",
      hasClientReport: false,
    }),
    "Marcá el informe profesional como Listo para entregar antes de preparar la versión consultante.",
  );

  const created = buildSolarReturnClientReportSnapshot({
    professionalReport: editedProfessional,
    professionalStatus: "ready",
  });
  assert.equal(created.status, "ok");
  if (created.status !== "ok") {
    throw new Error("expected a successful client report");
  }

  assert.deepEqual(created.sourceReport, editedProfessional);
  assert.notDeepEqual(created.sourceReport, professional);

  for (const sectionId of SOLAR_RETURN_REPORT_SECTION_IDS) {
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
  const transformed = toSolarReturnClientReport(editedProfessional);
  transformed.annualTheme.content = "mutación del output";
  assert.deepEqual(editedProfessional, before);
  assert.equal(
    editedProfessional.annualTheme.astrologicalBasis.length > 0,
    true,
  );
  assert.equal("astrologicalBasis" in transformed.annualTheme, false);

  assert.equal(
    shouldOfferRefreshSolarReturnClientReportFromProfessional(false),
    false,
  );
  assert.equal(
    canExecuteRefreshSolarReturnClientReportFromProfessional({
      sourceOutdated: false,
      professionalStatus: "ready",
    }),
    false,
  );
  assert.equal(
    shouldOfferRefreshSolarReturnClientReportFromProfessional(true),
    true,
  );
  assert.equal(
    canExecuteRefreshSolarReturnClientReportFromProfessional({
      sourceOutdated: true,
      professionalStatus: "draft",
    }),
    false,
  );
  assert.equal(
    canExecuteRefreshSolarReturnClientReportFromProfessional({
      sourceOutdated: true,
      professionalStatus: "reviewed",
    }),
    false,
  );
  assert.equal(
    canExecuteRefreshSolarReturnClientReportFromProfessional({
      sourceOutdated: true,
      professionalStatus: "ready",
    }),
    true,
  );

  const rejectedRefreshDraft = buildSolarReturnClientReportSnapshot({
    professionalReport: editedProfessional,
    professionalStatus: "draft",
  });
  assert.equal(rejectedRefreshDraft.status, "not_ready");
  assert.equal("sourceReport" in rejectedRefreshDraft, false);
  assert.equal("clientReport" in rejectedRefreshDraft, false);

  const rejectedRefreshReviewed = buildSolarReturnClientReportSnapshot({
    professionalReport: editedProfessional,
    professionalStatus: "reviewed",
  });
  assert.equal(rejectedRefreshReviewed.status, "not_ready");

  const manualClient = toSolarReturnClientReport(professional);
  manualClient.learnings.content =
    "Cambio manual de Paula en la versión consultante.";

  const refreshed = buildSolarReturnClientReportSnapshot({
    professionalReport: editedProfessional,
    professionalStatus: "ready",
  });
  assert.equal(refreshed.status, "ok");
  if (refreshed.status !== "ok") {
    throw new Error("expected a successful refresh snapshot");
  }

  const write = toSolarReturnClientReportRefreshWrite(refreshed);
  assert.deepEqual(Object.keys(write).sort(), ["client_report", "source_report"]);
  assert.deepEqual(write.source_report, editedProfessional);
  assert.equal(
    write.client_report.annualTheme.content,
    editedProfessional.annualTheme.content,
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
    isSolarReturnClientReportSourceOutdated(
      write.source_report,
      editedProfessional,
    ),
    false,
  );
}

run();
console.log("solar return client report transformer tests ok");
