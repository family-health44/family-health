import { db } from '@/lib/supabase';
import { handleNetworkError } from '@/core/network/errorHandler';
import type { DbPerson, DbFamilyGroup } from '@/shared/types/database';

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
      .select('id, name, family_group_id')
      .order('name');
    if (error) throw error;
    return data ?? [];
  } catch (error) { handleNetworkError(error); }
}

export async function fetchPersonById(personId: string): Promise<DbPerson | null> {
  try {
    const { data, error } = await db
      .from('people')
      .select('id, name, family_group_id')
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
      .select('id, name, family_group_id')
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
      .select('id, name, family_group_id')
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