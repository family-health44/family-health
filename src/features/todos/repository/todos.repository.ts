// src/features/todos/repository/todos.repository.ts
// Todos repository — only place Supabase is called for todo data.

import { db } from '@/lib/supabase';
import { handleNetworkError } from '@/core/network/errorHandler';

import type { DbTodo } from '@/shared/types/database';

export async function fetchTodos(): Promise<DbTodo[]> {
  try {
    const { data, error } = await db
      .from('todos')
      .select('id, title, notes, due_date, completed, person_id, doctor_id, visit_id, family_group_id')
      .order('completed', { ascending: true })
      .order('due_date', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    handleNetworkError(error);
  }
}

export interface InsertTodoParams {
  title: string;
  notes: string | null;
  dueDate: string | null;
  personId: string | null;
  familyGroupId: string;
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
        family_group_id: params.familyGroupId,
      })
      .select('id, title, notes, due_date, completed, person_id, doctor_id, visit_id, family_group_id')
      .single();

    if (error) throw error;
    if (!data) throw new Error('Insert returned no data.');
    return data;
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function updateTodoCompleted(
  todoId: string,
  completed: boolean,
): Promise<void> {
  try {
    const { error } = await db
      .from('todos')
      .update({ completed })
      .eq('id', todoId);

    if (error) throw error;
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function deleteTodo(todoId: string): Promise<void> {
  try {
    const { error } = await db
      .from('todos')
      .delete()
      .eq('id', todoId);

    if (error) throw error;
  } catch (error) {
    handleNetworkError(error);
  }
}
