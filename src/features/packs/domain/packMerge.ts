// src/features/packs/domain/packMerge.ts
// Merges visit documents into the generated Pack PDF, on device, in JS.
//
// Hard caps exist to protect memory and battery — base64 inflates a file ~1.33x
// and the whole thing lives in the JS heap. Anything skipped is reported back so
// the UI can say so. Nothing ever vanishes silently.

import { PDFDocument } from 'pdf-lib';
import { File, Paths } from 'expo-file-system';
import { decode, encode } from 'base64-arraybuffer';

import { createSignedUrl } from '@/features/documents/repository/documents.repository';
import type { Document } from '@/features/documents/types/documents.types';

// ── Caps ─────────────────────────────────────────────────────────────────────
export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB per document
export const MAX_TOTAL_BYTES = 25 * 1024 * 1024; // 25 MB merged in total
export const MAX_PAGES = 50; // across all attachments

const A4 = { width: 595.28, height: 841.89 };

export type SkipReason = 'too-large' | 'total-limit' | 'page-limit' | 'unsupported' | 'failed';

export interface MergeSkip {
  name: string;
  reason: SkipReason;
}

export interface MergeResult {
  uri: string; // merged PDF (or the original if nothing merged)
  mergedCount: number;
  skipped: MergeSkip[];
}

const isPdf = (d: Document): boolean =>
  d.fileType === 'application/pdf' || d.name.toLowerCase().endsWith('.pdf');

const isJpg = (d: Document): boolean =>
  d.fileType === 'image/jpeg' || /\.(jpe?g)$/i.test(d.name);

const isPng = (d: Document): boolean =>
  d.fileType === 'image/png' || /\.png$/i.test(d.name);

// Downloads a signed-URL object to base64. Kept small and isolated so a single
// bad file can be caught and skipped without killing the whole merge.
async function downloadBase64(doc: Document): Promise<string> {
  const url = await createSignedUrl(doc.filePath, 300);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buf = await res.arrayBuffer();
  return encode(buf);
}

// Draws an embedded image on its own page, scaled to fit A4 with a margin.
function addImagePage(
  pdf: PDFDocument,
  img: { width: number; height: number },
  embed: unknown,
): void {
  const margin = 36;
  const maxW = A4.width - margin * 2;
  const maxH = A4.height - margin * 2;
  const scale = Math.min(maxW / img.width, maxH / img.height, 1);
  const w = img.width * scale;
  const h = img.height * scale;

  const page = pdf.addPage([A4.width, A4.height]);
  page.drawImage(embed as never, {
    x: (A4.width - w) / 2,
    y: (A4.height - h) / 2,
    width: w,
    height: h,
  });
}

export interface MergeOptions {
  onProgress?: (current: number, total: number) => void;
}

// Appends `documents` to the PDF at `packUri`. Returns a new temp file uri.
// If nothing could be merged, returns the original uri untouched.
export async function mergeDocumentsIntoPack(
  packUri: string,
  documents: Document[],
  options: MergeOptions = {},
): Promise<MergeResult> {
  const skipped: MergeSkip[] = [];

  // Pre-filter on declared size — cheaper than downloading then rejecting.
  const candidates: Document[] = [];
  for (const d of documents) {
    if (!isPdf(d) && !isJpg(d) && !isPng(d)) {
      skipped.push({ name: d.name, reason: 'unsupported' });
    } else if ((d.fileSize ?? 0) > MAX_FILE_BYTES) {
      skipped.push({ name: d.name, reason: 'too-large' });
    } else {
      candidates.push(d);
    }
  }

  if (candidates.length === 0) {
    return { uri: packUri, mergedCount: 0, skipped };
  }

  const packBase64 = await new File(packUri).base64();
  const merged = await PDFDocument.load(decode(packBase64));

  let totalBytes = 0;
  let mergedCount = 0;

  let index = 0;
  for (const doc of candidates) {
    index++;
    options.onProgress?.(index, candidates.length);

    if (merged.getPageCount() >= MAX_PAGES) {
      skipped.push({ name: doc.name, reason: 'page-limit' });
      continue;
    }

    try {
      const base64 = await downloadBase64(doc);
      const bytes = decode(base64);

      if (bytes.byteLength > MAX_FILE_BYTES) {
        skipped.push({ name: doc.name, reason: 'too-large' });
        continue;
      }
      if (totalBytes + bytes.byteLength > MAX_TOTAL_BYTES) {
        skipped.push({ name: doc.name, reason: 'total-limit' });
        continue;
      }

      if (isPdf(doc)) {
        const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const room = MAX_PAGES - merged.getPageCount();
        const indices = src.getPageIndices().slice(0, room);
        if (indices.length < src.getPageCount()) {
          skipped.push({ name: doc.name, reason: 'page-limit' });
        }
        const pages = await merged.copyPages(src, indices);
        pages.forEach((p) => merged.addPage(p));
      } else if (isJpg(doc)) {
        const img = await merged.embedJpg(bytes);
        addImagePage(merged, img, img);
      } else {
        const img = await merged.embedPng(bytes);
        addImagePage(merged, img, img);
      }

      totalBytes += bytes.byteLength;
      mergedCount++;
    } catch {
      // One bad file must not kill the Pack.
      skipped.push({ name: doc.name, reason: 'failed' });
    }
  }

  if (mergedCount === 0) {
    return { uri: packUri, mergedCount: 0, skipped };
  }

  const outBase64 = await merged.saveAsBase64();
  const out = new File(Paths.cache, `AppointmentPack-${Date.now()}.pdf`);
  out.create({ overwrite: true });
  out.write(new Uint8Array(decode(outBase64)));

  return { uri: out.uri, mergedCount, skipped };
}
