// src/features/documents/repository/documents.repository.ts
// Documents repository — the only place Supabase (DB + Storage) is called for
// document data. Files live in the private 'documents' storage bucket; metadata
// rows live in the public.documents table.

import { File } from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

import { db } from '@/lib/supabase';
import { handleNetworkError } from '@/core/network/errorHandler';

import type { DbDocument } from '@/shared/types/database';
import type { PickedFile } from '../types/documents.types';

const BUCKET = 'documents';

// Column list — one source of truth (prevents silent field-drop).
const COLS =
  'id, name, file_path, file_size, file_type, hidden, person_id, doctor_id, visit_id, family_group_id, uploaded_at';

// ─── Reads ────────────────────────────────────────────────────────────────────

export async function fetchDocumentsByPerson(personId: string): Promise<DbDocument[]> {
  try {
    const { data, error } = await db
      .from('documents')
      .select(COLS)
      .eq('person_id', personId)
      .eq('hidden', false)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as DbDocument[];
  } catch (error) {
    handleNetworkError(error);
  }
}

// Signed URL for viewing/sharing a private object. Valid for `expiresIn` seconds.
export async function createSignedUrl(filePath: string, expiresIn = 300): Promise<string> {
  try {
    const { data, error } = await db.storage.from(BUCKET).createSignedUrl(filePath, expiresIn);
    if (error) throw error;
    if (!data?.signedUrl) throw new Error('No signed URL returned.');
    return data.signedUrl;
  } catch (error) {
    handleNetworkError(error);
  }
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export interface UploadDocumentParams {
  file: PickedFile;
  personId: string | null;
  visitId: string | null;
  doctorId: string | null;
  familyGroupId: string;
}

// Builds the storage object path: {familyGroupId}/{personId|_}/{uuid}-{safeName}
// The first segment MUST be the family_group_id — storage RLS keys off it.
function buildObjectPath(params: UploadDocumentParams): string {
  const scope = params.personId ?? '_';
  const safeName = params.file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const unique =
    (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  return `${params.familyGroupId}/${scope}/${unique}-${safeName}`;
}

export async function uploadDocument(params: UploadDocumentParams): Promise<DbDocument> {
  const objectPath = buildObjectPath(params);
  let storageWritten = false;

  try {
    // Read the picked file as base64 → ArrayBuffer. The blob()/File-web route
    // produces 0-byte uploads on iOS, so we go through base64 explicitly.
    const base64 = await new File(params.file.uri).base64();
    const bytes = decode(base64);

    const { error: uploadError } = await db.storage
      .from(BUCKET)
      .upload(objectPath, bytes, {
        contentType: params.file.mimeType ?? 'application/octet-stream',
        upsert: false,
      });
    if (uploadError) throw uploadError;
    storageWritten = true;

    // Insert metadata row. The 50 MB per-family cap trigger fires here and
    // raises STORAGE_CAP_EXCEEDED if this would exceed the limit.
    const { data, error } = await db
      .from('documents')
      .insert({
        name: params.file.name,
        file_path: objectPath,
        file_size: params.file.size,
        file_type: params.file.mimeType,
        hidden: false,
        person_id: params.personId,
        doctor_id: params.doctorId,
        visit_id: params.visitId,
        family_group_id: params.familyGroupId,
      })
      .select(COLS)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Insert returned no data.');
    return data as DbDocument;
  } catch (error) {
    // Roll back the orphaned storage object if the metadata insert failed
    // (e.g. cap exceeded). Best-effort — swallow cleanup errors.
    if (storageWritten) {
      try {
        await db.storage.from(BUCKET).remove([objectPath]);
      } catch {
        /* ignore — orphan cleanup is best-effort */
      }
    }
    handleNetworkError(error);
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteDocument(doc: Pick<DbDocument, 'id' | 'file_path'>): Promise<void> {
  try {
    // Storage first: if the row deletes but the object lingers it counts against
    // the (bucket) quota with no way to reach it from the UI.
    const { error: storageError } = await db.storage.from(BUCKET).remove([doc.file_path]);
    if (storageError) throw storageError;

    const { error } = await db.from('documents').delete().eq('id', doc.id);
    if (error) throw error;
  } catch (error) {
    handleNetworkError(error);
  }
}
