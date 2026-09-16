import assert from "node:assert/strict";
import {
  PROFESSIONAL_PDF_DOWNLOAD_LABEL,
  getProfessionalActionHierarchy,
} from "./professional-actions";

function run() {
  assert.equal(PROFESSIONAL_PDF_DOWNLOAD_LABEL, "Descargar PDF");

  const draft = getProfessionalActionHierarchy({
    status: "draft",
    hasClientReport: false,
  });
  assert.equal(draft.editVariant, "secondary");
  assert.equal(draft.pdfVariant, "primary");
  assert.equal(draft.prepareVariant, null);

  const reviewed = getProfessionalActionHierarchy({
    status: "reviewed",
    hasClientReport: false,
  });
  assert.equal(reviewed.editVariant, "secondary");
  assert.equal(reviewed.pdfVariant, "primary");
  assert.equal(reviewed.prepareVariant, null);

  const readyWithoutClient = getProfessionalActionHierarchy({
    status: "ready",
    hasClientReport: false,
  });
  assert.equal(readyWithoutClient.prepareVariant, "secondary");
  assert.equal(readyWithoutClient.pdfVariant, "primary");
  assert.equal(readyWithoutClient.editVariant, "secondary");

  const readyWithClient = getProfessionalActionHierarchy({
    status: "ready",
    hasClientReport: true,
  });
  assert.equal(readyWithClient.prepareVariant, null);
  assert.equal(readyWithClient.pdfVariant, "primary");
  assert.equal(readyWithClient.editVariant, "secondary");
}

run();
console.log("professional action hierarchy tests ok");
