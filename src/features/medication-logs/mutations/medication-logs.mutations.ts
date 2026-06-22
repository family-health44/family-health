// src/features/medication-logs/mutations/medication-logs.mutations.ts
// TanStack Query mutations for medication log writes.
// Direct mutations (no offline queue) — matches the Info Card decision (B8 deferred).
// Surfaces an error if offline; never silently loses a write.

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import {
  insertMedicationLog,
  updateMedicationLog,
  deleteMedicationLog,
} from '../repository/medication-logs.repository';

import type {
  InsertMedicationLogParams,
  UpdateMedicationLogParams,
} from '../repository/medication-logs.repository';

export function useAddMedicationLogMutation(medicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: InsertMedicationLogParams) => insertMedicationLog(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.medicationLogs.byMedication(medicationId),
      });
    },
  });
}

export function useUpdateMedicationLogMutation(medicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: UpdateMedicationLogParams) => updateMedicationLog(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.medicationLogs.byMedication(medicationId),
      });
    },
  });
}

export function useDeleteMedicationLogMutation(medicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (logId: string) => deleteMedicationLog(logId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.medicationLogs.byMedication(medicationId),
      });
    },
  });
}
