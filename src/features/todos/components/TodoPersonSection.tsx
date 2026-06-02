// src/features/todos/components/TodoPersonSection.tsx
// Coloured section grouping todos for one person.
// General (unassigned) todos use neutral styling.

import { View, Text } from 'react-native';

import { PERSON_COLOURS } from '@/design-system/tokens/colours';
import { getInitials } from '@/shared/utils/initials';
import { Avatar } from '@/design-system/components/Avatar';
import { TodoItem } from './TodoItem';

import type { TodoPersonGroup } from '../types/todos.types';

interface TodoPersonSectionProps {
  group: TodoPersonGroup;
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
  group, onToggle, onDelete,
}: TodoPersonSectionProps) => {
  const isGeneral = group.colourIndex === -1;
  const colourSet = isGeneral
    ? NEUTRAL_COLOUR
    : (PERSON_COLOURS[group.colourIndex % PERSON_COLOURS.length] ?? NEUTRAL_COLOUR);

  const incomplete = group.todos.filter((t) => !t.completed).length;

  return (
    <View style={{
      backgroundColor: colourSet.bg,
      borderColor: colourSet.border,
      borderWidth: 1,
      borderRadius: 16,
      marginBottom: 14,
      overflow: 'hidden',
    }}>
      {/* Section header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: group.todos.length > 0 ? 1 : 0,
        borderBottomColor: colourSet.border,
        gap: 10,
      }}>
        {!isGeneral && group.personId ? (
          <Avatar
            initials={getInitials(group.personName)}
            colourSet={colourSet}
            size="sm"
          />
        ) : null}

        <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: colourSet.text }}>
          {group.personName}
        </Text>

        {incomplete > 0 && (
          <View style={{
            backgroundColor: colourSet.dot,
            borderRadius: 10,
            paddingHorizontal: 7,
            paddingVertical: 2,
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>
              {incomplete}
            </Text>
          </View>
        )}
      </View>

      {/* Todo items */}
      <View style={{ paddingHorizontal: 14 }}>
        {group.todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            colourSet={isGeneral ? null : colourSet}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </View>
    </View>
  );
};
