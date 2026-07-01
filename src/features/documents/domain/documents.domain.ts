// src/features/documents/domain/documents.domain.ts
// Pure domain logic — zero external imports (except types).

import type { DbDocument } from '@/shared/types/database';
import type { Document, DocumentKind } from '../types/documents.types';

// ─── Kind detection ───────────────────────────────────────────────────────────

export function documentKind(fileType: string | null, name: string): DocumentKind {
  const mime = (fileType ?? '').toLowerCase();
  const ext = name.toLowerCase().split('.').pop() ?? '';

  if (mime === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'heic', 'gif', 'webp'].includes(ext)) {
    return 'image';
  }
  if (
    mime.includes('word') ||
    mime.includes('document') ||
    ['doc', 'docx', 'txt', 'rtf', 'pages'].includes(ext)
  ) {
    return 'doc';
  }
  return 'other';
}

// ─── Mapping ──────────────────────────────────────────────────────────────────

export function mapDbDocumentToDocument(db: DbDocument): Document {
  return {
    id: db.id,
    name: db.name,
    filePath: db.file_path,
    fileSize: db.file_size,
    fileType: db.file_type,
    personId: db.person_id,
    doctorId: db.doctor_id,
    visitId: db.visit_id,
    familyGroupId: db.family_group_id,
    uploadedAt: db.uploaded_at,
    kind: documentKind(db.file_type, db.name),
  };
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export function formatFileSize(bytes: number | null): string {
  if (bytes == null || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function totalBytes(documents: Document[]): number {
  return documents.reduce((sum, d) => sum + (d.fileSize ?? 0), 0);
}

// Sort newest first (uploaded_at desc; null last), then by name.
export function sortDocuments(documents: Document[]): Document[] {
  return [...documents].sort((a, b) => {
    if (a.uploadedAt && b.uploadedAt) return b.uploadedAt.localeCompare(a.uploadedAt);
    if (a.uploadedAt) return -1;
    if (b.uploadedAt) return 1;
    return a.name.localeCompare(b.name);
  });
}

const KIND_LABEL: Record<DocumentKind, string> = {
  pdf: 'PDF',
  image: 'Image',
  doc: 'Doc',
  other: 'File',
};

export function kindLabel(kind: DocumentKind): string {
  return KIND_LABEL[kind];
}
