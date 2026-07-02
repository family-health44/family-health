// src/features/family/hooks/useFamilyHome.ts
// Hook — composes queries and mutations for FamilyHomeScreen.
// Screen imports only this hook — no direct query/mutation imports.

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import { useFamilyHomeQuery } from '../queries/family.queries';
import { useAddPersonMutation } from '../mutations/family.mutations';

import type { FamilyHomeData } from '../types/family.types';
import type { AppError } from '@/shared/types/errors';
import { isAppError, toAppError } from '@/shared/types/errors';

export interface UseFamilyHomeReturn {
  data: FamilyHomeData | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
  error: AppError | null;
  refresh: () => Promise<void>;
  addPerson: (name: string) => Promise<void>;
  isAddingPerson: boolean;
}

export function useFamilyHome(): UseFamilyHomeReturn {
  const queryClient = useQueryClient();
  const { data, isLoading, error: queryError, refetch } = useFamilyHomeQuery();
  const addMutation = useAddPersonMutation();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Spinner tracks manual pull-to-refresh only — never background refetches.
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try { await refetch(); } finally { setIsRefreshing(false); }
  }, [refetch]);

  const addPerson = useCallback(async (name: string): Promise<void> => {
    await addMutation.mutateAsync(name);
    // Invalidate to ensure colour indices recalculate correctly
    queryClient.invalidateQueries({ queryKey: queryKeys.family.people() });
  }, [addMutation, queryClient]);

  const error = queryError
    ? isAppError(queryError) ? queryError : toAppError(queryError)
    : null;

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    refresh,
    addPerson,
    isAddingPerson: addMutation.isPending,
  };
}
