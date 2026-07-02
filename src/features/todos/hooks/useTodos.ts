// src/features/todos/hooks/useTodos.ts
// Hook — composes todo queries and mutations for TodosScreen.

import { useCallback, useState } from 'react';

import { useTodosQuery } from '../queries/todos.queries';
import {
  useAddTodoMutation,
  useToggleTodoMutation,
  useDeleteTodoMutation,
} from '../mutations/todos.mutations';
import { isAppError, toAppError } from '@/shared/types/errors';

import type { TodoPersonGroup } from '../types/todos.types';
import type { InsertTodoParams } from '../repository/todos.repository';
import type { AppError } from '@/shared/types/errors';

type AddTodoInput = Omit<InsertTodoParams, 'familyGroupId'>;

export interface UseTodosReturn {
  groups: TodoPersonGroup[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: AppError | null;
  addTodo: (input: AddTodoInput) => Promise<void>;
  toggleTodo: (todoId: string, completed: boolean) => void;
  deleteTodo: (todoId: string) => void;
  isAdding: boolean;
  refetch: () => void;
  refresh: () => Promise<void>;
}

export function useTodos(): UseTodosReturn {
  const { data: groups = [], isLoading, error: queryError, refetch } = useTodosQuery();
  const addMutation = useAddTodoMutation();
  const toggleMutation = useToggleTodoMutation();
  const deleteMutation = useDeleteTodoMutation();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Spinner tracks manual pull-to-refresh only — never background refetches.
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try { await refetch(); } finally { setIsRefreshing(false); }
  }, [refetch]);

  const addTodo = useCallback(async (input: AddTodoInput) => {
    await addMutation.mutateAsync(input);
  }, [addMutation]);

  const toggleTodo = useCallback((todoId: string, completed: boolean) => {
    toggleMutation.mutate({ todoId, completed });
  }, [toggleMutation]);

  const deleteTodo = useCallback((todoId: string) => {
    deleteMutation.mutate(todoId);
  }, [deleteMutation]);

  const error = queryError
    ? isAppError(queryError) ? queryError : toAppError(queryError)
    : null;

  return {
    groups,
    isLoading,
    isRefreshing,
    error,
    addTodo,
    toggleTodo,
    deleteTodo,
    isAdding: addMutation.isPending,
    refetch,
    refresh,
  };
}
