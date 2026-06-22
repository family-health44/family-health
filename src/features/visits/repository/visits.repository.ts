import { db } from '@/lib/supabase';
import { handleNetworkError } from '@/core/network/errorHandler';
import type { DbVisit } from '@/shared/types/database';

// Column list shared by every query — one source of truth (prevents silent field-drop).
const COLS = 'id, title, visit_date, visit_time, doctor_id, person_id, family_group_id, pre_notes, post_notes, total_cost, out_of_pocket';

export async function fetchVisits(): Promise<DbVisit[]> {
  try {
    const { data, error } = await db.from('visits').select(COLS).order('visit_date', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((v: Record<string, unknown>) => (v as unknown as import('@/shared/types/database').DbVisit));
  } catch (error) { handleNetworkError(error); }
}

export async function fetchVisitsByDateRange(startDate: string, endDate: string): Promise<DbVisit[]> {
  try {
    const { data, error } = await db.from('visits').select(COLS).gte('visit_date', startDate).lte('visit_date', endDate).order('visit_date');
    if (error) throw error;
    return (data ?? []).map((v: Record<string, unknown>) => (v as unknown as import('@/shared/types/database').DbVisit));
  } catch (error) { handleNetworkError(error); }
}

export async function fetchVisitsByPerson(personId: string): Promise<DbVisit[]> {
  try {
    const { data, error } = await db.from('visits').select(COLS).eq('person_id', personId).order('visit_date', { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function fetchVisitById(visitId: string): Promise<DbVisit | null> {
  try {
    const { data, error } = await db.from('visits').select(COLS).eq('id', visitId).maybeSingle();
    if (error) throw error;
    return data ? (data as DbVisit) : null;
  } catch (error) { handleNetworkError(error); }
}

export interface InsertVisitParams { title: string; visitDate: string; visitTime: string | null; doctorId: string | null; personId: string; familyGroupId: string; preNotes: string | null; postNotes: string | null; totalCost: number | null; outOfPocket: number | null; }

export async function insertVisit(params: InsertVisitParams): Promise<DbVisit> {
  try {
    const { data, error } = await db.from('visits').insert({ title: params.title, visit_date: params.visitDate, visit_time: params.visitTime, doctor_id: params.doctorId, person_id: params.personId, family_group_id: params.familyGroupId, pre_notes: params.preNotes, post_notes: params.postNotes, total_cost: params.totalCost, out_of_pocket: params.outOfPocket }).select(COLS).single();
    if (error) throw error;
    if (!data) throw new Error('Insert returned no data.');
    return data;
  } catch (error) { handleNetworkError(error); }
}

export interface UpdateVisitParams { visitId: string; title: string; visitDate: string; visitTime: string | null; doctorId: string | null; preNotes: string | null; postNotes: string | null; totalCost: number | null; outOfPocket: number | null; }

export async function updateVisit(params: UpdateVisitParams): Promise<DbVisit> {
  try {
    const { data, error } = await db.from('visits').update({ title: params.title, visit_date: params.visitDate, visit_time: params.visitTime, doctor_id: params.doctorId, pre_notes: params.preNotes, post_notes: params.postNotes, total_cost: params.totalCost, out_of_pocket: params.outOfPocket }).eq('id', params.visitId).select(COLS).single();
    if (error) throw error;
    if (!data) throw new Error('Update returned no data.');
    return data;
  } catch (error) { handleNetworkError(error); }
}
