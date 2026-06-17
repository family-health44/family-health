// src/features/visits/queries/visits.queries.ts
// TanStack Query wrappers for visit data.
// Joins person and doctor names at the query layer.

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import { fetchVisits } from '../repository/visits.repository';
import { fetchPeople } from '@/features/family/repository/family.repository';
import { fetchDoctors } from '@/features/doctors/repository/doctors.repository';
import { mapDbVisitToVisit, groupVisitsForList } from '../domain/visits.domain';
import { sortPeopleByCreation } from '@/shared/utils/personOrder';

import type { Visit } from '../types/visits.types';
import type { VisitListGroup } from '../domain/visits.domain';

// Fetches all visits with person + doctor names joined
async function fetchVisitsWithNames(): Promise<Visit[]> {
  const [dbVisits, dbPeople, dbDoctors] = await Promise.all([
    fetchVisits(),
    fetchPeople(),
    fetchDoctors(),
  ]);

  const personMap = new Map(dbPeople.map((p) => [p.id, p.name]));
  const orderedPeople = sortPeopleByCreation(dbPeople);
  const colourIndexMap = new Map(orderedPeople.map((p, i) => [p.id, i]));
  const doctorMap = new Map(dbDoctors.map((d) => [d.id, d.name]));

  return dbVisits.map((db) =>
    mapDbVisitToVisit(
      db,
      personMap.get(db.person_id) ?? 'Unknown',
      colourIndexMap.get(db.person_id) ?? 0,
      db.doctor_id ? (doctorMap.get(db.doctor_id) ?? null) : null,
    ),
  );
}

// All visits grouped for the list view
export function useVisitsListQuery() {
  return useQuery<VisitListGroup[], Error>({
    queryKey: queryKeys.visits.list(),
    queryFn: async () => {
      const visits = await fetchVisitsWithNames();
      return groupVisitsForList(visits);
    },
  });
}

// All visits as flat array — used by calendar views to map onto days
export function useVisitsForCalendarQuery() {
  return useQuery<Visit[], Error>({
    queryKey: [...queryKeys.visits.list(), 'calendar'],
    queryFn: fetchVisitsWithNames,
  });
}
