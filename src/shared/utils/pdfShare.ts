// src/shared/utils/pdfShare.ts
// Renders a sectioned PDF and shares it.
//
// Native: expo-print (HTML → PDF) + native share sheet.
// Web:    pdf-lib (primitives → PDF) + Web Share API (navigator.share with a
//         File opens the real iOS share sheet in an installed PWA). Falls back
//         to opening the PDF blob in a new tab if file-sharing isn't supported.
//         expo-print is NOT used on web — printToFileAsync there triggers the
//         browser print dialog instead of returning a shareable file.
//
// Two entry points:
//   shareInfoCardPdf  — legacy single-table info card
//   sharePdfDocument  — multi-section document (Appointment Packs)

import { Platform, Share } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface PdfRow {
  label: string;
  value: string;
}

// Back-compat alias — InfoCardScreen imports this name.
export type InfoCardPdfRow = PdfRow;

// A section is either label/value rows, or a bulleted list of lines.
export type PdfSection =
  | { kind: 'rows'; heading: string; rows: PdfRow[] }
  | { kind: 'list'; heading: string; items: PdfListItem[] }
  | { kind: 'text'; heading: string; body: string };

export interface PdfListItem {
  primary: string;
  secondary?: string | null;
}

export interface PdfDocument {
  title: string;      // e.g. person name
  subtitle: string;   // e.g. "Appointment Pack · Dr Smith · 14 Jul 2026"
  sections: PdfSection[];
}

// ── HTML (native) ──────────────────────────────────────────────────────────────

const STYLES = `
  * { font-family: -apple-system, Helvetica, Arial, sans-serif; }
  body { padding: 32px; color: #17211C; }
  h1 { font-size: 22px; font-weight: 600; margin: 0 0 4px; }
  .sub { font-size: 12px; color: #5F5B55; margin: 0 0 24px; }
  h2 {
    font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.8px; color: #1F5C41;
    margin: 24px 0 8px; padding-bottom: 5px;
    border-bottom: 1px solid #1F5C41;
  }
  section { page-break-inside: avoid; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 9px 8px; border-bottom: 1px solid #ECE8E1; font-size: 13px; vertical-align: top; }
  .l { color: #5F5B55; width: 40%; }
  .v { color: #17211C; font-weight: 500; }
  ul { margin: 0; padding: 0; list-style: none; }
  li { padding: 9px 8px; border-bottom: 1px solid #ECE8E1; font-size: 13px; }
  .p { color: #17211C; font-weight: 500; }
  .s { color: #4A4640; font-size: 12px; margin-top: 2px; }
  .empty { color: #5F5B55; font-size: 13px; padding: 9px 8px; }
  .tx { color: #17211C; font-size: 13px; line-height: 19px; margin: 0 0 6px; padding: 0 8px; }
  .foot { margin-top: 32px; font-size: 10px; color: #8A857E; }
`;

function renderRows(rows: PdfRow[]): string {
  if (rows.length === 0) return `<p class="empty">Nothing recorded.</p>`;
  const body = rows
    .map(
      (r) =>
        `<tr><td class="l">${escapeHtml(r.label)}</td><td class="v">${escapeHtml(r.value)}</td></tr>`,
    )
    .join('');
  return `<table>${body}</table>`;
}

function renderList(items: PdfListItem[]): string {
  if (items.length === 0) return `<p class="empty">Nothing recorded.</p>`;
  const body = items
    .map((i) => {
      const sec = i.secondary ? `<div class="s">${escapeHtml(i.secondary)}</div>` : '';
      return `<li><div class="p">${escapeHtml(i.primary)}</div>${sec}</li>`;
    })
    .join('');
  return `<ul>${body}</ul>`;
}

function renderText(body: string): string {
  if (!body.trim()) return `<p class="empty">Nothing recorded.</p>`;
  const paras = body
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => `<p class="tx">${escapeHtml(l)}</p>`)
    .join('');
  return paras;
}

function renderSection(s: PdfSection): string {
  const inner =
    s.kind === 'rows' ? renderRows(s.rows)
    : s.kind === 'list' ? renderList(s.items)
    : renderText(s.body);
  return `<section><h2>${escapeHtml(s.heading)}</h2>${inner}</section>`;
}

