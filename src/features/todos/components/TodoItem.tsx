// src/features/todos/components/TodoItem.tsx
// Single todo row. Checkbox (own hit target) toggles completion; tapping the row
// opens edit; long press deletes.
import { PressableBase } from '@/design-system/components/PressableBase';
import { View, Text, Alert } from 'react-native';
import { formatRelativeDate } from '@/shared/utils/dates';
import { isTodoOverdue } from '../domain/todos.domain';
import type { Todo } from '../types/todos.types';
import type { PersonColourSet } from '@/design-system/tokens/colours';
import { Icon } from '@/design-system/components/Icon';

interface TodoItemProps {
  todo: Todo;
  colourSet: PersonColourSet | null;
  onToggle: (todoId: string, completed: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todoId: string) => void;
}

export const TodoItem = ({ todo, colourSet, onToggle, onEdit, onDelete }: TodoItemProps) => {
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

  const checkboxColour = colourSet?.dot ?? '#1F5C41';

  return (
    <PressableBase
      onPress={() => onEdit(todo)}
      onLongPress={handleLongPress}
      accessibilityRole="button"
      accessibilityLabel={`${todo.title}${todo.completed ? ', completed' : ''}`}
      accessibilityHint="Tap to edit, long press to delete"
      style={(pressed) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 9,
        paddingHorizontal: 11,
        marginBottom: 3,
        backgroundColor: pressed ? '#F7F7F4' : 'white',
        borderWidth: 1,
        borderColor: '#E3E2DB',
        borderRadius: 10,
        gap: 10,
      })}
    >
      {/* Checkbox — own hit target, does not trigger row edit */}
      <PressableBase
        onPress={() => onToggle(todo.id, !todo.completed)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: todo.completed }}
        accessibilityLabel={`Mark ${todo.title} ${todo.completed ? 'incomplete' : 'complete'}`}
        hitSlop={12}
        style={(pressed) => ({ opacity: pressed ? 0.6 : 1, flexShrink: 0 })}
      >
        <View style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: 2,
          borderColor: todo.completed ? checkboxColour : '#17211C',
          backgroundColor: todo.completed ? checkboxColour : 'white',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {todo.completed && (
            <Icon name="checkmark" size={10} color="#FFFFFF" weight="bold" />
          )}
        </View>
      </PressableBase>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 13,
          color: todo.completed ? 'rgba(23,33,28,0.55)' : '#17211C',
          textDecorationLine: todo.completed ? 'line-through' : 'none',
          fontWeight: '500',
        }}>
          {todo.title}
        </Text>
        {todo.notes ? (
          <Text style={{ fontSize: 11, color: 'rgba(23,33,28,0.65)', marginTop: 1 }} numberOfLines={1}>
            {todo.notes}
          </Text>
        ) : null}
      </View>

      {/* Due date */}
      {todo.dueDate ? (
        <Text style={{
          fontSize: 10,
          color: isOverdue ? '#B33A4A' : 'rgba(23,33,28,0.55)',
          fontWeight: isOverdue ? '700' : '400',
          flexShrink: 0,
        }}>
          {isOverdue ? '⚠ ' : ''}{formatRelativeDate(todo.dueDate)}
        </Text>
      ) : null}
    </PressableBase>
  );
};
