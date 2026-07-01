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

export const FAMILY_STORAGE_CAP_BYTES = 52_428_800; // 50 MB — keep in sync with SQL trigger
