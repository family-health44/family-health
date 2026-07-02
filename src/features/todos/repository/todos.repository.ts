// src/features/todos/repository/todos.repository.ts
import { db } from '@/lib/supabase';
import { handleNetworkError } from '@/core/network/errorHandler';
import type { DbTodo } from '@/shared/types/database';
import type { Todo } from '../types/todos.types';

// Column list shared by every query — one source of truth (prevents silent field-drop).
const COLS = 'id, title, notes, due_date, completed, person_id, doctor_id, visit_id, family_group_id';

export interface InsertTodoParams {
  title: string;
  notes: string | null;
  dueDate: string | null;
  personId: string | null;
  doctorId?: string | null;
  visitId?: string | null;
  familyGroupId: string;
}

export interface UpdateTodoParams {
  todoId: string;
  title: string;
  notes: string | null;
  dueDate: string | null;
  personId: string | null;
  doctorId?: string | null;
  visitId?: string | null;
}

export function mapDbTodoToTodo(row: DbTodo, personName: string | null = null): Todo {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    dueDate: row.due_date,
    completed: row.completed,
    personId: row.person_id,
    personName,
    doctorId: row.doctor_id,
    visitId: row.visit_id,
    familyGroupId: row.family_group_id,
  };
}

export async function fetchTodos(): Promise<DbTodo[]> {
  try {
    const { data, error } = await db
      .from('todos')
      .select(COLS)
      .order('due_date', { ascending: true, nullsFirst: false });
    if (error) throw error;
    return data ?? [];
  } catch (error) { handleNetworkError(error); }
}

export async function insertTodo(params: InsertTodoParams): Promise<DbTodo> {
  try {
    const { data, error } = await db
      .from('todos')
      .insert({
        title: params.title,
        notes: params.notes,
        due_date: params.dueDate,
        completed: false,
        person_id: params.personId,
        doctor_id: params.doctorId ?? null,
        visit_id: params.visitId ?? null,
        family_group_id: params.familyGroupId,
      })
      .select(COLS)
      .single();
    if (error) throw error;
    if (!data) throw new Error('Insert returned no data.');
    return data;
  } catch (error) { handleNetworkError(error); }
}

export async function updateTodo(params: UpdateTodoParams): Promise<DbTodo> {
  try {
    const { data, error } = await db
      .from('todos')
      .update({
        title: params.title,
        notes: params.notes,
        due_date: params.dueDate,
        person_id: params.personId,
        doctor_id: params.doctorId ?? null,
        visit_id: params.visitId ?? null,
      })
      .eq('id', params.todoId)
      .select(COLS)
      .single();
    if (error) throw error;
    if (!data) throw new Error('Update returned no data.');
    return data;
  } catch (error) { handleNetworkError(error); }
}

export async function updateTodoCompleted(todoId: string, completed: boolean): Promise<DbTodo> {
  try {
    const { data, error } = await db
      .from('todos')
      .update({ completed })
      .eq('id', todoId)
      .select(COLS)
      .single();
    if (error) throw error;
    if (!data) throw new Error('Update returned no data.');
    return data;
  } catch (error) { handleNetworkError(error); }
}

export async function deleteTodo(todoId: string): Promise<void> {
  try {
    const { error } = await db.from('todos').delete().eq('id', todoId);
    if (error) throw error;
  } catch (error) { handleNetworkError(error); }
}
