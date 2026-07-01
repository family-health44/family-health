// src/shared/utils/pdfShare.ts
// Renders a simple info-card PDF and opens the native share sheet.
// Falls back to plain-text Share if PDF sharing is unavailable.

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

export interface InfoCardPdfRow {
  label: string;
  value: string;
}

// Builds the print HTML. Only pass rows you want in the document (filter "Not set" upstream).
function buildHtml(title: string, rows: InfoCardPdfRow[]): string {
  const body =
    rows.length > 0
      ? rows
          .map(
            (r) =>
              `<tr><td class="l">${escapeHtml(r.label)}</td><td class="v">${escapeHtml(
                r.value,
              )}</td></tr>`,
          )
          .join('')
      : `<tr><td colspan="2" class="v">No details recorded yet.</td></tr>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8" />
  <style>
    * { font-family: -apple-system, Helvetica, Arial, sans-serif; }
    body { padding: 32px; color: #1C1917; }
    h1 { font-size: 22px; font-weight: 600; margin: 0 0 4px; }
    .sub { font-size: 12px; color: #8A857E; margin: 0 0 20px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 10px 8px; border-bottom: 1px solid #ECE8E1; font-size: 13px; vertical-align: top; }
    .l { color: #8A857E; width: 40%; }
    .v { color: #1C1917; font-weight: 500; }
  </style></head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    <p class="sub">Info Card</p>
    <table>${body}</table>
  </body></html>`;
}

// Renders the rows to a PDF and shares it. `plainText` is the fallback body
// used when native file-sharing isn't available on the device.
export async function shareInfoCardPdf(
  title: string,
  rows: InfoCardPdfRow[],
  plainText: string,
): Promise<void> {
  try {
    const { uri } = await Print.printToFileAsync({ html: buildHtml(title, rows) });
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
