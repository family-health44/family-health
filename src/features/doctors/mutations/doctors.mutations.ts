// src/features/doctors/mutations/doctors.mutations.ts
// TanStack Query mutations for doctor write operations.

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import { fetchFamilyGroup } from '@/features/family/repository/family.repository';
import {
  insertDoctor,
  updateDoctor,
  linkDoctorToPerson,
  unlinkDoctorFromPerson,
} from '../repository/doctors.repository';

import type { InsertDoctorParams, UpdateDoctorParams } from '../repository/doctors.repository';

type AddDoctorInput = Omit<InsertDoctorParams, 'familyGroupId'>;

export function useAddDoctorMutation(personId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddDoctorInput) => {
      const group = await fetchFamilyGroup();
      if (!group) throw new Error('No family group found.');

      const doctor = await insertDoctor({ ...input, familyGroupId: group.id });

      // If adding from a person's screen, auto-link them
      if (personId) {
        await linkDoctorToPerson(doctor.id, personId);
      }

      return doctor;
    },
    onSuccess: (_data, _vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.list() });
      if (personId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.doctors.byPerson(personId) });
      }
    },
  });
}

export function useUpdateDoctorMutation(personId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateDoctorParams) => updateDoctor(params),
    onSuccess: (_data, { doctorId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.detail(doctorId) });
      if (personId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.doctors.byPerson(personId) });
      }
    },
  });
}

export function useLinkDoctorMutation(personId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (doctorId: string) => linkDoctorToPerson(doctorId, personId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.byPerson(personId) });
    },
  });
}

export function useUnlinkDoctorMutation(personId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (doctorId: string) => unlinkDoctorFromPerson(doctorId, personId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.byPerson(personId) });
    },
  });
}
