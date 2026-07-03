// src/features/medications/repository/medications.repository.ts
// Medications repository — only place Supabase is called for medication data.

import { db } from '@/lib/supabase';
import { handleNetworkError } from '@/core/network/errorHandler';

import type { DbMedication } from '@/shared/types/database';
import type { MedicationStatus } from '../types/medications.types';

// Column list shared by every query — one source of truth (prevents silent field-drop).
const COLS = 'id, name, dosage, frequency, reason, status, start_date, end_date, person_id, prescribed_by, family_group_id, form, time_of_day, with_food, repeats_left, next_refill, pharmacy';

// Fetch all medications for a specific person
export async function fetchMedicationsByPerson(personId: string): Promise<DbMedication[]> {
  try {
    const { data, error } = await db
      .from('medications')
      .select(COLS)
      .eq('person_id', personId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    handleNetworkError(error);
  }
}

// Fetch a single medication by id
export async function fetchMedicationById(medicationId: string): Promise<DbMedication | null> {
  try {
    const { data, error } = await db
      .from('medications')
      .select(COLS)
      .eq('id', medicationId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    handleNetworkError(error);
  }
}

export interface InsertMedicationParams {
  name: string;
  dosage: string | null;
  frequency: string | null;
  reason: string | null;
  status: MedicationStatus;
  startDate: string | null;
  endDate: string | null;
  personId: string;
  prescribedBy: string | null;
  familyGroupId: string;
  form: string | null;
  timeOfDay: string | null;
  withFood: string | null;
  repeatsLeft: number | null;
  nextRefill: string | null;
  pharmacy: string | null;
}

export async function insertMedication(params: InsertMedicationParams): Promise<DbMedication> {
  try {
    const { data, error } = await db
      .from('medications')
      .insert({
        name: params.name,
        dosage: params.dosage,
        frequency: params.frequency,
        reason: params.reason,
        status: params.status,
        start_date: params.startDate,
        end_date: params.endDate,
        person_id: params.personId,
        prescribed_by: params.prescribedBy,
        family_group_id: params.familyGroupId,
        form: params.form,
        time_of_day: params.timeOfDay,
        with_food: params.withFood,
        repeats_left: params.repeatsLeft,
        next_refill: params.nextRefill,
        pharmacy: params.pharmacy,
      })
      .select(COLS)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Insert returned no data.');
    return data;
  } catch (error) {
    handleNetworkError(error);
  }
}

export interface UpdateMedicationParams {
  medicationId: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  reason: string | null;
  status: MedicationStatus;
  startDate: string | null;
  endDate: string | null;
  prescribedBy: string | null;
  form: string | null;
  timeOfDay: string | null;
  withFood: string | null;
  repeatsLeft: number | null;
  nextRefill: string | null;
  pharmacy: string | null;
}

export async function updateMedication(params: UpdateMedicationParams): Promise<DbMedication> {
  try {
    const { data, error } = await db
      .from('medications')
      .update({
        name: params.name,
        dosage: params.dosage,
        frequency: params.frequency,
        reason: params.reason,
        status: params.status,
        start_date: params.startDate,
        end_date: params.endDate,
        prescribed_by: params.prescribedBy,
        form: params.form,
        time_of_day: params.timeOfDay,
        with_food: params.withFood,
        repeats_left: params.repeatsLeft,
        next_refill: params.nextRefill,
        pharmacy: params.pharmacy,
      })
      .eq('id', params.medicationId)
      .select(COLS)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Update returned no data.');
    return data;
  } catch (error) {
    handleNetworkError(error);
  }
}

// Delete a medication. medication_logs cascade on medication_id at the DB level.
export async function deleteMedication(medicationId: string): Promise<void> {
  try {
    const { error } = await db
      .from('medications')
      .delete()
      .eq('id', medicationId);

    if (error) throw error;
  } catch (error) {
    handleNetworkError(error);
  }
}

// Quickly update just the status — used for active/inactive toggle
export async function updateMedicationStatus(
  medicationId: string,
  status: MedicationStatus,
): Promise<void> {
  try {
    const { error } = await db
      .from('medications')
      .update({ status })
      .eq('id', medicationId);

    if (error) throw error;
  } catch (error) {
    handleNetworkError(error);
  }
}


// Count of all medications across the family group (head request — 0 rows transferred).
// Used by the Family home "Get started" nudges to detect whether any medication exists.
export async function fetchMedicationsCount(): Promise<number> {
  try {
    const { count, error } = await db
      .from('medications')
      .select('id', { count: 'exact', head: true });

    if (error) throw error;
    return count ?? 0;
  } catch (error) {
    handleNetworkError(error);
  }
}
