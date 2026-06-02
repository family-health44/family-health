// src/features/notes/mutations/notes.mutations.ts
// TanStack Query mutations for note write operations.
// Add and update use withOfflineQueue for offline support.

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import { fetchFamilyGroup } from '@/features/family/repository/family.repository';
import { insertNote, updateNote, deleteNote } from '../repository/notes.repository';
import { withOfflineQueue } from '@/core/sync/withOfflineQueue';

import type { InsertNoteParams, UpdateNoteParams } from '../repository/notes.repository';

type AddNoteInput = Omit<InsertNoteParams, 'familyGroupId'>;

export function useAddNoteMutation(personId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddNoteInput) => {
      const group = await fetchFamilyGroup();
      if (!group) throw new Error('No family group found.');
      const params = { ...input, familyGroupId: group.id };
      return withOfflineQueue(
        () => insertNote(params),
        { type: 'ADD_NOTE', payload: params },
      );
    },
    onSuccess: (_data, input) => {
      if (personId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.notes.byPerson(personId) });
      }
      if (input.visitId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.notes.byVisit(input.visitId) });
      }
    },
  });
}

export function useUpdateNoteMutation(personId: string | null, visitId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateNoteParams) =>
      withOfflineQueue(
        () => updateNote(params),
        { type: 'UPDATE_NOTE', payload: params },
      ),
    onSuccess: () => {
      if (personId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.notes.byPerson(personId) });
      }
      if (visitId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.notes.byVisit(visitId) });
      }
    },
  });
}

export function useDeleteNoteMutation(personId: string | null, visitId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) =>
      withOfflineQueue(
        () => deleteNote(noteId),
        { type: 'DELETE_NOTE', payload: { noteId } },
      ),
    onSuccess: () => {
      if (personId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.notes.byPerson(personId) });
      }
      if (visitId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.notes.byVisit(visitId) });
      }
    },
  });
}
