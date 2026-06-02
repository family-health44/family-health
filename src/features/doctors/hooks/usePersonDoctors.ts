// src/features/doctors/hooks/usePersonDoctors.ts
// Hook — composes doctor queries and mutations for the person doctors tab.

import { useCallback } from 'react';

import { usePersonDoctorsQuery } from '../queries/doctors.queries';
import { useAddDoctorMutation, useUnlinkDoctorMutation } from '../mutations/doctors.mutations';
import { isAppError, toAppError } from '@/shared/types/errors';

import type { Doctor } from '../types/doctors.types';
import type { AppError } from '@/shared/types/errors';

export interface UsePersonDoctorsReturn {
  doctors: Doctor[];
  isLoading: boolean;
  error: AppError | null;
  addDoctor: (params: { name: string; type: string | null; phone: string | null; address: string | null }) => Promise<void>;
  unlinkDoctor: (doctorId: string) => Promise<void>;
  isAdding: boolean;
}

export function usePersonDoctors(personId: string): UsePersonDoctorsReturn {
  const { data: doctors = [], isLoading, error: queryError } = usePersonDoctorsQuery(personId);
  const addMutation = useAddDoctorMutation(personId);
  const unlinkMutation = useUnlinkDoctorMutation(personId);

  const addDoctor = useCallback(async (params: {
    name: string;
    type: string | null;
    phone: string | null;
    address: string | null;
  }) => {
    await addMutation.mutateAsync(params);
  }, [addMutation]);

  const unlinkDoctor = useCallback(async (doctorId: string) => {
    await unlinkMutation.mutateAsync(doctorId);
  }, [unlinkMutation]);

  const error = queryError
    ? isAppError(queryError) ? queryError : toAppError(queryError)
    : null;

  return {
    doctors,
    isLoading,
    error,
    addDoctor,
    unlinkDoctor,
    isAdding: addMutation.isPending,
  };
}
