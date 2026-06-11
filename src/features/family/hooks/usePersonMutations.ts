// src/features/family/hooks/usePersonMutations.ts
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdatePersonMutation } from '../mutations/family.mutations';
import { queryKeys } from '@/lib/queryClient';

export function usePersonMutations() {
  const queryClient = useQueryClient();
  const updateMutation = useUpdatePersonMutation();
  const updateName = useCallback(async (personId: string, name: string) => {
    await updateMutation.mutateAsync({ personId, name });
    queryClient.invalidateQueries({ queryKey: queryKeys.family.people() });
  }, [updateMutation, queryClient]);
  return { updateName, isUpdating: updateMutation.isPending };
}
