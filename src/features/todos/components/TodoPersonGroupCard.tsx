// src/features/todos/components/TodoPersonGroupCard.tsx
// Book-styled person grouping: initial ring + thin left accent bar + floating card.
// Reuses the same row visuals as the urgency list (person dot dropped — colour is
// already carried by the accent bar and ring).
import { View, Text, Alert } from 'react-native';
import { PressableBase } from '@/design-system/components/PressableBase';
import { Type, TextColour, Shadow } from '@/design-system/tokens/typography';
import { PERSON_COLOURS } from '@/design-system/tokens/colours';
import { formatRelativeDate } from '@/shared/utils/dates';
import { isTodoOverdue } from '../domain/todos.domain';
import type { Todo, TodoPersonGroup } from '../types/todos.types';
import { Icon } from '@/design-system/components/Icon';

const OVERDUE_RED = '#A63D2F';
const DIVIDER = 'rgba(23,33,28,0.07)';
const CHECK_BORDER = '#C9C8C0';
const NEUTRAL = 'rgba(23,33,28,0.45)';

function colourFor(idx: number): string {
  if (idx < 0) return NEUTRAL;
  return PERSON_COLOURS[idx % PERSON_COLOURS.length]?.dot ?? NEUTRAL;
}

interface RowProps {
  todo: Todo;
  accent: string;
  last: boolean;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

const Row = ({ todo, accent, last, onToggle, onEdit, onDelete }: RowProps) => {
  const done = todo.completed;
  const overdue = isTodoOverdue(todo);
  const handleLong = () => {
    Alert.alert('Delete to-do', `Delete "${todo.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(todo.id) },
    ]);
  };
  return (
    <>
      <PressableBase
        onPress={() => onEdit(todo)}
        onLongPress={handleLong}
        accessibilityRole="button"
        accessibilityLabel={`${todo.title}${done ? ', completed' : ''}`}
        accessibilityHint="Tap to edit, long press to delete"
        style={(p) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: p ? '#F7F7F4' : 'white' })}
      >
        <PressableBase
          onPress={() => onToggle(todo.id, !done)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: done }}
          hitSlop={12}
          style={(p) => ({ opacity: p ? 0.6 : 1, flexShrink: 0 })}
        >
          <View style={{ width: 21, height: 21, borderRadius: 6, borderWidth: 1.5, borderColor: done ? accent : CHECK_BORDER, backgroundColor: done ? accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
            {done ? <Icon name="checkmark" size={11} color="#FFFFFF" /> : null}
          </View>
        </PressableBase>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ ...Type.body, color: done ? TextColour.muted : TextColour.ink, textDecorationLine: done ? 'line-through' : 'none' }}>{todo.title}</Text>
        </View>
        {todo.dueDate ? (
          <Text style={{ ...Type.caption, fontWeight: overdue ? '700' : '400', color: overdue ? OVERDUE_RED : TextColour.muted, flexShrink: 0 }}>{formatRelativeDate(todo.dueDate)}</Text>
        ) : null}
      </PressableBase>
      {!last && <View style={{ height: 1, backgroundColor: DIVIDER, marginHorizontal: 14 }} />}
    </>
  );
};

interface Props {
  group: TodoPersonGroup;
  showCompleted: boolean;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export const TodoPersonGroupCard = ({ group, showCompleted, onToggle, onEdit, onDelete }: Props) => {
  const accent = colourFor(group.colourIndex);
  const todos = showCompleted ? group.todos : group.todos.filter((t) => !t.completed);
  if (todos.length === 0) return null;

  const initials = group.personName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <View style={{ marginBottom: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 8 }}>
        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: accent, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>{initials}</Text>
        </View>
        <Text style={{ ...Type.label, color: TextColour.ink }}>{group.personName}</Text>
        <Text style={{ ...Type.caption, color: TextColour.faint }}>{todos.length}</Text>
      </View>
      <View style={{ backgroundColor: 'white', borderRadius: 14, overflow: 'hidden', borderLeftWidth: 3, borderLeftColor: accent, ...Shadow.resting }}>
        {todos.map((t, i) => (
          <Row key={t.id} todo={t} accent={accent} last={i === todos.length - 1} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </View>
    </View>
  );
};
