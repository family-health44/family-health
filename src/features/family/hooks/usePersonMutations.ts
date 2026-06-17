// src/features/family/hooks/usePersonMutations.ts
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdatePersonMutation, useDeletePersonMutation } from '../mutations/family.mutations';
import { queryKeys } from '@/lib/queryClient';
export function usePersonMutations() {
  const queryClient = useQueryClient();
  const updateMutation = useUpdatePersonMutation();
  const deleteMutation = useDeletePersonMutation();
  const updateName = useCallback(async (personId: string, name: string) => {
    await updateMutation.mutateAsync({ personId, name });
    queryClient.invalidateQueries({ queryKey: queryKeys.family.people() });
  }, [updateMutation, queryClient]);
  const deletePerson = useCallback(async (personId: string) => {
    await deleteMutation.mutateAsync(personId);
    queryClient.invalidateQueries({ queryKey: queryKeys.family.people() });
  }, [deleteMutation, queryClient]);
  return { updateName, deletePerson, isUpdating: updateMutation.isPending, isDeleting: deleteMutation.isPending };
}
