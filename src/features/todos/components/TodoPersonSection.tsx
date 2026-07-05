// src/features/todos/components/TodoPersonSection.tsx
// Coloured section grouping todos for one person.
// Collapsible — tap header to expand/collapse.
import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { PERSON_COLOURS } from '@/design-system/tokens/colours';
import { TodoItem } from './TodoItem';
import type { Todo, TodoPersonGroup } from '../types/todos.types';

interface TodoPersonSectionProps {
  group: TodoPersonGroup;
  showCompleted: boolean;
  onToggle: (todoId: string, completed: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todoId: string) => void;
}

const NEUTRAL_COLOUR = {
  bg: '#F5F3F0',
  border: '#E0DDD8',
  text: '#4A4744',
  dot: 'rgba(23,33,28,0.65)',
} as const;

export const TodoPersonSection = ({
  group, showCompleted, onToggle, onEdit, onDelete,
}: TodoPersonSectionProps) => {
  const [collapsed, setCollapsed] = useState(true);

  const isGeneral = group.colourIndex === -1;
  const colourSet = isGeneral
    ? NEUTRAL_COLOUR
    : (PERSON_COLOURS[group.colourIndex % PERSON_COLOURS.length] ?? NEUTRAL_COLOUR);

  const visibleTodos = showCompleted
    ? group.todos
    : group.todos.filter((t) => !t.completed);

  const initials = group.personName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  // Empty sections still render (collapsed-friendly) so every person is visible.

  return (
    <View style={{ marginBottom: 8 }}>
      <Pressable
        onPress={() => setCollapsed(!collapsed)}
        accessibilityRole="button"
        accessibilityLabel={`${group.personName} todos`}
        accessibilityState={{ expanded: !collapsed }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          paddingHorizontal: 13,
          paddingVertical: 11,
          gap: 11,
          shadowColor: '#17211C',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colourSet.dot, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: 'white', fontSize: 11, fontWeight: '700' }}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#17211C' }}>
            {group.personName}
          </Text>
        </View>
        <Text style={{ color: 'rgba(23,33,28,0.4)', fontSize: 13 }}>
          {collapsed ? '∨' : '∧'}
        </Text>
      </Pressable>

      {!collapsed && (
        <View style={{ marginTop: 2, marginBottom: 4 }}>
          {visibleTodos.length > 0 ? (
            visibleTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                colourSet={isGeneral ? null : colourSet}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            <View style={{ padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: 'rgba(23,33,28,0.55)' }}>No open items</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};