// src/features/todos/types/todos.types.ts
// Domain types for the todos feature.

export interface Todo {
  id: string;
  title: string;
  notes: string | null;
  dueDate: string | null;
  completed: boolean;
  personId: string | null;
  personName: string | null;
  colourIndex: number | null;
  doctorId: string | null;
  visitId: string | null;
  familyGroupId: string;
}

// Todos grouped by person — each section is colour-coded
export interface TodoPersonGroup {
  personId: string | null;
  personName: string;
  colourIndex: number;
  todos: Todo[];
}

// Todos grouped by urgency bucket (Overdue / This week / Later / No due date).
export type TodoUrgencyKey = 'overdue' | 'week' | 'later' | 'nodate' | 'completed';

export interface TodoUrgencyGroup {
  key: TodoUrgencyKey;
  label: string;
  todos: Todo[];
}
