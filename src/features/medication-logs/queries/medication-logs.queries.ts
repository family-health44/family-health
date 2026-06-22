// src/features/medication-logs/queries/medication-logs.queries.ts
// TanStack Query wrappers for medication log data.

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import { fetchLogsByMedication } from '../repository/medication-logs.repository';
import { mapDbMedicationLogToLog, sortLogsNewestFirst } from '../domain/medication-logs.domain';

import type { MedicationLog } from '../types/medication-logs.types';

export function useMedicationLogsQuery(medicationId: string) {
  return useQuery<MedicationLog[], Error>({
    queryKey: queryKeys.medicationLogs.byMedication(medicationId),
    queryFn: async () => {
      const dbLogs = await fetchLogsByMedication(medicationId);
      return sortLogsNewestFirst(dbLogs.map(mapDbMedicationLogToLog));
    },
    enabled: Boolean(medicationId),
  });
}
