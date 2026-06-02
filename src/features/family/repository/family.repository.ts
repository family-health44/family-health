// src/features/family/repository/family.repository.ts
// Family repository — the ONLY place Supabase is called for family data.
// Returns raw database types — domain mapping happens in queries/hooks.
// Uses my_family_group_ids() RLS helper to scope all queries automatically.

import { supabase } from '@/lib/supabase';
import { handleNetworkError } from '@/core/network/errorHandler';

import type { DbPerson, DbFamilyGroup } from '@/shared/types/database';

// Fetches the first family group the authenticated user belongs to.
// Returns null if the user has no family group (→ trigger onboarding).
export async function fetchFamilyGroup(): Promise<DbFamilyGroup | null> {
  try {
    const { data, error } = await supabase
      .from('family_groups')
      .select('id, name')
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    handleNetworkError(error);
  }
}

// Fetches all people in the authenticated user's family group.
// RLS my_family_group_ids() scopes this automatically — no manual filtering needed.
export async function fetchPeople(): Promise<DbPerson[]> {
  try {
    const { data, error } = await supabase
      .from('people')
      .select('id, name, family_group_id, colour')
      .order('name', { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    handleNetworkError(error);
  }
}

// Fetches a single person by id.
export async function fetchPersonById(personId: string): Promise<DbPerson | null> {
  try {
    const { data, error } = await supabase
      .from('people')
      .select('id, name, family_group_id, colour')
      .eq('id', personId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    handleNetworkError(error);
  }
}

// Adds a new person to the family group.
export async function insertPerson(
  name: string,
  familyGroupId: string,
): Promise<DbPerson> {
  try {
    const { data, error } = await supabase
      .from('people')
      .insert({ name, family_group_id: familyGroupId })
      .select('id, name, family_group_id, colour')
      .single();

    if (error) throw error;
    if (!data) throw new Error('Insert returned no data.');
    return data;
  } catch (error) {
    handleNetworkError(error);
  }
}

// Updates a person's name.
export async function updatePersonName(
  personId: string,
  name: string,
): Promise<DbPerson> {
  try {
    const { data, error } = await supabase
      .from('people')
      .update({ name })
      .eq('id', personId)
      .select('id, name, family_group_id, colour')
      .single();

    if (error) throw error;
    if (!data) throw new Error('Update returned no data.');
    return data;
  } catch (error) {
    handleNetworkError(error);
  }
}

// Deletes a person — cascades via DB foreign keys.
export async function deletePerson(personId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', personId);

    if (error) throw error;
  } catch (error) {
    handleNetworkError(error);
  }
}
