// src/features/medication-logs/repository/medication-logs.repository.ts
// Medication logs repository — only place Supabase is called for log data.

import { db } from '@/lib/supabase';
import { handleNetworkError } from '@/core/network/errorHandler';

import type { DbMedicationLog } from '@/shared/types/database';

const COLUMNS =
  'id, medication_id, person_id, family_group_id, logged_date, logged_time, feeling, dose_status, note, tags, created_at';

export async function fetchLogsByMedication(medicationId: string): Promise<DbMedicationLog[]> {
  try {
    const { data, error } = await db
      .from('medication_logs')
      .select(COLUMNS)
      .eq('medication_id', medicationId)
      .order('logged_date', { ascending: false });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    handleNetworkError(error);
  }
}

export interface InsertMedicationLogParams {
  medicationId: string;
  personId: string;
  familyGroupId: string;
  loggedDate: string;
  loggedTime: string | null;
  feeling: number | null;
  doseStatus: string | null;
  note: string | null;
  tags: string[];
}

export async function insertMedicationLog(
  params: InsertMedicationLogParams,
): Promise<DbMedicationLog> {
  try {
    const { data, error } = await db
      .from('medication_logs')
      .insert({
        medication_id: params.medicationId,
        person_id: params.personId,
        family_group_id: params.familyGroupId,
        logged_date: params.loggedDate,
        logged_time: params.loggedTime,
        feeling: params.feeling,
        dose_status: params.doseStatus,
        note: params.note,
        tags: params.tags,
      })
      .select(COLUMNS)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Insert returned no data.');
    return data;
  } catch (error) {
    handleNetworkError(error);
  }
}

export interface UpdateMedicationLogParams {
  logId: string;
  loggedDate: string;
  loggedTime: string | null;
  feeling: number | null;
  doseStatus: string | null;
  note: string | null;
  tags: string[];
}

export async function updateMedicationLog(
  params: UpdateMedicationLogParams,
): Promise<DbMedicationLog> {
  try {
    const { data, error } = await db
      .from('medication_logs')
      .update({
        logged_date: params.loggedDate,
        logged_time: params.loggedTime,
        feeling: params.feeling,
        dose_status: params.doseStatus,
        note: params.note,
        tags: params.tags,
      })
      .eq('id', params.logId)
      .select(COLUMNS)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Update returned no data.');
    return data;
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function deleteMedicationLog(logId: string): Promise<void> {
  try {
    const { error } = await db
      .from('medication_logs')
      .delete()
      .eq('id', logId);

    if (error) throw error;
  } catch (error) {
    handleNetworkError(error);
  }
}
