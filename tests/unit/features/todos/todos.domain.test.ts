// tests/unit/features/todos/todos.domain.test.ts
import {
  mapDbTodoToTodo,
  groupTodosByPerson,
  countIncompleteTodos,
  isTodoOverdue,
} from '@/features/todos/domain/todos.domain';

import type { DbTodo } from '@/shared/types/database';
import type { Todo } from '@/features/todos/types/todos.types';

const makeDbTodo = (overrides: Partial<DbTodo> = {}): DbTodo => ({
  id: 'todo-1',
  title: 'Book appointment',
  notes: null,
  due_date: null,
  completed: false,
  person_id: 'person-1',
  doctor_id: null,
  visit_id: null,
  family_group_id: 'group-1',
  ...overrides,
});

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 'todo-1',
  title: 'Book appointment',
  notes: null,
  dueDate: null,
  completed: false,
  personId: 'person-1',
  personName: 'Jane',
  colourIndex: null,
  doctorId: null,
  visitId: null,
  familyGroupId: 'group-1',
  ...overrides,
});

describe('todos.domain', () => {
  describe('mapDbTodoToTodo', () => {
    it('maps correctly', () => {
      const result = mapDbTodoToTodo(makeDbTodo(), 'Jane');
      expect(result.id).toBe('todo-1');
      expect(result.title).toBe('Book appointment');
      expect(result.personName).toBe('Jane');
      expect(result.completed).toBe(false);
    });

    it('handles null personName', () => {
      const result = mapDbTodoToTodo(makeDbTodo());
      expect(result.personName).toBeNull();
    });
  });

  describe('groupTodosByPerson', () => {
    const personNameMap = new Map([
      ['person-1', 'Alice'],
      ['person-2', 'Bob'],
    ]);
    const personColourMap = new Map([
      ['person-1', 0],
      ['person-2', 1],
    ]);
    const orderedPersonIds = ['person-1', 'person-2'];

    it('groups todos by person in creation order', () => {
      const todos: Todo[] = [
        makeTodo({ id: '1', personId: 'person-2', personName: 'Bob' }),
        makeTodo({ id: '2', personId: 'person-1', personName: 'Alice' }),
      ];
      const groups = groupTodosByPerson(todos, personColourMap, personNameMap, orderedPersonIds);
      expect(groups[0]?.personName).toBe('Alice');
      expect(groups[1]?.personName).toBe('Bob');
    });

    it('puts unassigned todos in General group at end', () => {
      const todos: Todo[] = [
        makeTodo({ id: '1', personId: 'person-1' }),
        makeTodo({ id: '2', personId: null, personName: null }),
      ];
      const groups = groupTodosByPerson(todos, personColourMap, personNameMap, orderedPersonIds);
      expect(groups[groups.length - 1]?.personName).toBe('General');
      expect(groups[groups.length - 1]?.colourIndex).toBe(-1);
    });

    it('sorts incomplete before completed within a group', () => {
      const todos: Todo[] = [
        makeTodo({ id: '1', completed: true, title: 'Done' }),
        makeTodo({ id: '2', completed: false, title: 'Pending' }),
      ];
      const groups = groupTodosByPerson(todos, personColourMap, personNameMap, orderedPersonIds);
      expect(groups[0]?.todos[0]?.completed).toBe(false);
      expect(groups[0]?.todos[1]?.completed).toBe(true);
    });
  });

  describe('countIncompleteTodos', () => {
    it('counts only incomplete todos across all groups', () => {
      const groups = [
        {
          personId: 'p1', personName: 'Alice', colourIndex: 0,
          todos: [makeTodo({ completed: false }), makeTodo({ id: '2', completed: true })],
        },
        {
          personId: 'p2', personName: 'Bob', colourIndex: 1,
          todos: [makeTodo({ id: '3', completed: false })],
        },
      ];
      expect(countIncompleteTodos(groups)).toBe(2);
    });

    it('returns 0 for empty groups', () => {
      expect(countIncompleteTodos([])).toBe(0);
    });
  });

  describe('isTodoOverdue', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]!;
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]!;

    it('returns true for past due date and incomplete', () => {
      expect(isTodoOverdue(makeTodo({ dueDate: yesterday, completed: false }))).toBe(true);
    });

    it('returns false for future due date', () => {
      expect(isTodoOverdue(makeTodo({ dueDate: tomorrow, completed: false }))).toBe(false);
    });

    it('returns false if completed even if overdue', () => {
      expect(isTodoOverdue(makeTodo({ dueDate: yesterday, completed: true }))).toBe(false);
    });

    it('returns false if no due date', () => {
      expect(isTodoOverdue(makeTodo({ dueDate: null }))).toBe(false);
    });
  });
});
