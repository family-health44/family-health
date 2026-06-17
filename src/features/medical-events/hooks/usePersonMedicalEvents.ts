// src/features/medical-events/hooks/usePersonMedicalEvents.ts
// Hook — composes medical event queries and mutations for the tab.

import { useCallback } from 'react';

import { usePersonMedicalEventsQuery } from '../queries/medical-events.queries';
import {
  useAddMedicalEventMutation,
  useUpdateMedicalEventMutation,
  useDeleteMedicalEventMutation,
} from '../mutations/medical-events.mutations';
import { isAppError, toAppError } from '@/shared/types/errors';

import type { MedicalEventGroup, MedicalEventType } from '../types/medical-events.types';
import type { AppError } from '@/shared/types/errors';

export interface AddEventInput {
  eventDate: string;
  eventType: MedicalEventType;
  description: string;
  doctorId: string | null;
}

export interface UpdateEventInput {
  noteId: string;
  eventDate: string;
  eventType: MedicalEventType;
  description: string;
  doctorId: string | null;
}
export interface UsePersonMedicalEventsReturn {
  groups: MedicalEventGroup[];
  isLoading: boolean;
  error: AppError | null;
  addEvent: (input: AddEventInput) => Promise<void>;
  updateEvent: (input: UpdateEventInput) => Promise<void>;
  deleteEvent: (noteId: string) => Promise<void>;
  isUpdating: boolean;
  isAdding: boolean;
}

export function usePersonMedicalEvents(personId: string): UsePersonMedicalEventsReturn {
  const { data: groups = [], isLoading, error: queryError } =
    usePersonMedicalEventsQuery(personId);
  const addMutation = useAddMedicalEventMutation(personId);
  const updateMutation = useUpdateMedicalEventMutation(personId);
  const deleteMutation = useDeleteMedicalEventMutation(personId);

  const addEvent = useCallback(async (input: AddEventInput) => {
    await addMutation.mutateAsync({ ...input, personId });
  }, [addMutation, personId]);

  const updateEvent = useCallback(async (input: UpdateEventInput) => {
    await updateMutation.mutateAsync(input);
  }, [updateMutation]);
  const deleteEvent = useCallback(async (noteId: string) => {
    await deleteMutation.mutateAsync(noteId);
  }, [deleteMutation]);

  const error = queryError
    ? isAppError(queryError) ? queryError : toAppError(queryError)
    : null;

  return { groups, isLoading, error, addEvent, updateEvent, deleteEvent, isAdding: addMutation.isPending, isUpdating: updateMutation.isPending };
}
