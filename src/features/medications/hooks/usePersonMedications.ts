// src/features/medications/hooks/usePersonMedications.ts
// Hook — composes medication queries and mutations for the person medications tab.

import { useCallback } from 'react';

import { usePersonMedicationsQuery } from '../queries/medications.queries';
import { useAddMedicationMutation, useUpdateMedicationStatusMutation } from '../mutations/medications.mutations';
import { isAppError, toAppError } from '@/shared/types/errors';

import type { MedicationGroup, MedicationStatus } from '../types/medications.types';
import type { InsertMedicationParams } from '../repository/medications.repository';
import type { AppError } from '@/shared/types/errors';

type AddMedicationInput = Omit<InsertMedicationParams, 'familyGroupId'>;

export interface UsePersonMedicationsReturn {
  groups: MedicationGroup[];
  isLoading: boolean;
  error: AppError | null;
  addMedication: (input: AddMedicationInput) => Promise<void>;
  updateStatus: (medicationId: string, status: MedicationStatus) => Promise<void>;
  isAdding: boolean;
}

export function usePersonMedications(personId: string): UsePersonMedicationsReturn {
  const { data: groups = [], isLoading, error: queryError } = usePersonMedicationsQuery(personId);
  const addMutation = useAddMedicationMutation(personId);
  const statusMutation = useUpdateMedicationStatusMutation(personId);

  const addMedication = useCallback(async (input: AddMedicationInput) => {
    await addMutation.mutateAsync(input);
  }, [addMutation]);

  const updateStatus = useCallback(async (medicationId: string, status: MedicationStatus) => {
    await statusMutation.mutateAsync({ medicationId, status });
  }, [statusMutation]);

  const error = queryError
    ? isAppError(queryError) ? queryError : toAppError(queryError)
    : null;

  return { groups, isLoading, error, addMedication, updateStatus, isAdding: addMutation.isPending };
}
