// src/features/visits/mutations/visits.mutations.ts
// TanStack Query mutations for visit write operations.

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import { fetchFamilyGroup } from '@/features/family/repository/family.repository';
import { insertVisit, updateVisit, deleteVisit } from '../repository/visits.repository';

import type { InsertVisitParams, UpdateVisitParams } from '../repository/visits.repository';

type AddVisitInput = Omit<InsertVisitParams, 'familyGroupId'>;

export function useAddVisitMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddVisitInput) => {
      const group = await fetchFamilyGroup();
      if (!group) throw new Error('No family group found.');
      return insertVisit({ ...input, familyGroupId: group.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.visits.all });
    },
  });
}

export function useUpdateVisitMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateVisitParams) => updateVisit(params),
    onSuccess: (_data, { visitId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.visits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.visits.detail(visitId) });
    },
  });
}

export function useDeleteVisitMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (visitId: string) => deleteVisit(visitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.visits.all });
    },
  });
}
