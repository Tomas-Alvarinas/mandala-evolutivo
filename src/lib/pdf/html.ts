import { PDF_DOCUMENT_CSS } from "@/components/reports/pdf/document-styles";
import { pdfPageCss } from "./page-layout";

export function wrapPdfDocumentHtml(
  title: string,
  markup: string,
  variant: "cover" | "body" = "body",
) {
  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>${PDF_DOCUMENT_CSS}${pdfPageCss(variant)}</style>
  </head>
  <body class="pdf-${variant}">
    ${markup}
  </body>
</html>`;
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
