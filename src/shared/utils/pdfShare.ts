// src/shared/utils/pdfShare.ts
// Renders a sectioned PDF and opens the native share sheet.
// Falls back to plain-text Share if PDF sharing is unavailable.
//
// Two entry points:
//   shareInfoCardPdf  — legacy single-table info card (unchanged behaviour)
//   sharePdfDocument  — multi-section document (Appointment Packs)

import { Share } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

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

// ── HTML ─────────────────────────────────────────────────────────────────────

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

// ── Share ────────────────────────────────────────────────────────────────────

async function renderAndShare(html: string, plainText: string): Promise<void> {
  try {
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
    } else {
      await Share.share({ message: plainText });
    }
  } catch {
    // PDF generation failed or user dismissed — fall back to text share, ignore dismiss.
    try {
      await Share.share({ message: plainText });
    } catch {
      /* dismissed — no-op */
    }
  }
}

// Multi-section document (Appointment Packs).
export async function sharePdfDocument(
  doc: PdfDocument,
  plainText: string,
  footer: string,
): Promise<void> {
  await renderAndShare(buildDocumentHtml(doc, footer), plainText);
}

// Legacy single-table info card — unchanged output.
export async function shareInfoCardPdf(
  title: string,
  rows: PdfRow[],
  plainText: string,
): Promise<void> {
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

  await renderAndShare(html, plainText);
}
