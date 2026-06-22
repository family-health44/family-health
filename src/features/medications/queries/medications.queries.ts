// src/features/medications/queries/medications.queries.ts
// TanStack Query wrappers for medication data.

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import { fetchMedicationsByPerson, fetchMedicationById } from '../repository/medications.repository';
import { fetchDoctorById } from '@/features/doctors/repository/doctors.repository';
import {
  mapDbMedicationToMedication,
  groupMedicationsByStatus,
} from '../domain/medications.domain';

import type { MedicationGroup, Medication } from '../types/medications.types';

// Medications for a person grouped by status.
// Joins doctor name for display — avoids a separate query on every card.
export function usePersonMedicationsQuery(personId: string) {
  return useQuery<MedicationGroup[], Error>({
    queryKey: queryKeys.medications.byPerson(personId),
    queryFn: async () => {
      const dbMeds = await fetchMedicationsByPerson(personId);

      // Collect unique doctor ids so we can batch-fetch names
      const doctorIds = [...new Set(
        dbMeds.map((m) => m.prescribed_by).filter(Boolean) as string[],
      )];

      // Fetch doctor names in parallel
      const doctorMap = new Map<string, string>();
      await Promise.all(
        doctorIds.map(async (id) => {
          const doc = await fetchDoctorById(id);
          if (doc) doctorMap.set(id, doc.name);
        }),
      );

      const medications = dbMeds.map((db) =>
        mapDbMedicationToMedication(
          db,
          db.prescribed_by ? (doctorMap.get(db.prescribed_by) ?? null) : null,
        ),
      );

      return groupMedicationsByStatus(medications);
    },
    enabled: Boolean(personId),
  });
}

// Single medication by id (for the detail screen). Joins the prescribing doctor name.
export function useMedicationDetailQuery(medicationId: string) {
  return useQuery<Medication | null, Error>({
    queryKey: queryKeys.medications.detail(medicationId),
    queryFn: async () => {
      const dbMed = await fetchMedicationById(medicationId);
      if (!dbMed) return null;
      let doctorName: string | null = null;
      if (dbMed.prescribed_by) {
        const doc = await fetchDoctorById(dbMed.prescribed_by);
        doctorName = doc?.name ?? null;
      }
      return mapDbMedicationToMedication(dbMed, doctorName);
    },
    enabled: Boolean(medicationId),
  });
}
