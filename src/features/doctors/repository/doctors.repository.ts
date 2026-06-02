// src/features/doctors/repository/doctors.repository.ts
// Doctors repository — only place Supabase is called for doctor data.

import { supabase } from '@/lib/supabase';
import { handleNetworkError } from '@/core/network/errorHandler';

import type { DbDoctor } from '@/shared/types/database';

// Fetch all doctors in the family group
export async function fetchDoctors(): Promise<DbDoctor[]> {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('id, name, type, address, phone, family_group_id')
      .order('name', { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    handleNetworkError(error);
  }
}

// Fetch doctors linked to a specific person via people_doctors join table
export async function fetchDoctorIdsByPerson(personId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('people_doctors')
      .select('doctor_id')
      .eq('person_id', personId);

    if (error) throw error;
    return (data ?? []).map((row) => row.doctor_id);
  } catch (error) {
    handleNetworkError(error);
  }
}

// Fetch a single doctor by id
export async function fetchDoctorById(doctorId: string): Promise<DbDoctor | null> {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('id, name, type, address, phone, family_group_id')
      .eq('id', doctorId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    handleNetworkError(error);
  }
}

export interface InsertDoctorParams {
  name: string;
  type: string | null;
  address: string | null;
  phone: string | null;
  familyGroupId: string;
}

export async function insertDoctor(params: InsertDoctorParams): Promise<DbDoctor> {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .insert({
        name: params.name,
        type: params.type,
        address: params.address,
        phone: params.phone,
        family_group_id: params.familyGroupId,
      })
      .select('id, name, type, address, phone, family_group_id')
      .single();

    if (error) throw error;
    if (!data) throw new Error('Insert returned no data.');
    return data;
  } catch (error) {
    handleNetworkError(error);
  }
}

export interface UpdateDoctorParams {
  doctorId: string;
  name: string;
  type: string | null;
  address: string | null;
  phone: string | null;
}

export async function updateDoctor(params: UpdateDoctorParams): Promise<DbDoctor> {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .update({
        name: params.name,
        type: params.type,
        address: params.address,
        phone: params.phone,
      })
      .eq('id', params.doctorId)
      .select('id, name, type, address, phone, family_group_id')
      .single();

    if (error) throw error;
    if (!data) throw new Error('Update returned no data.');
    return data;
  } catch (error) {
    handleNetworkError(error);
  }
}

// Link a doctor to a person
export async function linkDoctorToPerson(
  doctorId: string,
  personId: string,
): Promise<void> {
  try {
    const { error } = await supabase
      .from('people_doctors')
      .insert({ doctor_id: doctorId, person_id: personId });
    if (error) throw error;
  } catch (error) {
    handleNetworkError(error);
  }
}

// Unlink a doctor from a person
export async function unlinkDoctorFromPerson(
  doctorId: string,
  personId: string,
): Promise<void> {
  try {
    const { error } = await supabase
      .from('people_doctors')
      .delete()
      .eq('doctor_id', doctorId)
      .eq('person_id', personId);
    if (error) throw error;
  } catch (error) {
    handleNetworkError(error);
  }
}
