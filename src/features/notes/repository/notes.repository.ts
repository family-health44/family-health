// src/features/notes/repository/notes.repository.ts
// Notes repository — only place Supabase is called for note data.

import { db } from '@/lib/supabase';
import { handleNetworkError } from '@/core/network/errorHandler';

import type { DbNote } from '@/shared/types/database';

// Column list shared by every query — one source of truth (prevents silent field-drop).
const COLS = 'id, content, person_id, doctor_id, medication_id, visit_id, family_group_id, hidden, note_date, created_at';

export async function fetchNotesByPerson(
  personId: string,
  includeHidden = false,
): Promise<DbNote[]> {
  try {
    let query = db
      .from('notes')
      .select(COLS)
      .eq('person_id', personId);

    if (!includeHidden) {
      query = query.eq('hidden', false);
    }

    const { data, error } = await query.order('id', { ascending: false });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function fetchNotesByVisit(visitId: string): Promise<DbNote[]> {
  try {
    const { data, error } = await db
      .from('notes')
      .select(COLS)
      .eq('visit_id', visitId)
      .eq('hidden', false)
      .order('id', { ascending: false });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function fetchNotesByDoctor(doctorId: string): Promise<DbNote[]> {
  try {
    const { data, error } = await db
      .from('notes')
      .select(COLS)
      .eq('doctor_id', doctorId)
      .eq('hidden', false)
      .order('id', { ascending: false });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    handleNetworkError(error);
  }
}

export interface InsertNoteParams {
  content: string;
  personId: string | null;
  doctorId: string | null;
  medicationId: string | null;
  visitId: string | null;
  familyGroupId: string;
  hidden: boolean;
  noteDate?: string | null;
}

export async function insertNote(params: InsertNoteParams): Promise<DbNote> {
  try {
    const { data, error } = await db
      .from('notes')
      .insert({
        content: params.content,
        person_id: params.personId,
        doctor_id: params.doctorId,
        medication_id: params.medicationId,
        visit_id: params.visitId,
        family_group_id: params.familyGroupId,
        hidden: params.hidden,
        note_date: params.noteDate ?? null,
      })
      .select(COLS)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Insert returned no data.');
    return data;
  } catch (error) {
    handleNetworkError(error);
  }
}

export interface UpdateNoteParams {
  noteId: string;
  content: string;
  doctorId: string | null;
  medicationId: string | null;
  visitId: string | null;
  hidden: boolean;
  noteDate?: string | null;
}

export async function updateNote(params: UpdateNoteParams): Promise<DbNote> {
  try {
    const { data, error } = await db
      .from('notes')
      .update({
        content: params.content,
        doctor_id: params.doctorId,
        medication_id: params.medicationId,
        visit_id: params.visitId,
        hidden: params.hidden,
        note_date: params.noteDate ?? null,
      })
      .eq('id', params.noteId)
      .select(COLS)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Update returned no data.');
    return data;
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function deleteNote(noteId: string): Promise<void> {
  try {
    const { error } = await db
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) throw error;
  } catch (error) {
    handleNetworkError(error);
  }
}
