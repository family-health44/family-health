// src/features/medical-events/mutations/medical-events.mutations.ts
// Medical events are stored as notes — mutations call the notes repository.

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import { fetchFamilyGroup } from '@/features/family/repository/family.repository';
import { insertNote, updateNote, deleteNote } from '@/features/notes/repository/notes.repository';
import { buildEventNoteContent } from '../domain/medical-events.domain';

import type { MedicalEventType } from '../types/medical-events.types';

export interface AddMedicalEventInput {
  eventDate: string;
  eventType: MedicalEventType;
  description: string;
  personId: string;
  doctorId: string | null;
}

export function useAddMedicalEventMutation(personId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddMedicalEventInput) => {
      const group = await fetchFamilyGroup();
      if (!group) throw new Error('No family group found.');

      const content = buildEventNoteContent(
        input.eventDate,
        input.eventType,
        input.description,
      );

      return insertNote({
        content,
        personId: input.personId,
        doctorId: input.doctorId,
        medicationId: null,
        visitId: null,
        familyGroupId: group.id,
        hidden: false,
      });
    },
    onSuccess: () => {
      // Invalidate both medical events and notes — they share the same source
      queryClient.invalidateQueries({
        queryKey: queryKeys.medicalEvents.byPerson(personId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.notes.byPersonBase(personId),
      });
    },
  });
}

export interface UpdateMedicalEventInput {
  noteId: string;
  eventDate: string;
  eventType: MedicalEventType;
  description: string;
  doctorId: string | null;
}
export function useUpdateMedicalEventMutation(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateMedicalEventInput) => {
      const content = buildEventNoteContent(
        input.eventDate,
        input.eventType,
        input.description,
      );
      return updateNote({
        noteId: input.noteId,
        content,
        doctorId: input.doctorId,
        medicationId: null,
        visitId: null,
        hidden: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.medicalEvents.byPerson(personId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.notes.byPersonBase(personId),
      });
    },
  });
}
export function useDeleteMedicalEventMutation(personId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.medicalEvents.byPerson(personId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.notes.byPersonBase(personId),
      });
    },
  });
}
