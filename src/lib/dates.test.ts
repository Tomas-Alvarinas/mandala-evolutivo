import assert from "node:assert/strict";
import {
  formatDateTimeEs,
  formatGeneratedOnEs,
  formatLongDateEs,
  formatNumericDateEs,
} from "./dates";

function run() {
  const iso = "2026-09-08T16:42:00.000Z";

  assert.equal(formatLongDateEs(iso), "8 de septiembre de 2026");
  assert.equal(formatGeneratedOnEs(iso), "Generado el 8 de septiembre de 2026");
  assert.equal(formatNumericDateEs(iso), "08/09/2026");
  assert.equal(formatDateTimeEs(iso), "08/09/2026, 13:42");
  assert.equal(formatLongDateEs("no-es-fecha"), "");
  assert.equal(formatGeneratedOnEs("no-es-fecha"), "");
}

run();
console.log("date format tests ok");
