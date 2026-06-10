// src/features/todos/components/TodoItem.tsx
// Single todo row — checkbox toggle, title, due date badge, delete on long press.
import { PressableBase } from '@/design-system/components/PressableBase';
import { View, Text, Pressable, Alert } from 'react-native';
import { formatRelativeDate } from '@/shared/utils/dates';
import { isTodoOverdue } from '../domain/todos.domain';
import type { Todo } from '../types/todos.types';
import type { PersonColourSet } from '@/design-system/tokens/colours';

interface TodoItemProps {
  todo: Todo;
  colourSet: PersonColourSet | null;
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

  return (
    <PressableBase
      onPress={() => onToggle(todo.id, !todo.completed)}
      onLongPress={handleLongPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: todo.completed }}
      accessibilityLabel={`${todo.title}${todo.completed ? ', completed' : ''}`}
      accessibilityHint="Double tap to toggle, long press to delete"
      style={(pressed) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 9,
        paddingHorizontal: 11,
        marginBottom: 3,
        backgroundColor: pressed ? '#F7F5F0' : 'white',
        borderWidth: 1,
        borderColor: '#E3DDD5',
        borderRadius: 10,
        gap: 10,
      })}
    >
      {/* Checkbox */}
      <View style={{
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: todo.completed ? checkboxColour : '#1C1917',
        backgroundColor: todo.completed ? checkboxColour : 'white',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {todo.completed && (
          <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700', lineHeight: 12 }}>✓</Text>
        )}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 13,
          color: todo.completed ? '#A8A09A' : '#1C1917',
          textDecorationLine: todo.completed ? 'line-through' : 'none',
          fontWeight: '500',
        }}>
          {todo.title}
        </Text>
        {todo.notes ? (
          <Text style={{ fontSize: 11, color: '#6B6460', marginTop: 1 }} numberOfLines={1}>
            {todo.notes}
          </Text>
        ) : null}
      </View>

      {/* Due date */}
      {todo.dueDate ? (
        <Text style={{
          fontSize: 10,
          color: isOverdue ? '#9B3A4A' : '#A8A09A',
          fontWeight: isOverdue ? '700' : '400',
          flexShrink: 0,
        }}>
          {isOverdue ? '⚠ ' : ''}{formatRelativeDate(todo.dueDate)}
        </Text>
      ) : null}
    </PressableBase>
  );
};
