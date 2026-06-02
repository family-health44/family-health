// src/features/notes/repository/notes.repository.ts
// Notes repository — only place Supabase is called for note data.

import { db } from '@/lib/supabase';
import { handleNetworkError } from '@/core/network/errorHandler';

import type { DbNote } from '@/shared/types/database';

export async function fetchNotesByPerson(personId: string): Promise<DbNote[]> {
  try {
    const { data, error } = await db
      .from('notes')
      .select('id, content, person_id, doctor_id, medication_id, visit_id, family_group_id, hidden')
      .eq('person_id', personId)
      .eq('hidden', false)
      .order('id', { ascending: false });

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
      .select('id, content, person_id, doctor_id, medication_id, visit_id, family_group_id, hidden')
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
      .select('id, content, person_id, doctor_id, medication_id, visit_id, family_group_id, hidden')
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
      })
      .select('id, content, person_id, doctor_id, medication_id, visit_id, family_group_id, hidden')
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
  hidden: boolean;
}

export async function updateNote(params: UpdateNoteParams): Promise<DbNote> {
  try {
    const { data, error } = await db
      .from('notes')
      .update({
        content: params.content,
        doctor_id: params.doctorId,
        medication_id: params.medicationId,
        hidden: params.hidden,
      })
      .eq('id', params.noteId)
      .select('id, content, person_id, doctor_id, medication_id, visit_id, family_group_id, hidden')
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
