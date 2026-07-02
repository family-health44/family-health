// src/features/medications/mutations/medications.mutations.ts
// TanStack Query mutations for medication write operations.

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import { fetchFamilyGroup } from '@/features/family/repository/family.repository';
import {
  insertMedication,
  updateMedication,
  updateMedicationStatus,
  deleteMedication,
} from '../repository/medications.repository';

import type { InsertMedicationParams, UpdateMedicationParams } from '../repository/medications.repository';
import type { MedicationStatus } from '../types/medications.types';

type AddMedicationInput = Omit<InsertMedicationParams, 'familyGroupId'>;

export function useAddMedicationMutation(personId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddMedicationInput) => {
      const group = await fetchFamilyGroup();
      if (!group) throw new Error('No family group found.');
      return insertMedication({ ...input, familyGroupId: group.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.medications.byPerson(personId),
      });
    },
  });
}

export function useUpdateMedicationMutation(personId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateMedicationParams) => updateMedication(params),
    onSuccess: (_data, { medicationId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medications.byPerson(personId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.medications.detail(medicationId) });
    },
  });
}

export function useDeleteMedicationMutation(personId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (medicationId: string) => deleteMedication(medicationId),
    onSuccess: (_data, medicationId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medications.byPerson(personId) });
      queryClient.removeQueries({ queryKey: queryKeys.medications.detail(medicationId) });
      queryClient.removeQueries({ queryKey: queryKeys.medicationLogs.byMedication(medicationId) });
    },
  });
}

export function useUpdateMedicationStatusMutation(personId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ medicationId, status }: { medicationId: string; status: MedicationStatus }) =>
      updateMedicationStatus(medicationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.medications.byPerson(personId),
      });
    },
  });
}
