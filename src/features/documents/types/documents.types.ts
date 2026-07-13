// src/features/documents/types/documents.types.ts
// Domain types for the documents feature.

export type DocumentKind = 'pdf' | 'image' | 'doc' | 'other';

export interface Document {
  id: string;
  name: string;
  filePath: string;
  fileSize: number | null;
  fileType: string | null;
  personId: string | null;
  doctorId: string | null;
  visitId: string | null;
  familyGroupId: string;
  uploadedAt: string | null;
  kind: DocumentKind;
}

// A file the user picked, normalised across the Files picker and the image picker.
export interface PickedFile {
  uri: string;
  name: string;
  mimeType: string | null;
  size: number | null;
}

// The REAL cap lives in the DB: family_groups.storage_cap_bytes, enforced by
// the enforce_family_storage_cap() trigger. Read it from the family group —
// do NOT treat these as the source of truth.
//
// Free = 100 MB. Plus = 5 GB (set on purchase).
export const FREE_STORAGE_CAP_BYTES = 104_857_600;   // 100 MB
export const PLUS_STORAGE_CAP_BYTES = 5_368_709_120; // 5 GB

// Fallback only — used if the group row has not loaded yet.
export const FALLBACK_STORAGE_CAP_BYTES = FREE_STORAGE_CAP_BYTES;

export function formatCapLabel(bytes: number): string {
  if (bytes >= 1_073_741_824) {
    const gb = bytes / 1_073_741_824;
    return `${Number.isInteger(gb) ? gb : gb.toFixed(1)} GB`;
  }
  return `${Math.round(bytes / 1_048_576)} MB`;
}

export function storageFullMessage(capBytes: number): string {
  return `This family has reached the ${formatCapLabel(capBytes)} storage limit. Delete a file to add more, or upgrade to Family Plus.`;
}

// Generic message for screens that do not have the cap to hand.
export const STORAGE_FULL_MESSAGE =
  'This family has reached its storage limit. Delete a file to add more, or upgrade to Family Plus.';
