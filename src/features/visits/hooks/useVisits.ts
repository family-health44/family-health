// src/features/visits/hooks/useVisits.ts
// Hook — composes visits queries and mutations for VisitsScreen.

import { useState, useCallback } from 'react';

import { useVisitsListQuery, useVisitsForCalendarQuery } from '../queries/visits.queries';
import { useAddVisitMutation } from '../mutations/visits.mutations';
import { isAppError, toAppError } from '@/shared/types/errors';

import type { VisitsViewMode } from '../types/visits.types';
import type { InsertVisitParams } from '../repository/visits.repository';
import type { AppError } from '@/shared/types/errors';

type AddVisitInput = Omit<InsertVisitParams, 'familyGroupId'>;

export interface UseVisitsReturn {
  viewMode: VisitsViewMode;
  setViewMode: (mode: VisitsViewMode) => void;
  listGroups: ReturnType<typeof useVisitsListQuery>['data'];
  calendarVisits: ReturnType<typeof useVisitsForCalendarQuery>['data'];
  isLoading: boolean;
  error: AppError | null;
  addVisit: (input: AddVisitInput) => Promise<void>;
  isAdding: boolean;
  refetch: () => void;
}

export function useVisits(): UseVisitsReturn {
  const [viewMode, setViewMode] = useState<VisitsViewMode>('list');

  const listQuery = useVisitsListQuery();
  const calendarQuery = useVisitsForCalendarQuery();
  const addMutation = useAddVisitMutation();

  const addVisit = useCallback(async (input: AddVisitInput) => {
    await addMutation.mutateAsync(input);
  }, [addMutation]);

  const refetch = useCallback(() => {
    listQuery.refetch();
    calendarQuery.refetch();
  }, [listQuery, calendarQuery]);

  const rawError = listQuery.error ?? calendarQuery.error;
  const error = rawError
    ? isAppError(rawError) ? rawError : toAppError(rawError)
    : null;

  return {
    viewMode,
    setViewMode,
    listGroups: listQuery.data,
    calendarVisits: calendarQuery.data,
    isLoading: listQuery.isLoading || calendarQuery.isLoading,
    error,
    addVisit,
    isAdding: addMutation.isPending,
    refetch,
  };
}
