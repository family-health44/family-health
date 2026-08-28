// src/features/packs/domain/packMerge.ts
// Merges visit documents into the generated Pack PDF, on device, in JS.
//
// Hard caps exist to protect memory and battery — base64 inflates a file ~1.33x
// and the whole thing lives in the JS heap. Anything skipped is reported back so
// the UI can say so. Nothing ever vanishes silently.
//
// pdf-lib is imported lazily (dynamic import) inside each function that uses it,
// never at module top level — a static top-level import crashed web at import
// with "Cannot destructure property '__extends' of tslib.default". The type-only
// import below is erased at compile time and never loads the library.

import type { PDFDocument as PDFDocumentType } from 'pdf-lib';
import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import { decode, encode } from 'base64-arraybuffer';

import { createSignedUrl } from '@/features/documents/repository/documents.repository';
import type { Document } from '@/features/documents/types/documents.types';

// Web has no expo-file-system. On web, PDF bytes live behind blob: URLs which
// are read via fetch() and written via URL.createObjectURL. Native keeps the
// cache-file path. Both return/consume a `uri` string so callers are unchanged.
const IS_WEB = Platform.OS === 'web';
async function readPdfBase64(uri: string): Promise<string> {
  if (IS_WEB) {
    const res = await fetch(uri);
    return encode(await res.arrayBuffer());
  }
  return new File(uri).base64();
}
function writePdfBytes(bytes: ArrayBuffer): string {
  if (IS_WEB) {
    const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  }
  const file = new File(Paths.cache, `AppointmentPack-${Date.now()}.pdf`);
  file.create({ overwrite: true });
  file.write(new Uint8Array(bytes));
  return file.uri;
}

// ── Caps ─────────────────────────────────────────────────────────────────────
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
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

// Filename wins over the stored mimeType — the photo picker has reported
// image/jpeg for HEIC files, so the mime cannot be trusted on its own.
const isHeic = (d: Document): boolean =>
  /\.(heic|heif)$/i.test(d.name) || d.fileType === 'image/heic' || d.fileType === 'image/heif';

const isJpg = (d: Document): boolean =>
  !isHeic(d) && (/\.(jpe?g)$/i.test(d.name) || d.fileType === 'image/jpeg');

const isPng = (d: Document): boolean =>
  /\.png$/i.test(d.name) || d.fileType === 'image/png';

// Downloads a signed-URL object to base64. Kept small and isolated so a single
// bad file can be caught and skipped without killing the whole merge.
async function downloadBase64(doc: Document): Promise<string> {
  const url = await createSignedUrl(doc.filePath, 300);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buf = await res.arrayBuffer();
  return encode(buf);
}

// ── EXIF orientation ─────────────────────────────────────────────────────────
// pdf-lib draws the raw pixel grid and ignores EXIF. Photo viewers honour the
// orientation tag, so a photo can look upright everywhere EXCEPT in the merged
// PDF. We read the tag ourselves and bake the rotation into the draw call.
//
// Values 1-8 per the EXIF spec. 5-8 transpose the image (width/height swap).
function readJpegOrientation(bytes: ArrayBuffer): number {
  const view = new DataView(bytes);
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return 1; // not a JPEG

  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    const marker = view.getUint16(offset);
    const size = view.getUint16(offset + 2);
    if (size < 2) return 1;

    // APP1 — the EXIF segment
    if (marker === 0xffe1) {
      const exifStart = offset + 4;
      // 'Exif\0\0'
      if (exifStart + 6 > view.byteLength || view.getUint32(exifStart) !== 0x45786966) return 1;

      const tiff = exifStart + 6;
      if (tiff + 8 > view.byteLength) return 1;

      // Byte order: 'II' little-endian, 'MM' big-endian
      const le = view.getUint16(tiff) === 0x4949;
      const ifdOffset = view.getUint32(tiff + 4, le);
      const ifd = tiff + ifdOffset;
      if (ifd + 2 > view.byteLength) return 1;

      const count = view.getUint16(ifd, le);
      for (let i = 0; i < count; i++) {
        const entry = ifd + 2 + i * 12;
        if (entry + 12 > view.byteLength) return 1;
        if (view.getUint16(entry, le) === 0x0112) {
          const value = view.getUint16(entry + 8, le);
          return value >= 1 && value <= 8 ? value : 1;
        }
      }
      return 1;
    }

    if (marker === 0xffda) break; // start of scan — no EXIF found
    offset += 2 + size;
  }
  return 1;
}

