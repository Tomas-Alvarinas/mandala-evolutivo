import assert from "node:assert/strict";
import { getClientReportWebPresentation } from "./prepare-web";
import { createPdfLayoutSampleReport } from "./pdf-sample-report";

function run() {
  const sample = createPdfLayoutSampleReport();
  const presentation = getClientReportWebPresentation(sample);

  assert.equal(presentation.hideIntroduction, true);
  assert.equal(presentation.hideClosing, true);

  const unique = {
    ...sample,
    introduction: { content: "Una introducción distinta." },
    closing: { content: "Un cierre distinto." },
  };

  const uniquePresentation = getClientReportWebPresentation(unique);
  assert.equal(uniquePresentation.hideIntroduction, false);
  assert.equal(uniquePresentation.hideClosing, false);
}

run();
console.log("client-report web presentation tests ok");
