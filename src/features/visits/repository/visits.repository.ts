import { supabase } from '@/lib/supabase';
import { handleNetworkError } from '@/core/network/errorHandler';
import type { DbVisit } from '@/shared/types/database';

export async function fetchVisits(): Promise<DbVisit[]> {
  try {
    const { data, error } = await supabase.from('visits').select('id, title, visit_date, doctor_id, person_id, family_group_id, pre_notes, post_notes').order('visit_date', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(v => ({ ...v, visit_time: null }));
  } catch (error) { handleNetworkError(error); }
}

export async function fetchVisitsByDateRange(startDate: string, endDate: string): Promise<DbVisit[]> {
  try {
    const { data, error } = await supabase.from('visits').select('id, title, visit_date, doctor_id, person_id, family_group_id, pre_notes, post_notes').gte('visit_date', startDate).lte('visit_date', endDate).order('visit_date');
    if (error) throw error;
    return (data ?? []).map(v => ({ ...v, visit_time: null }));
  } catch (error) { handleNetworkError(error); }
}

export async function fetchVisitById(visitId: string): Promise<DbVisit | null> {
  try {
    const { data, error } = await supabase.from('visits').select('id, title, visit_date, doctor_id, person_id, family_group_id, pre_notes, post_notes').eq('id', visitId).maybeSingle();
    if (error) throw error;
    return data ? { ...data, visit_time: null } : null;
  } catch (error) { handleNetworkError(error); }
}

export interface InsertVisitParams { title: string; visitDate: string; visitTime: string | null; doctorId: string | null; personId: string; familyGroupId: string; preNotes: string | null; postNotes: string | null; }

export async function insertVisit(params: InsertVisitParams): Promise<DbVisit> {
  try {
    const { data, error } = await supabase.from('visits').insert({ title: params.title, visit_date: params.visitDate, doctor_id: params.doctorId, person_id: params.personId, family_group_id: params.familyGroupId, pre_notes: params.preNotes, post_notes: params.postNotes }).select('id, title, visit_date, doctor_id, person_id, family_group_id, pre_notes, post_notes').single();
    if (error) throw error;
    if (!data) throw new Error('Insert returned no data.');
    return { ...data, visit_time: null };
  } catch (error) { handleNetworkError(error); }
}

export interface UpdateVisitParams { visitId: string; title: string; visitDate: string; visitTime: string | null; doctorId: string | null; preNotes: string | null; postNotes: string | null; }

export async function updateVisit(params: UpdateVisitParams): Promise<DbVisit> {
  try {
    const { data, error } = await supabase.from('visits').update({ title: params.title, visit_date: params.visitDate, doctor_id: params.doctorId, pre_notes: params.preNotes, post_notes: params.postNotes }).eq('id', params.visitId).select('id, title, visit_date, doctor_id, person_id, family_group_id, pre_notes, post_notes').single();
    if (error) throw error;
    if (!data) throw new Error('Update returned no data.');
    return { ...data, visit_time: null };
  } catch (error) { handleNetworkError(error); }
}
