import { db } from '@/lib/supabase';
import { handleNetworkError } from '@/core/network/errorHandler';
import type { DbPerson, DbFamilyGroup } from '@/shared/types/database';

// Shared column list so every person read returns the full row (incl. Info Card fields).
const PERSON_COLUMNS =
  'id, name, family_group_id, dob, medicare_number, blood_type, immunisations_current, allergies, diagnoses, health_fund, health_fund_number, emergency_contact, emergency_phone, notes';

export async function fetchFamilyGroup(): Promise<DbFamilyGroup | null> {
  try {
    const { data, error } = await db
      .from('family_groups')
      .select('id, name')
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) { handleNetworkError(error); }
}

export async function fetchPeople(): Promise<DbPerson[]> {
  try {
    const { data, error } = await db
      .from('people')
      .select(PERSON_COLUMNS)
      .order('name');
    if (error) throw error;
    return data ?? [];
  } catch (error) { handleNetworkError(error); }
}

export async function fetchPersonById(personId: string): Promise<DbPerson | null> {
  try {
    const { data, error } = await db
      .from('people')
      .select(PERSON_COLUMNS)
      .eq('id', personId)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) { handleNetworkError(error); }
}

export async function insertPerson(name: string, familyGroupId: string): Promise<DbPerson> {
  try {
    const { data, error } = await db
      .from('people')
      .insert({ name, family_group_id: familyGroupId })
      .select(PERSON_COLUMNS)
      .single();
    if (error) throw error;
    if (!data) throw new Error('Insert returned no data.');
    return data;
  } catch (error) { handleNetworkError(error); }
}

export async function updatePersonName(personId: string, name: string): Promise<DbPerson> {
  try {
    const { data, error } = await db
      .from('people')
      .update({ name })
      .eq('id', personId)
      .select(PERSON_COLUMNS)
      .single();
    if (error) throw error;
    if (!data) throw new Error('Update returned no data.');
    return data;
  } catch (error) { handleNetworkError(error); }
}

// Info Card fields. Pass only the columns to change; undefined keys are stripped
// so a partial update never nulls an unspecified field.
export interface UpdatePersonInfoParams {
  dob?: string | null;
  medicare_number?: string | null;
  blood_type?: string | null;
  immunisations_current?: boolean | null;
  allergies?: string | null;
  diagnoses?: string | null;
  health_fund?: string | null;
  health_fund_number?: string | null;
  emergency_contact?: string | null;
  emergency_phone?: string | null;
  notes?: string | null;
}

export async function updatePersonInfo(
  personId: string,
  fields: UpdatePersonInfoParams,
): Promise<DbPerson> {
  try {
    const payload: UpdatePersonInfoParams = {};
    (Object.keys(fields) as (keyof UpdatePersonInfoParams)[]).forEach((k) => {
      if (fields[k] !== undefined) (payload as Record<string, unknown>)[k] = fields[k];
    });
    const { data, error } = await db
      .from('people')
      .update(payload)
      .eq('id', personId)
      .select(PERSON_COLUMNS)
      .single();
    if (error) throw error;
    if (!data) throw new Error('Update returned no data.');
    return data;
  } catch (error) { handleNetworkError(error); }
}

export async function deletePerson(personId: string): Promise<void> {
  try {
    const { error } = await db
      .from('people')
      .delete()
      .eq('id', personId);
    if (error) throw error;
  } catch (error) { handleNetworkError(error); }
}
