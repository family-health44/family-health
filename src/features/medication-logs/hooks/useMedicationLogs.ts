// src/features/medication-logs/hooks/useMedicationLogs.ts
// Composes log query + mutations + derived stats for the detail screen.

import { useCallback, useMemo } from 'react';

import { useMedicationLogsQuery } from '../queries/medication-logs.queries';
import {
  useAddMedicationLogMutation,
  useUpdateMedicationLogMutation,
  useDeleteMedicationLogMutation,
} from '../mutations/medication-logs.mutations';
import { computeLogStats } from '../domain/medication-logs.domain';
import { isAppError, toAppError } from '@/shared/types/errors';

import type {
  MedicationLog,
  MedicationLogFormValues,
  MedicationLogStats,
} from '../types/medication-logs.types';
import type { AppError } from '@/shared/types/errors';

interface AddArgs {
  personId: string;
  familyGroupId: string;
  values: MedicationLogFormValues;
}

export interface UseMedicationLogsReturn {
  logs: MedicationLog[];
  stats: MedicationLogStats;
  isLoading: boolean;
  error: AppError | null;
  addLog: (args: AddArgs) => Promise<void>;
  updateLog: (logId: string, values: MedicationLogFormValues) => Promise<void>;
  deleteLog: (logId: string) => Promise<void>;
  isSubmitting: boolean;
}

export function useMedicationLogs(medicationId: string): UseMedicationLogsReturn {
  const { data: logs = [], isLoading, error: queryError } = useMedicationLogsQuery(medicationId);
  const addMutation = useAddMedicationLogMutation(medicationId);
  const updateMutation = useUpdateMedicationLogMutation(medicationId);
  const deleteMutation = useDeleteMedicationLogMutation(medicationId);

  const stats = useMemo(() => computeLogStats(logs), [logs]);

  const addLog = useCallback(async ({ personId, familyGroupId, values }: AddArgs) => {
    await addMutation.mutateAsync({
      medicationId,
      personId,
      familyGroupId,
      loggedDate: values.loggedDate,
      loggedTime: values.loggedTime,
      feeling: values.feeling,
      doseStatus: values.doseStatus,
      note: values.note,
      tags: values.tags,
    });
  }, [addMutation, medicationId]);

  const updateLog = useCallback(async (logId: string, values: MedicationLogFormValues) => {
    await updateMutation.mutateAsync({
      logId,
      loggedDate: values.loggedDate,
      loggedTime: values.loggedTime,
      feeling: values.feeling,
      doseStatus: values.doseStatus,
      note: values.note,
      tags: values.tags,
    });
  }, [updateMutation]);

  const deleteLog = useCallback(async (logId: string) => {
    await deleteMutation.mutateAsync(logId);
  }, [deleteMutation]);

  const error = queryError
    ? isAppError(queryError) ? queryError : toAppError(queryError)
    : null;

  return {
    logs,
    stats,
    isLoading,
    error,
    addLog,
    updateLog,
    deleteLog,
    isSubmitting: addMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}
