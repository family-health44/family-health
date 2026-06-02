// src/features/medical-events/hooks/usePersonMedicalEvents.ts
// Hook — composes medical event queries and mutations for the tab.

import { useCallback } from 'react';

import { usePersonMedicalEventsQuery } from '../queries/medical-events.queries';
import {
  useAddMedicalEventMutation,
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

export interface UsePersonMedicalEventsReturn {
  groups: MedicalEventGroup[];
  isLoading: boolean;
  error: AppError | null;
  addEvent: (input: AddEventInput) => Promise<void>;
  deleteEvent: (noteId: string) => Promise<void>;
  isAdding: boolean;
}

export function usePersonMedicalEvents(personId: string): UsePersonMedicalEventsReturn {
  const { data: groups = [], isLoading, error: queryError } =
    usePersonMedicalEventsQuery(personId);
  const addMutation = useAddMedicalEventMutation(personId);
  const deleteMutation = useDeleteMedicalEventMutation(personId);

  const addEvent = useCallback(async (input: AddEventInput) => {
    await addMutation.mutateAsync({ ...input, personId });
  }, [addMutation, personId]);

  const deleteEvent = useCallback(async (noteId: string) => {
    await deleteMutation.mutateAsync(noteId);
  }, [deleteMutation]);

  const error = queryError
    ? isAppError(queryError) ? queryError : toAppError(queryError)
    : null;

  return { groups, isLoading, error, addEvent, deleteEvent, isAdding: addMutation.isPending };
}
