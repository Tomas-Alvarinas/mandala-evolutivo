export const PDF_COVER_MARGIN = {
  top: "22mm",
  bottom: "22mm",
  left: "20mm",
  right: "20mm",
} as const;

export const PDF_BODY_MARGIN = {
  top: "24mm",
  bottom: "28mm",
  left: "20mm",
  right: "20mm",
} as const;

export const PDF_FOOTER = {
  fontSize: "8.5px",
  color: "#8a7d74",
  padding: "0 20mm 11mm",
} as const;

export function pdfPageCss(variant: "cover" | "body") {
  const margin = variant === "cover" ? PDF_COVER_MARGIN : PDF_BODY_MARGIN;
  return `@page { size: A4; margin: ${margin.top} ${margin.right} ${margin.bottom} ${margin.left}; }`;
}

export function pdfFooterTemplate(escapedLeft: string) {
  return `<div style="box-sizing:border-box;width:100%;padding:${PDF_FOOTER.padding};font-size:${PDF_FOOTER.fontSize};color:${PDF_FOOTER.color};font-family:Segoe UI,Helvetica Neue,Arial,sans-serif;letter-spacing:0.04em;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;">
          <span style="min-width:0;">${escapedLeft}</span>
          <span style="flex:none;padding-left:12px;"><span class="pageNumber"></span></span>
        </div>
      </div>`;
}

export function pdfClientReportFooterTemplate(escapedCreditLine: string) {
  return `<div style="box-sizing:border-box;width:100%;padding:${PDF_FOOTER.padding};font-size:${PDF_FOOTER.fontSize};color:${PDF_FOOTER.color};font-family:Segoe UI,Helvetica Neue,Arial,sans-serif;letter-spacing:0.01em;">
        <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:20px;width:100%;">
          <span style="min-width:0;flex:1 1 auto;line-height:1.35;">${escapedCreditLine}</span>
          <span style="flex:none;min-width:2.5em;padding-left:16px;text-align:right;"><span class="pageNumber"></span></span>
        </div>
      </div>`;
}
