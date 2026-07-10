import { useMemo, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { PressableBase } from '@/design-system/components/PressableBase';
import { EmptyState, ErrorState, LoadingState } from '@/design-system/components/EmptyState';
import { FAB } from '@/design-system/components/FAB';
import { ScreenHeader } from '@/design-system/components/ScreenHeader';
import { useTodos } from '../hooks/useTodos';
import { useTodoViewMode } from '../hooks/useTodoViewMode';
import { groupTodosByUrgency } from '../domain/todos.domain';
import { TodoUrgencyList } from '../components/TodoUrgencyList';
import { TodoPersonGroupCard } from '../components/TodoPersonGroupCard';
import { AddTodoModal } from '../components/AddTodoModal';
import { EditTodoModal } from '../components/EditTodoModal';
import { useFamilyHome } from '@/features/family/hooks/useFamilyHome';
import { useDoctorsQuery } from '@/features/doctors/queries/doctors.queries';
import { useVisits } from '../../visits/hooks/useVisits';
import type { Todo } from '../types/todos.types';

export const TodosScreen = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const { mode, setMode } = useTodoViewMode();
  const { groups, isLoading, isRefreshing, error, addTodo, updateTodo, toggleTodo, deleteTodo, isAdding, isUpdating, refetch, refresh } = useTodos();
  const { data: familyData } = useFamilyHome();
  const { data: doctorGroups } = useDoctorsQuery();
  const { calendarVisits } = useVisits();
  const people = familyData?.people ?? [];
  const doctors = (doctorGroups ?? []).flatMap((g) => g.doctors);
  const visits = calendarVisits ?? [];

  const urgencyGroups = useMemo(() => {
    const flat = groups.flatMap((g) => g.todos);
    return groupTodosByUrgency(flat, showCompleted);
  }, [groups, showCompleted]);

  const personGroups = useMemo(
    () => groups.filter((g) => (showCompleted ? g.todos.length : g.todos.some((t) => !t.completed))),
    [groups, showCompleted],
  );

  if (isLoading) return <View style={{ flex: 1, backgroundColor: '#F4F2EC' }}><LoadingState message="Loading to-dos..." /></View>;
  if (error) return <View style={{ flex: 1, backgroundColor: '#F4F2EC' }}><ErrorState message={error.message} onRetry={refetch} /></View>;

  const Segmented = (
    <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 9, padding: 3, marginTop: 12 }}>
      {(['person', 'date'] as const).map((m) => {
        const active = mode === m;
        return (
          <PressableBase key={m} onPress={() => setMode(m)} accessibilityRole="button" accessibilityState={{ selected: active }} style={() => ({ flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 7, backgroundColor: active ? '#FFFFFF' : 'transparent' })}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: active ? '#1F5C41' : 'rgba(255,255,255,0.85)' }}>{m === 'person' ? 'By person' : 'By date'}</Text>
          </PressableBase>
        );
      })}
    </View>
  );

  const ShowCompletedToggle = (
    <PressableBase
      onPress={() => setShowCompleted(!showCompleted)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: showCompleted }}
      accessibilityLabel="Show completed"
      style={(pressed) => ({ flexDirection: 'row', alignItems: 'center', gap: 6, opacity: pressed ? 0.7 : 1 })}
    >
      <Text style={{ fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.85)' }}>Show completed</Text>
      <View style={{ width: 14, height: 14, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', borderRadius: 3, backgroundColor: showCompleted ? '#FFFFFF' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
        {showCompleted && <Text style={{ color: '#1F5C41', fontSize: 9, lineHeight: 12, fontWeight: '700' }}>✓</Text>}
      </View>
    </PressableBase>
  );

  const emptyEl = (
    <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 80 }}>
      <EmptyState title="You're all caught up" message="No to-dos due. Tap + to add one." />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F4F2EC' }}>
      <ScreenHeader title="To Do" right={ShowCompletedToggle}>
        {Segmented}
      </ScreenHeader>

      {mode === 'date' ? (
        <FlatList
          data={urgencyGroups}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ padding: 16, paddingTop: 16, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor="#1F5C41" />}
          ListEmptyComponent={emptyEl}
          renderItem={({ item }) => (
            <TodoUrgencyList group={item} onToggle={toggleTodo} onEdit={setEditingTodo} onDelete={deleteTodo} />
          )}
        />
      ) : (
        <FlatList
          data={personGroups}
          keyExtractor={(item) => item.personId ?? 'general'}
          contentContainerStyle={{ padding: 16, paddingTop: 16, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor="#1F5C41" />}
          ListEmptyComponent={emptyEl}
          renderItem={({ item }) => (
            <TodoPersonGroupCard group={item} showCompleted={showCompleted} onToggle={toggleTodo} onEdit={setEditingTodo} onDelete={deleteTodo} />
          )}
        />
      )}

      <FAB onPress={() => setShowAddModal(true)} accessibilityLabel="Add to-do" />
      <AddTodoModal visible={showAddModal} isLoading={isAdding} people={people} doctors={doctors} visits={visits} onAdd={addTodo} onDismiss={() => setShowAddModal(false)} />
      <EditTodoModal visible={editingTodo !== null} isLoading={isUpdating} todo={editingTodo} people={people} doctors={doctors} visits={visits} onSave={updateTodo} onDismiss={() => setEditingTodo(null)} />
    </View>
  );
};
