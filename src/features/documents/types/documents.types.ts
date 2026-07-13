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

// KEEP IN SYNC WITH THE SQL CAP TRIGGER. Changing this alone does not change
// the enforced limit — the trigger is the real cap. All user-facing copy derives
// from these two exports, so update here and nothing goes stale.
export const FAMILY_STORAGE_CAP_BYTES = 52_428_800; // 50 MB

export const FAMILY_STORAGE_CAP_LABEL = `${Math.round(FAMILY_STORAGE_CAP_BYTES / 1_048_576)} MB`;

export const STORAGE_FULL_MESSAGE =
  `This family has reached the ${FAMILY_STORAGE_CAP_LABEL} limit. Delete a file to add more.`;
