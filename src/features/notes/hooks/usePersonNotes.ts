// src/features/notes/hooks/usePersonNotes.ts
// Hook — composes notes queries and mutations for the person notes section.

import { useCallback, useState } from 'react';

import { usePersonNotesQuery } from '../queries/notes.queries';
import {
  useAddNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} from '../mutations/notes.mutations';
import { isAppError, toAppError } from '@/shared/types/errors';

import type { Note, NoteFormValues } from '../types/notes.types';
import type { AppError } from '@/shared/types/errors';

export interface UsePersonNotesReturn {
  notes: Note[];
  isLoading: boolean;
  error: AppError | null;
  editingNote: Note | null;
  setEditingNote: (note: Note | null) => void;
  addNote: (values: NoteFormValues) => Promise<void>;
  updateNote: (noteId: string, values: NoteFormValues) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  isSubmitting: boolean;
}

export function usePersonNotes(personId: string): UsePersonNotesReturn {
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { data: notes = [], isLoading, error: queryError } = usePersonNotesQuery(personId);
  const addMutation = useAddNoteMutation(personId);
  const updateMutation = useUpdateNoteMutation(personId);
  const deleteMutation = useDeleteNoteMutation(personId);

  const addNote = useCallback(async (values: NoteFormValues) => {
    await addMutation.mutateAsync({
      content: values.content,
      personId,
      doctorId: values.doctorId,
      medicationId: values.medicationId,
      visitId: null,
      hidden: values.hidden,
    });
  }, [addMutation, personId]);

  const updateNote = useCallback(async (noteId: string, values: NoteFormValues) => {
    await updateMutation.mutateAsync({
      noteId,
      content: values.content,
      doctorId: values.doctorId,
      medicationId: values.medicationId,
      hidden: values.hidden,
    });
    setEditingNote(null);
  }, [updateMutation]);

  const deleteNote = useCallback(async (noteId: string) => {
    await deleteMutation.mutateAsync(noteId);
    setEditingNote(null);
  }, [deleteMutation]);

  const error = queryError
    ? isAppError(queryError) ? queryError : toAppError(queryError)
    : null;

  return {
    notes,
    isLoading,
    error,
    editingNote,
    setEditingNote,
    addNote,
    updateNote,
    deleteNote,
    isSubmitting: addMutation.isPending || updateMutation.isPending,
  };
}
