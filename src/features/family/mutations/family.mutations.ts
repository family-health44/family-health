// src/features/family/mutations/family.mutations.ts
// TanStack Query useMutation wrappers for family write operations.
// Invalidates relevant query keys after each mutation so UI stays fresh.

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import {
  insertPerson,
  updatePersonName,
  deletePerson,
} from '../repository/family.repository';
import { fetchFamilyGroup } from '../repository/family.repository';

// ─── Add person ───────────────────────────────────────────────────────────────

export function useAddPersonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const group = await fetchFamilyGroup();
      if (!group) throw new Error('No family group found.');
      return insertPerson(name, group.id);
    },
    onSuccess: () => {
      // Invalidate people list so FamilyHomeScreen refetches
      queryClient.invalidateQueries({ queryKey: queryKeys.family.people() });
    },
  });
}

// ─── Update person name ───────────────────────────────────────────────────────

export function useUpdatePersonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ personId, name }: { personId: string; name: string }) =>
      updatePersonName(personId, name),
    onSuccess: (_data, { personId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.family.people() });
      queryClient.invalidateQueries({ queryKey: queryKeys.family.person(personId) });
    },
  });
}

// ─── Delete person ────────────────────────────────────────────────────────────

export function useDeletePersonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (personId: string) => deletePerson(personId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.family.people() });
    },
  });
}
