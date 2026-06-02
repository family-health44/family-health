// src/features/todos/components/TodoItem.tsx
// Single todo row — checkbox toggle, title, due date badge, delete on long press.
// No business logic — purely presentational.

import { View, Text, Pressable, Alert } from 'react-native';

import { formatRelativeDate } from '@/shared/utils/dates';
import { isTodoOverdue } from '../domain/todos.domain';

import type { Todo } from '../types/todos.types';
import type { PersonColourSet } from '@/design-system/tokens/colours';

interface TodoItemProps {
  todo: Todo;
  colourSet: PersonColourSet | null; // null for general/unassigned todos
  onToggle: (todoId: string, completed: boolean) => void;
  onDelete: (todoId: string) => void;
}

export const TodoItem = ({ todo, colourSet, onToggle, onDelete }: TodoItemProps) => {
  const isOverdue = isTodoOverdue(todo);

  const handleLongPress = () => {
    Alert.alert(
      'Delete to-do',
      `Delete "${todo.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(todo.id) },
      ],
    );
  };

  const checkboxColour = colourSet?.dot ?? '#2A6049';
  const borderColour = colourSet?.border ?? '#E8E4DC';

  return (
    <Pressable
      onPress={() => onToggle(todo.id, !todo.completed)}
      onLongPress={handleLongPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: todo.completed }}
      accessibilityLabel={`${todo.title}${todo.completed ? ', completed' : ''}`}
      accessibilityHint="Double tap to toggle, long press to delete"
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: borderColour,
        opacity: pressed ? 0.7 : 1,
        gap: 12,
      })}
    >
      {/* Checkbox */}
      <View style={{
        width: 22, height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: todo.completed ? checkboxColour : borderColour,
        backgroundColor: todo.completed ? checkboxColour : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
        flexShrink: 0,
      }}>
        {todo.completed && (
          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700', lineHeight: 14 }}>
            ✓
          </Text>
        )}
      </View>

      {/* Content */}
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{
          fontSize: 15,
          color: todo.completed ? '#9E9B95' : '#1A1A1A',
          textDecorationLine: todo.completed ? 'line-through' : 'none',
          fontWeight: '500',
        }}>
          {todo.title}
        </Text>

        {todo.notes ? (
          <Text style={{ fontSize: 13, color: '#6B6866' }} numberOfLines={1}>
            {todo.notes}
          </Text>
        ) : null}

        {todo.dueDate ? (
          <Text style={{
            fontSize: 12,
            color: isOverdue ? '#9B3A4A' : '#6B6866',
            fontWeight: isOverdue ? '600' : '400',
          }}>
            {isOverdue ? '⚠ Overdue · ' : ''}{formatRelativeDate(todo.dueDate)}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
};
