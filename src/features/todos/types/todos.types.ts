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
