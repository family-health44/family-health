// src/features/todos/queries/todos.queries.ts
// TanStack Query wrappers for todo data.

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import { fetchTodos } from '../repository/todos.repository';
import { fetchPeople } from '@/features/family/repository/family.repository';
import { mapDbTodoToTodo, groupTodosByPerson } from '../domain/todos.domain';

import type { TodoPersonGroup } from '../types/todos.types';

export function useTodosQuery() {
  return useQuery<TodoPersonGroup[], Error>({
    queryKey: queryKeys.todos.list(),
    queryFn: async () => {
      const [dbTodos, dbPeople] = await Promise.all([
        fetchTodos(),
        fetchPeople(),
      ]);

      // Sort people alphabetically to assign stable colour indices
      const sortedPeople = [...dbPeople].sort((a, b) =>
        a.name.localeCompare(b.name),
      );

      const personNameMap = new Map(sortedPeople.map((p) => [p.id, p.name]));
      const personColourMap = new Map(
        sortedPeople.map((p, i) => [p.id, i]),
      );

      const todos = dbTodos.map((db) =>
        mapDbTodoToTodo(db, personNameMap.get(db.person_id ?? '') ?? null),
      );

      return groupTodosByPerson(todos, personColourMap, personNameMap);
    },
  });
}
