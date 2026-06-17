// src/features/todos/components/TodoPersonSection.tsx
// Coloured section grouping todos for one person.
// Collapsible — tap header to expand/collapse.
import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { PERSON_COLOURS } from '@/design-system/tokens/colours';
import { TodoItem } from './TodoItem';
import type { TodoPersonGroup } from '../types/todos.types';

interface TodoPersonSectionProps {
  group: TodoPersonGroup;
  showCompleted: boolean;
  onToggle: (todoId: string, completed: boolean) => void;
  onDelete: (todoId: string) => void;
}

const NEUTRAL_COLOUR = {
  bg: '#F5F3F0',
  border: '#E0DDD8',
  text: '#4A4744',
  dot: '#6B6866',
} as const;

export const TodoPersonSection = ({
  group, showCompleted, onToggle, onDelete,
}: TodoPersonSectionProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const isGeneral = group.colourIndex === -1;
  const colourSet = isGeneral
    ? NEUTRAL_COLOUR
    : (PERSON_COLOURS[group.colourIndex % PERSON_COLOURS.length] ?? NEUTRAL_COLOUR);

  const visibleTodos = showCompleted
    ? group.todos
    : group.todos.filter((t) => !t.completed);

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
          backgroundColor: colourSet.bg,
          borderColor: colourSet.border,
          borderWidth: 1,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 11,
          gap: 10,
        }}
      >
        <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: colourSet.text }}>
          {group.personName}
        </Text>
        <Text style={{ color: colourSet.text, fontSize: 13, opacity: 0.7 }}>
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
                onDelete={onDelete}
              />
            ))
          ) : (
            <View style={{ padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#A8A09A' }}>No open items</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};