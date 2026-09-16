export const PDF_DOCUMENT_CSS = `
  :root {
    --ink: #3a312a;
    --muted: #6f645b;
    --line: #e4d9ce;
    --paper: #fffcf8;
    --accent: #8a5a44;
    --soft: #f4ece4;

    --measure: 148mm;
    --section-gap: 46pt;
    --intro-gap: 40pt;
    --heading-gap: 18pt;
    --block-gap: 20pt;
    --list-gap: 13pt;
    --question-gap: 20pt;
    --action-gap: 15pt;
    --group-gap: 28pt;
    --mandala-gap: 26pt;
    --mandala-pad: 22pt 24pt 24pt;
    --astro-gap: 22pt;
    --astro-pad: 12pt 14pt 12pt 16pt;
    --cover-kicker-gap: 28pt;
    --cover-subtitle-gap: 16pt;
    --cover-name-gap: 36pt;
    --cover-date-gap: 14pt;
    --cover-mark-gap: 36pt;
    --body-size: 11pt;
    --body-leading: 1.72;
  }

  * {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    background: #fff;
    color: var(--ink);
    font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    font-size: var(--body-size);
    line-height: var(--body-leading);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .document {
    color: var(--ink);
  }

  .cover {
    height: 253mm;
    min-height: 253mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .cover-kicker {
    margin: 0;
    font-size: 9pt;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .cover-title {
    margin: var(--cover-kicker-gap) 0 0;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 28pt;
    font-weight: 500;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .cover-subtitle {
    margin: var(--cover-subtitle-gap) 0 0;
    max-width: 118mm;
    font-size: 12pt;
    line-height: 1.5;
    color: var(--muted);
  }

  .cover-name {
    margin: var(--cover-name-gap) 0 0;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 16pt;
    line-height: 1.35;
  }

  .cover-date {
    margin: var(--cover-date-gap) 0 0;
    font-size: 10.5pt;
    letter-spacing: 0.02em;
    color: var(--muted);
  }

  .cover-mark {
    margin-bottom: var(--cover-mark-gap);
  }

  .section {
    max-width: var(--measure);
    margin: 0 auto var(--section-gap);
    break-inside: auto;
    page-break-inside: auto;
  }

  .section:first-child {
    margin-top: 0;
  }

  .section-keep {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .heading-block {
    break-inside: avoid;
    page-break-inside: avoid;
    break-after: avoid-page;
    page-break-after: avoid;
  }

  /* Reserve title + ~5–7 body lines so Chromium moves the section
     start instead of leaving a heading with only a few lines. */
  .heading-block::after {
    content: "";
    display: block;
    height: 12em;
    margin-bottom: -12em;
  }

  .section-title {
    margin: 0 0 var(--heading-gap);
    font-family: Georgia, "Times New Roman", serif;
    font-size: 16pt;
    font-weight: 500;
    line-height: 1.3;
    break-after: avoid-page;
    page-break-after: avoid;
  }

  .prose {
    margin: 0;
    max-width: var(--measure);
    white-space: pre-wrap;
    line-height: 1.75;
    orphans: 4;
    widows: 3;
  }

  .intro {
    margin-top: 0;
    margin-bottom: var(--intro-gap);
  }

  .closing {
    margin-top: var(--block-gap);
    margin-bottom: 8pt;
    padding-top: 28pt;
    border-top: 1px solid var(--line);
  }

  .list-block {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .list-block-allow-break {
    break-inside: auto;
    page-break-inside: auto;
  }

  .list {
    margin: 4pt 0 0;
    padding-left: 16pt;
    list-style-type: disc;
  }

  .list li {
    margin: 0 0 var(--list-gap);
    padding-left: 3pt;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .list-questions li {
    margin: 0 0 var(--question-gap);
  }

  .list-numbered {
    padding-left: 22pt;
    list-style-type: decimal;
  }

  .list-numbered li {
    margin: 0 0 var(--action-gap);
    padding-left: 4pt;
  }

  .word-list {
    margin: 6pt 0 0;
    padding: 0;
    list-style: none;
  }

  .word-list li {
    margin: 0 0 11pt;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 12pt;
    line-height: 1.4;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .group-label {
    margin: 0 0 12pt;
    font-size: 8.5pt;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--muted);
    break-after: avoid;
    page-break-after: avoid;
  }

  .group + .group {
    margin-top: var(--group-gap);
  }

  .resource-item {
    margin: 0 0 14pt;
    padding: 0 0 14pt;
    border-bottom: 1px solid var(--line);
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .resource-item:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  .resource-name {
    margin: 0;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 12pt;
    line-height: 1.35;
  }

  .resource-meaning {
    margin: 6pt 0 0;
    color: var(--muted);
    white-space: pre-wrap;
    line-height: 1.6;
  }

  .section-mandala {
    break-before: page;
    page-break-before: always;
    margin-top: 0;
    margin-bottom: var(--section-gap);
  }

  .mandala {
    break-inside: auto;
    page-break-inside: auto;
  }

  .mandala-block {
    border: 1px solid var(--line);
    border-radius: 12pt;
    background: var(--soft);
    padding: var(--mandala-pad);
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .mandala-block + .mandala-block {
    margin-top: var(--mandala-gap);
  }

  .mandala-label {
    margin: 0 0 12pt;
    font-size: 8.5pt;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--accent);
    break-after: avoid;
    page-break-after: avoid;
  }

  .astro-basis {
    margin-top: var(--astro-gap);
    max-width: var(--measure);
    padding: var(--astro-pad);
    background: var(--soft);
    border-left: 2pt solid var(--line);
    border-radius: 0 6pt 6pt 0;
    break-inside: auto;
    page-break-inside: auto;
  }

  .astro-basis-keep {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .astro-basis-label {
    margin: 0 0 8pt;
    font-size: 8pt;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
    break-after: avoid;
    page-break-after: avoid;
  }

  .astro-basis-list {
    margin: 0;
    padding-left: 14pt;
    list-style-type: disc;
    font-size: 9.5pt;
    line-height: 1.55;
    color: var(--muted);
  }

  .astro-basis-list li {
    margin: 0 0 6pt;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .astro-basis-list li:last-child {
    margin-bottom: 0;
  }

  .section:has(.tech-meta) {
    margin-bottom: 0;
  }

  /* Last section only: drop the heading spacer so its reservation
     cannot push Datos técnicos onto a nearly empty following page. */
  .section:has(.tech-meta) .heading-block::after {
    content: none;
    height: 0;
    margin-bottom: 0;
  }

  .section:has(.tech-meta) .heading-block {
    break-after: auto;
    page-break-after: auto;
  }

  .section:has(.tech-meta) .astro-basis {
    margin-top: 16pt;
  }

  .tech-meta {
    max-width: var(--measure);
    margin: 6pt auto 0;
    padding-top: 4pt;
    border-top: 1px solid var(--line);
    break-inside: auto;
    page-break-inside: auto;
    break-before: auto;
    page-break-before: auto;
  }

  .tech-meta-label {
    margin: 0 0 6pt;
    font-size: 8pt;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .tech-meta p {
    margin: 0 0 2pt;
    font-size: 9pt;
    line-height: 1.5;
    color: var(--muted);
  }

  .tech-meta p:last-child {
    margin-bottom: 0;
  }
`;