function buildDocumentHtml(doc: PdfDocument, footer: string): string {
  const sections = doc.sections.map(renderSection).join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8" />
  <style>${STYLES}</style></head>
  <body>
    <h1>${escapeHtml(doc.title)}</h1>
    <p class="sub">${escapeHtml(doc.subtitle)}</p>
    ${sections}
    <p class="foot">${escapeHtml(footer)}</p>
  </body></html>`;
}

// ── pdf-lib renderer (web) ─────────────────────────────────────────────────────
// expo-print is unusable on web (it prints instead of returning a file), so on
// web we draw the PDF from primitives with pdf-lib and share the bytes.

const A4 = { w: 595.28, h: 841.89 };
const INK = rgb(0.09, 0.13, 0.11);
const GREY = rgb(0.37, 0.36, 0.33);
const GREEN = rgb(0.122, 0.361, 0.255);
const HAIR = rgb(0.925, 0.91, 0.882);
const MARGIN = 40;

interface WebFont {
  widthOfTextAtSize(text: string, size: number): number;
}

function wrapText(text: string, font: WebFont, size: number, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

async function buildDocumentPdfBytes(doc: PdfDocument, footer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const contentW = A4.w - MARGIN * 2;

  let page = pdf.addPage([A4.w, A4.h]);
  let y = A4.h - MARGIN;

  const ensure = (needed: number) => {
    if (y - needed < MARGIN + 24) {
      page = pdf.addPage([A4.w, A4.h]);
      y = A4.h - MARGIN;
    }
  };

  // Header
  page.drawText(doc.title, { x: MARGIN, y: y - 20, size: 20, font: bold, color: INK });
  y -= 28;
  for (const ln of wrapText(doc.subtitle, font, 11, contentW)) {
    page.drawText(ln, { x: MARGIN, y: y - 12, size: 11, font, color: GREY });
    y -= 15;
  }
  y -= 12;

  const labelW = contentW * 0.4;
  const valueX = MARGIN + labelW + 10;
  const valueW = contentW - labelW - 10;

  const drawHeading = (heading: string) => {
    ensure(28);
    page.drawText(heading.toUpperCase(), { x: MARGIN, y: y - 11, size: 10, font: bold, color: GREEN });
    y -= 16;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: A4.w - MARGIN, y }, thickness: 1, color: GREEN });
    y -= 10;
  };

  const drawRowPair = (label: string, value: string) => {
    const valueLines = wrapText(value, bold, 11, valueW);
    const rowH = Math.max(1, valueLines.length) * 15 + 6;
    ensure(rowH);
    page.drawText(label, { x: MARGIN, y: y - 12, size: 11, font, color: GREY });
    valueLines.forEach((ln, idx) => {
      page.drawText(ln, { x: valueX, y: y - 12 - idx * 15, size: 11, font: bold, color: INK });
    });
    y -= rowH;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: A4.w - MARGIN, y }, thickness: 0.5, color: HAIR });
    y -= 5;
  };

  const drawFullLine = (primary: string, secondary?: string | null) => {
    const pLines = wrapText(primary, bold, 12, contentW);
    const sLines = secondary ? wrapText(secondary, font, 11, contentW) : [];
    const rowH = pLines.length * 15 + sLines.length * 14 + 8;
    ensure(rowH);
    pLines.forEach((ln, idx) => {
      page.drawText(ln, { x: MARGIN, y: y - 12 - idx * 15, size: 12, font: bold, color: INK });
    });
    let yy = y - 12 - pLines.length * 15;
    sLines.forEach((ln) => {
      page.drawText(ln, { x: MARGIN, y: yy, size: 11, font, color: GREY });
      yy -= 14;
    });
    y -= rowH;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: A4.w - MARGIN, y }, thickness: 0.5, color: HAIR });
    y -= 5;
  };

  const drawEmpty = () => {
    ensure(20);
    page.drawText('Nothing recorded.', { x: MARGIN, y: y - 12, size: 11, font, color: GREY });
    y -= 22;
  };

  for (const s of doc.sections) {
    drawHeading(s.heading);
    if (s.kind === 'rows') {
      if (s.rows.length === 0) drawEmpty();
      else s.rows.forEach((r) => drawRowPair(r.label, r.value));
    } else if (s.kind === 'list') {
      if (s.items.length === 0) drawEmpty();
      else s.items.forEach((i) => drawFullLine(i.primary, i.secondary));
    } else {
      const lines = s.body.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      if (lines.length === 0) drawEmpty();
      else lines.forEach((l) => drawFullLine(l));
    }
    y -= 8;
  }

  y -= 6;
  ensure(20);
  for (const ln of wrapText(footer, font, 9, contentW)) {
    page.drawText(ln, { x: MARGIN, y: y - 10, size: 9, font, color: GREY });
    y -= 12;
  }

  return pdf.save();
}

// Info card is just a single rows section — reuse the document renderer.
function infoCardToDocument(title: string, rows: PdfRow[]): PdfDocument {
  return {
    title,
    subtitle: 'Info Card',
    sections: [{ kind: 'rows', heading: 'Details', rows }],
  };
}

// ── Web share ──────────────────────────────────────────────────────────────────

const IS_WEB = Platform.OS === 'web';

function openInNewTab(uri: string): void {
  if (typeof window !== 'undefined') window.open(uri, '_blank', 'noopener');
}

// Try the Web Share API with a File (opens the iOS share sheet in a PWA).
// Fall back to opening the PDF in a new tab. Never throws.
async function shareBytesWeb(bytes: Uint8Array, filename: string): Promise<void> {
  const blob = new Blob([new Uint8Array(bytes).slice().buffer], { type: 'application/pdf' });
  const nav = typeof navigator !== 'undefined' ? (navigator as Navigator) : undefined;
  try {
    if (nav && typeof nav.share === 'function' && typeof File !== 'undefined') {
      const file = new File([blob], filename, { type: 'application/pdf' });
      const canShareFiles =
        typeof nav.canShare === 'function' ? nav.canShare({ files: [file] }) : true;
      if (canShareFiles) {
        await nav.share({ files: [file], title: filename });
        return;
      }
    }
  } catch {
    // user cancelled or share failed — fall through to new-tab
  }
  openInNewTab(URL.createObjectURL(blob));
}

// ── Native share ────────────────────────────────────────────────────────────────

async function renderAndShareNative(html: string, plainText: string): Promise<void> {
  try {
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
    } else {
      await Share.share({ message: plainText });
    }
  } catch {
    try {
      await Share.share({ message: plainText });
    } catch {
      /* dismissed — no-op */
    }
  }
}

function safeFilename(title: string): string {
  const base = title.replace(/[^\w\-]+/g, '_').replace(/^_+|_+$/g, '') || 'Document';
  return `${base}.pdf`;
}

// ── Public API ──────────────────────────────────────────────────────────────────

// Multi-section document (Appointment Packs).
export async function sharePdfDocument(
  doc: PdfDocument,
  plainText: string,
  footer: string,
): Promise<void> {
  if (IS_WEB) {
    const bytes = await buildDocumentPdfBytes(doc, footer);
    await shareBytesWeb(bytes, safeFilename(doc.title));
    return;
  }
  await renderAndShareNative(buildDocumentHtml(doc, footer), plainText);
}

// Renders to a temp PDF and returns its uri WITHOUT sharing. Used by Packs so
// attachments can be merged in before the share sheet opens.
// Native: expo-print temp file. Web: pdf-lib bytes → blob URL.
export async function renderPdfDocument(
  doc: PdfDocument,
  footer: string,
): Promise<string> {
  if (IS_WEB) {
    const bytes = await buildDocumentPdfBytes(doc, footer);
    const blob = new Blob([new Uint8Array(bytes).slice().buffer], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  }
  const { uri } = await Print.printToFileAsync({ html: buildDocumentHtml(doc, footer) });
  return uri;
}

// Shares an already-rendered PDF file (uri = blob URL on web, file uri native).
export async function sharePdfFile(uri: string, plainText: string): Promise<void> {
  if (IS_WEB) {
    try {
      const res = await fetch(uri);
      const bytes = new Uint8Array(await res.arrayBuffer());
      await shareBytesWeb(bytes, 'AppointmentPack.pdf');
    } catch {
      openInNewTab(uri);
    }
    return;
  }
  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
    } else {
      await Share.share({ message: plainText });
    }
  } catch {
    try {
      await Share.share({ message: plainText });
    } catch {
      /* dismissed — no-op */
    }
  }
}

// Legacy single-table info card.
export async function shareInfoCardPdf(
  title: string,
  rows: PdfRow[],
  plainText: string,
): Promise<void> {
  if (IS_WEB) {
    const bytes = await buildDocumentPdfBytes(infoCardToDocument(title, rows), 'Info Card');
    await shareBytesWeb(bytes, safeFilename(title));
    return;
  }

  const body =
    rows.length > 0
      ? rows
          .map(
            (r) =>
              `<tr><td class="l">${escapeHtml(r.label)}</td><td class="v">${escapeHtml(r.value)}</td></tr>`,
          )
          .join('')
      : `<tr><td colspan="2" class="v">No details recorded yet.</td></tr>`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8" />
  <style>${STYLES}</style></head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    <p class="sub">Info Card</p>
    <table>${body}</table>
  </body></html>`;

  await renderAndShareNative(html, plainText);
}
