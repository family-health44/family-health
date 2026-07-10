// src/features/todos/queries/todos.queries.ts
// TanStack Query wrappers for todo data.

import { useQuery } from '@tanstack/react-query';
import { sortPeopleByCreation } from '@/shared/utils/personOrder';

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

      const sortedPeople = sortPeopleByCreation(dbPeople);
      const personNameMap = new Map(sortedPeople.map((p) => [p.id, p.name]));
      const personColourMap = new Map(sortedPeople.map((p, i) => [p.id, i]));
      const orderedPersonIds = sortedPeople.map((p) => p.id);

      const todos = dbTodos.map((db) => {
        const t = mapDbTodoToTodo(db, personNameMap.get(db.person_id ?? '') ?? null);
        return {
          ...t,
          colourIndex: db.person_id ? personColourMap.get(db.person_id) ?? null : null,
        };
      });

      return groupTodosByPerson(todos, personColourMap, personNameMap, orderedPersonIds);
    },
  });
}
