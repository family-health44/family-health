// src/features/todos/domain/todos.domain.ts
// Pure domain logic — zero external imports.

import type { DbTodo } from '@/shared/types/database';
import type { Todo, TodoPersonGroup } from '../types/todos.types';

export function mapDbTodoToTodo(
  db: DbTodo,
  personName: string | null = null,
): Todo {
  return {
    id: db.id,
    title: db.title,
    notes: db.notes,
    dueDate: db.due_date,
    completed: db.completed,
    personId: db.person_id,
    personName,
    doctorId: db.doctor_id,
    visitId: db.visit_id,
    familyGroupId: db.family_group_id,
  };
}

// Groups todos by person, with unassigned todos in a "General" group at the end.
// Incomplete todos appear before completed ones within each group.
// personColourMap: personId → colourIndex (derived from sorted person order)
export function groupTodosByPerson(
  todos: Todo[],
  personColourMap: Map<string, number>,
  personNameMap: Map<string, string>,
  orderedPersonIds: string[],
): TodoPersonGroup[] {
  const groupMap = new Map<string | null, Todo[]>();

  for (const todo of todos) {
    const key = todo.personId;
    const existing = groupMap.get(key) ?? [];
    groupMap.set(key, [...existing, todo]);
  }

  const sortTodos = (a: Todo, b: Todo): number => {
    // Incomplete before completed
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    // Then by due date ascending (nulls last)
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return a.title.localeCompare(b.title);
  };

  const groups: TodoPersonGroup[] = [];

  // Person groups in creation order — every person gets a section, even with no todos.
  for (const personId of orderedPersonIds) {
    const todos = groupMap.get(personId) ?? [];
    groups.push({
      personId,
      personName: personNameMap.get(personId) ?? 'Unknown',
      colourIndex: personColourMap.get(personId) ?? 0,
      todos: [...todos].sort(sortTodos),
    });
  }

  // Unassigned todos last
  const unassigned = groupMap.get(null);
  if (unassigned && unassigned.length > 0) {
    groups.push({
      personId: null,
      personName: 'General',
      colourIndex: -1, // signals neutral styling
      todos: [...unassigned].sort(sortTodos),
    });
  }

  return groups;
}

// Returns count of incomplete todos across all groups
export function countIncompleteTodos(groups: TodoPersonGroup[]): number {
  return groups.reduce(
    (acc, g) => acc + g.todos.filter((t) => !t.completed).length,
    0,
  );
}

// Checks if a todo is overdue (has due date in the past and is not completed)
export function isTodoOverdue(todo: Todo): boolean {
  if (!todo.dueDate || todo.completed) return false;
  return todo.dueDate < new Date().toISOString().split('T')[0]!;
}
export function countOverdueTodos(groups: TodoPersonGroup[]): number {
  return groups.reduce((total, group) => {
    return total + group.todos.filter((t) => !t.completed && isTodoOverdue(t)).length;
  }, 0);
}