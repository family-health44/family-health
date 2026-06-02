// src/features/family/queries/family.queries.ts
// TanStack Query useQuery wrappers for family data.
// Calls repository only — no direct Supabase access.
// Maps raw db types to domain types via domain functions.

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import { fetchFamilyGroup, fetchPeople } from '../repository/family.repository';
import { buildFamilyHomeData } from '../domain/family.domain';

import type { FamilyHomeData, Person } from '../types/family.types';

// Fetches family group + all people, assembled into FamilyHomeData.
export function useFamilyHomeQuery() {
  return useQuery<FamilyHomeData, Error>({
    queryKey: queryKeys.family.people(),
    queryFn: async () => {
      const [group, people] = await Promise.all([
        fetchFamilyGroup(),
        fetchPeople(),
      ]);

      if (!group) {
        throw new Error('No family group found. Please complete onboarding.');
      }

      return buildFamilyHomeData(group, people);
    },
  });
}

// Fetches a single person by id from the cached people list.
// Falls back to a dedicated query if not in cache.
export function usePersonQuery(personId: string) {
  return useQuery<Person | null, Error>({
    queryKey: queryKeys.family.person(personId),
    queryFn: async () => {
      const [group, people] = await Promise.all([
        fetchFamilyGroup(),
        fetchPeople(),
      ]);
      if (!group) return null;

      const homeData = buildFamilyHomeData(group, people);
      return homeData.people.find((p) => p.id === personId) ?? null;
    },
  });
}
