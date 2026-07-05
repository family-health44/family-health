import { useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { PressableBase } from '@/design-system/components/PressableBase';
import { EmptyState, ErrorState, LoadingState } from '@/design-system/components/EmptyState';
import { FAB } from '@/design-system/components/FAB';
import { ScreenHeader } from '@/design-system/components/ScreenHeader';
import { useTodos } from '../hooks/useTodos';
import { TodoPersonSection } from '../components/TodoPersonSection';
import { AddTodoModal } from '../components/AddTodoModal';
import { EditTodoModal } from '../components/EditTodoModal';
import { useFamilyHome } from '@/features/family/hooks/useFamilyHome';
import { useDoctorsQuery } from '@/features/doctors/queries/doctors.queries';
import { useVisits } from '../../visits/hooks/useVisits';
import type { Todo, TodoPersonGroup } from '../types/todos.types';

export const TodosScreen = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const { groups, isLoading, isRefreshing, error, addTodo, updateTodo, toggleTodo, deleteTodo, isAdding, isUpdating, refetch, refresh } = useTodos();
  const { data: familyData } = useFamilyHome();
  const { data: doctorGroups } = useDoctorsQuery();
  const { calendarVisits } = useVisits();
  const people = familyData?.people ?? [];
  const doctors = (doctorGroups ?? []).flatMap((g) => g.doctors);
  const visits = calendarVisits ?? [];


  if (isLoading) return <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}><LoadingState message="Loading to-dos..." /></View>;
  if (error) return <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}><ErrorState message={error.message} onRetry={refetch} /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}>
      <ScreenHeader
        title="To Do"
        right={
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
        }
      />

      <FlatList<TodoPersonGroup>
        data={groups}
        keyExtractor={(item) => item.personId ?? 'general'}
        contentContainerStyle={{ padding: 16, paddingTop: 16, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor="#1F5C41" />}
        ListEmptyComponent={<EmptyState title="All done!" message="No active to-do items." />}
        renderItem={({ item }) => (
          <TodoPersonSection group={item} showCompleted={showCompleted} onToggle={toggleTodo} onEdit={setEditingTodo} onDelete={deleteTodo} />
        )}
      />

      <FAB onPress={() => setShowAddModal(true)} accessibilityLabel="Add to-do" />
      <AddTodoModal visible={showAddModal} isLoading={isAdding} people={people} doctors={doctors} visits={visits} onAdd={addTodo} onDismiss={() => setShowAddModal(false)} />
      <EditTodoModal visible={editingTodo !== null} isLoading={isUpdating} todo={editingTodo} people={people} doctors={doctors} visits={visits} onSave={updateTodo} onDismiss={() => setEditingTodo(null)} />
    </View>
  );
};
