// src/features/todos/components/TodoUrgencyList.tsx
// Option B: flat urgency-grouped todo list. Person shown as a coloured dot + name.
// Book-styled: floating cards, inset dividers, one-accent discipline.
import { View, Text, Alert } from 'react-native';
import { PressableBase } from '@/design-system/components/PressableBase';
import { Type, TextColour, Shadow } from '@/design-system/tokens/typography';
import { PERSON_COLOURS } from '@/design-system/tokens/colours';
import { formatRelativeDate } from '@/shared/utils/dates';
import type { Todo, TodoUrgencyGroup } from '../types/todos.types';
import { Icon } from '@/design-system/components/Icon';

const OVERDUE_RED = '#A63D2F';
const DIVIDER = 'rgba(23,33,28,0.07)';
const CHECK_BORDER = '#C9C8C0';

function dotFor(colourIndex: number | null): string {
  if (colourIndex === null || colourIndex < 0) return 'rgba(23,33,28,0.4)';
  return PERSON_COLOURS[colourIndex % PERSON_COLOURS.length]?.dot ?? 'rgba(23,33,28,0.4)';
}

interface RowProps {
  todo: Todo;
  isOverdue: boolean;
  last: boolean;
  onToggle: (todoId: string, completed: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todoId: string) => void;
}

const Row = ({ todo, isOverdue, last, onToggle, onEdit, onDelete }: RowProps) => {
  const dot = dotFor(todo.colourIndex);
  const done = todo.completed;

  const handleLongPress = () => {
    Alert.alert('Delete to-do', `Delete "${todo.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(todo.id) },
    ]);
  };

  return (
    <>
      <PressableBase
        onPress={() => onEdit(todo)}
        onLongPress={handleLongPress}
        accessibilityRole="button"
        accessibilityLabel={`${todo.title}${done ? ', completed' : ''}`}
        accessibilityHint="Tap to edit, long press to delete"
        style={(pressed) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, backgroundColor: pressed ? '#F7F7F4' : 'white' })}
      >
        <PressableBase
          onPress={() => onToggle(todo.id, !done)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: done }}
          accessibilityLabel={`Mark ${todo.title} ${done ? 'incomplete' : 'complete'}`}
          hitSlop={12}
          style={(pressed) => ({ opacity: pressed ? 0.6 : 1, flexShrink: 0 })}
        >
          <View style={{ width: 21, height: 21, borderRadius: 6, borderWidth: 1.5, borderColor: done ? dot : CHECK_BORDER, backgroundColor: done ? dot : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
            {done ? <Icon name="checkmark" size={11} color="#FFFFFF" /> : null}
          </View>
        </PressableBase>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ ...Type.body, color: done ? TextColour.muted : TextColour.ink, textDecorationLine: done ? 'line-through' : 'none' }}>
            {todo.title}
          </Text>
          {todo.personName ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: dot }} />
              <Text style={{ ...Type.caption, color: TextColour.muted }}>{todo.personName}</Text>
            </View>
          ) : null}
        </View>

        {todo.dueDate ? (
          <Text style={{ ...Type.caption, fontWeight: isOverdue ? '700' : '400', color: isOverdue ? OVERDUE_RED : TextColour.muted, flexShrink: 0 }}>
            {formatRelativeDate(todo.dueDate)}
          </Text>
        ) : null}
      </PressableBase>
      {!last && <View style={{ height: 1, backgroundColor: DIVIDER, marginHorizontal: 15 }} />}
    </>
  );
};

interface TodoUrgencyListProps {
  group: TodoUrgencyGroup;
  onToggle: (todoId: string, completed: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todoId: string) => void;
}

export const TodoUrgencyList = ({ group, onToggle, onEdit, onDelete }: TodoUrgencyListProps) => {
  const isOverdueSection = group.key === 'overdue';
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ ...Type.micro, textTransform: 'uppercase', color: isOverdueSection ? OVERDUE_RED : TextColour.faint, marginBottom: 10 }}>
        {group.label} · {group.todos.length}
      </Text>
      <View style={{ backgroundColor: 'white', borderRadius: 14, overflow: 'hidden', ...Shadow.resting }}>
        {group.todos.map((t, i) => (
          <Row
            key={t.id}
            todo={t}
            isOverdue={isOverdueSection}
            last={i === group.todos.length - 1}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </View>
    </View>
  );
};
