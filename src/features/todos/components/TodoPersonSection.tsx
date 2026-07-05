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
          backgroundColor: isGeneral ? '#FFFFFF' : colourSet.dot,
          borderRadius: 16,
          padding: 14,
          gap: 12,
          shadowColor: '#17211C',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: isGeneral ? colourSet.dot : 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: isGeneral ? '#17211C' : '#FFFFFF' }}>
            {group.personName}
          </Text>
        </View>
        <Text style={{ color: isGeneral ? 'rgba(23,33,28,0.4)' : 'rgba(255,255,255,0.7)', fontSize: 15 }}>
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