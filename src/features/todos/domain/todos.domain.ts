// src/features/todos/domain/todos.domain.ts
// Pure domain logic — zero external imports.

import type { DbTodo } from '@/shared/types/database';
import type { Todo, TodoPersonGroup, TodoUrgencyGroup, TodoUrgencyKey } from '../types/todos.types';

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
    colourIndex: null,
    doctorId: db.doctor_id,
    visitId: db.visit_id,
    familyGroupId: db.family_group_id,
    reminderAt: db.reminder_at,
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
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return a.title.localeCompare(b.title);
  };

  const groups: TodoPersonGroup[] = [];

  for (const personId of orderedPersonIds) {
    const todos = groupMap.get(personId) ?? [];
    groups.push({
      personId,
      personName: personNameMap.get(personId) ?? 'Unknown',
      colourIndex: personColourMap.get(personId) ?? 0,
      todos: [...todos].sort(sortTodos),
    });
  }

  const unassigned = groupMap.get(null);
  if (unassigned && unassigned.length > 0) {
    groups.push({
      personId: null,
      personName: 'General',
      colourIndex: -1,
      todos: [...unassigned].sort(sortTodos),
    });
  }

  return groups;
}

export function countIncompleteTodos(groups: TodoPersonGroup[]): number {
  return groups.reduce(
    (acc, g) => acc + g.todos.filter((t) => !t.completed).length,
    0,
  );
}

export function isTodoOverdue(todo: Todo): boolean {
  if (!todo.dueDate || todo.completed) return false;
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return todo.dueDate < today;
}

export function countOverdueTodos(groups: TodoPersonGroup[]): number {
  return groups.reduce((total, group) => {
    return total + group.todos.filter((t) => !t.completed && isTodoOverdue(t)).length;
  }, 0);
}

// ── Urgency grouping (option B: flat list by time, person as tag) ─────────────
function todayISO(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}
function weekAheadISO(): string {
  const n = new Date();
  n.setDate(n.getDate() + 7);
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

export function groupTodosByUrgency(
  todos: Todo[],
  showCompleted: boolean,
): TodoUrgencyGroup[] {
  const today = todayISO();
  const weekEnd = weekAheadISO();

  const buckets: Record<TodoUrgencyKey, Todo[]> = {
    overdue: [], week: [], later: [], nodate: [], completed: [],
  };

  for (const t of todos) {
    if (t.completed) { buckets.completed.push(t); continue; }
    if (!t.dueDate) { buckets.nodate.push(t); continue; }
    if (t.dueDate < today) { buckets.overdue.push(t); continue; }
    if (t.dueDate <= weekEnd) { buckets.week.push(t); continue; }
    buckets.later.push(t);
  }

  const byDate = (a: Todo, b: Todo) =>
    (a.dueDate ?? '').localeCompare(b.dueDate ?? '') || a.title.localeCompare(b.title);
  const byTitle = (a: Todo, b: Todo) => a.title.localeCompare(b.title);

  buckets.overdue.sort(byDate);
  buckets.week.sort(byDate);
  buckets.later.sort(byDate);
  buckets.nodate.sort(byTitle);
  buckets.completed.sort(byTitle);

  const labels: Record<TodoUrgencyKey, string> = {
    overdue: 'Overdue', week: 'This week', later: 'Later',
    nodate: 'No due date', completed: 'Completed',
  };
  const order: TodoUrgencyKey[] = ['overdue', 'week', 'later', 'nodate'];
  if (showCompleted) order.push('completed');

  return order
    .filter((k) => buckets[k].length > 0)
    .map((k) => ({ key: k, label: labels[k], todos: buckets[k] }));
}
