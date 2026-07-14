// src/features/todos/mutations/todos.mutations.ts
// TanStack Query mutations for todo write operations.
// Toggle and add mutations use withOfflineQueue for offline support.

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import { invalidateReminderQueries } from '@/core/notifications/invalidateReminders';
import { fetchFamilyGroup } from '@/features/family/repository/family.repository';
import {
  insertTodo,
  updateTodo,
  updateTodoCompleted,
  deleteTodo,
} from '../repository/todos.repository';
import { withOfflineQueue } from '@/core/sync/withOfflineQueue';

import type { InsertTodoParams, UpdateTodoParams } from '../repository/todos.repository';

type AddTodoInput = Omit<InsertTodoParams, 'familyGroupId'>;

export function useAddTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddTodoInput) => {
      const group = await fetchFamilyGroup();
      if (!group) throw new Error('No family group found.');
      const params = { ...input, familyGroupId: group.id };
      return withOfflineQueue(
        () => insertTodo(params),
        { type: 'ADD_TODO', payload: params },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.list() });
      invalidateReminderQueries(queryClient);
    },
  });
}

export function useUpdateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateTodoParams) =>
      withOfflineQueue(
        () => updateTodo(params),
        { type: 'UPDATE_TODO', payload: params },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.list() });
      invalidateReminderQueries(queryClient);
    },
  });
}

export function useToggleTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ todoId, completed }: { todoId: string; completed: boolean }) =>
      withOfflineQueue(
        () => updateTodoCompleted(todoId, completed),
        { type: 'TOGGLE_TODO', payload: { todoId, completed } },
      ),
    onMutate: async ({ todoId, completed }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.todos.list() });
      const previous = queryClient.getQueryData(queryKeys.todos.list());
      return { previous };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.list() });
      invalidateReminderQueries(queryClient);
    },
  });
}

export function useDeleteTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (todoId: string) =>
      withOfflineQueue(
        () => deleteTodo(todoId),
        { type: 'DELETE_TODO', payload: { todoId } },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.list() });
      invalidateReminderQueries(queryClient);
    },
  });
}
