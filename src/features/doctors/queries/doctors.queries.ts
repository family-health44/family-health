// src/features/doctors/queries/doctors.queries.ts
// TanStack Query wrappers for doctor data.

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import { fetchDoctors, fetchDoctorIdsByPerson } from '../repository/doctors.repository';
import { mapDbDoctorToDoctor, groupDoctorsByType, filterDoctorsByPerson } from '../domain/doctors.domain';

import type { Doctor, DoctorGroup } from '../types/doctors.types';

// All doctors grouped by type — for the main doctors screen
export function useDoctorsQuery() {
  return useQuery<DoctorGroup[], Error>({
    queryKey: queryKeys.doctors.list(),
    queryFn: async () => {
      const dbDoctors = await fetchDoctors();
      const doctors = dbDoctors.map(mapDbDoctorToDoctor);
      return groupDoctorsByType(doctors);
    },
  });
}

// Doctors assigned to a specific person — for person detail tab
export function usePersonDoctorsQuery(personId: string) {
  return useQuery<Doctor[], Error>({
    queryKey: queryKeys.doctors.byPerson(personId),
    queryFn: async () => {
      const [dbDoctors, personDoctorIds] = await Promise.all([
        fetchDoctors(),
        fetchDoctorIdsByPerson(personId),
      ]);
      const doctors = dbDoctors.map(mapDbDoctorToDoctor);
      return filterDoctorsByPerson(doctors, personDoctorIds);
    },
    enabled: Boolean(personId),
  });
}
