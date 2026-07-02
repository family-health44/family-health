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
    // Person delete cascades in the DB (B12) across visits, medications,
    // medication_logs, notes, todos, documents, and medical events. Invalidate
    // each feature root (not the byPerson leaf) so the tab-level list() queries
    // refetch too — otherwise cascaded rows linger in cache until staleTime or a
    // manual pull-to-refresh (the F2 step-5 ghost-visits bug).
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.family.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.visits.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.medications.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.medicationLogs.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.medicalEvents.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all }),
    ]);
  }, [deleteMutation, queryClient]);
  return { updateName, deletePerson, isUpdating: updateMutation.isPending, isDeleting: deleteMutation.isPending };
}