// Draws an embedded image on its own page, scaled to fit A4, honouring EXIF.
// `degrees` is passed in so this stays free of a pdf-lib import.
function addImagePage(
  pdf: PDFDocumentType,
  img: { width: number; height: number },
  embed: unknown,
  degrees: (angle: number) => unknown,
  orientation = 1,
): void {
  const margin = 36;

  // Instead of rotating the image about a pivot (fiddly, easy to push off-page),
  // draw it upright and rotate the whole PAGE. Viewers honour page rotation and
  // the image can never fall outside the page because it is never transformed.
  //
  // The page is laid out in its UNROTATED frame. For a 90/270 rotation the
  // rotated page presents its height as the visible width and vice-versa, so we
  // size the unrotated page as portrait A4 and, for transposed orientations,
  // fit the image against the swapped bounds.
  const transposed = orientation === 6 || orientation === 8;

  // Visible page after rotation is always portrait A4.
  const visW = transposed ? A4.height : A4.width;
  const visH = transposed ? A4.width : A4.height;

  const maxW = visW - margin * 2;
  const maxH = visH - margin * 2;
  const scale = Math.min(maxW / img.width, maxH / img.height, 1);
  const w = img.width * scale;
  const h = img.height * scale;

  // Unrotated page dimensions (before pdf-lib applies page rotation).
  const pageW = transposed ? A4.height : A4.width;
  const pageH = transposed ? A4.width : A4.height;

  const page = pdf.addPage([pageW, pageH]);

  // Centre the upright image on the unrotated page.
  const x = (pageW - w) / 2;
  const y = (pageH - h) / 2;
  page.drawImage(embed as never, { x, y, width: w, height: h });

  // Rotate the page so the stored pixels display upright.
  //   3 -> 180 ; 6 -> 90 CW ; 8 -> 270 CW. pdf-lib page.setRotation is clockwise.
  let angle = 0;
  if (orientation === 3) angle = 180;
  else if (orientation === 6) angle = 90;
  else if (orientation === 8) angle = 270;
  if (angle !== 0) page.setRotation(degrees(angle) as never);
}export interface MergeOptions {
  onProgress?: (current: number, total: number) => void;
}

// Appends `documents` to the PDF at `packUri`. Returns a new temp file uri.
// If nothing could be merged, returns the original uri untouched.
export async function mergeDocumentsIntoPack(
  packUri: string,
  documents: Document[],
  options: MergeOptions = {},
): Promise<MergeResult> {
  const { PDFDocument, degrees } = await import('pdf-lib');
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

  const packBase64 = await readPdfBase64(packUri);
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
        addImagePage(merged, img, img, degrees, readJpegOrientation(bytes));
      } else {
        // PNG has no EXIF orientation.
        const img = await merged.embedPng(bytes);
        addImagePage(merged, img, img, degrees, 1);
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
  const outUri = writePdfBytes(decode(outBase64));

  return { uri: outUri, mergedCount, skipped };
}

// Counts pages in a PDF already on disk. No network. Used to know how many
// leading pages belong to the cover before attachments are appended.
export async function countPdfPages(uri: string): Promise<number> {
  const { PDFDocument } = await import('pdf-lib');
  const bytes = decode(await readPdfBase64(uri));
  const doc = await PDFDocument.load(bytes);
  return doc.getPageCount();
}

// Replaces the leading cover page(s) of an already-merged pack with a freshly
// rendered cover — used when the merge produced skips and the index must be
// rebuilt to tell the truth. No re-download: operates on bytes already on disk.
export async function replaceCoverPages(
  mergedUri: string,
  newCoverUri: string,
  originalCoverPageCount: number,
): Promise<string> {
  const { PDFDocument } = await import('pdf-lib');
  const mergedDoc = await PDFDocument.load(decode(await readPdfBase64(mergedUri)));
  const coverDoc = await PDFDocument.load(decode(await readPdfBase64(newCoverUri)));

  const out = await PDFDocument.create();
  const coverPages = await out.copyPages(coverDoc, coverDoc.getPageIndices());
  coverPages.forEach((p) => out.addPage(p));
  const attachIndices = mergedDoc.getPageIndices().slice(originalCoverPageCount);
  const attachPages = await out.copyPages(mergedDoc, attachIndices);
  attachPages.forEach((p) => out.addPage(p));

  const outBase64 = await out.saveAsBase64();
  return writePdfBytes(decode(outBase64));
}
