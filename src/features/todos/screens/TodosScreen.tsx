import { useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableBase } from '@/design-system/components/PressableBase';
import { EmptyState, ErrorState, LoadingState } from '@/design-system/components/EmptyState';
import { FAB } from '@/design-system/components/FAB';
import { HamburgerButton } from '@/design-system/components/HamburgerButton';
import { Fonts } from '@/design-system/tokens/fonts';
import { useDrawer } from '@/design-system/components/DrawerContext';
import { useTodos } from '../hooks/useTodos';
import { TodoPersonSection } from '../components/TodoPersonSection';
import { AddTodoModal } from '../components/AddTodoModal';
import { useFamilyHome } from '@/features/family/hooks/useFamilyHome';
import { useDoctorsQuery } from '@/features/doctors/queries/doctors.queries';
import { useVisits } from '../../visits/hooks/useVisits';
import { countIncompleteTodos, countOverdueTodos } from '../domain/todos.domain';
import type { TodoPersonGroup } from '../types/todos.types';

export const TodosScreen = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const { openDrawer } = useDrawer();
  const insets = useSafeAreaInsets();
  const { groups, isLoading, isRefreshing, error, addTodo, toggleTodo, deleteTodo, isAdding, refetch } = useTodos();
  const { data: familyData } = useFamilyHome();
  const { data: doctorGroups } = useDoctorsQuery();
  const { calendarVisits } = useVisits();
  const people = familyData?.people ?? [];
  const doctors = (doctorGroups ?? []).flatMap((g) => g.doctors);
  const visits = calendarVisits ?? [];

  const incompleteCount = countIncompleteTodos(groups);
  const overdueCount = countOverdueTodos(groups);

  if (isLoading) return <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}><LoadingState message="Loading to-dos..." /></View>;
  if (error) return <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}><ErrorState message={error.message} onRetry={refetch} /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}>
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 16, paddingBottom: 8 }}>
        <HamburgerButton onPress={openDrawer} />
        <Text style={{ fontSize: 33, fontWeight: '300', color: '#1C1917', fontFamily: Fonts.serif, lineHeight: 36, marginTop: 8 }}>To Do</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          <Text style={{ flex: 1, fontSize: 12, color: '#A8A09A' }}>
            {incompleteCount} active{overdueCount > 0 ? ` · ${overdueCount} overdue` : ''}
          </Text>
          <PressableBase
            onPress={() => setShowCompleted(!showCompleted)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: showCompleted }}
            accessibilityLabel="Show completed"
            style={(pressed) => ({ flexDirection: 'row', alignItems: 'center', gap: 6, opacity: pressed ? 0.7 : 1 })}
          >
            <Text style={{ fontSize: 11, fontWeight: '500', color: '#6B6460' }}>Show completed</Text>
            <View style={{ width: 14, height: 14, borderWidth: 1.5, borderColor: showCompleted ? '#2A6049' : '#C8C4BC', borderRadius: 3, backgroundColor: showCompleted ? '#2A6049' : 'white', alignItems: 'center', justifyContent: 'center' }}>
              {showCompleted && <Text style={{ color: 'white', fontSize: 9, lineHeight: 12 }}>✓</Text>}
            </View>
          </PressableBase>
        </View>
      </View>

      <FlatList<TodoPersonGroup>
        data={groups}
        keyExtractor={(item) => item.personId ?? 'general'}
        contentContainerStyle={{ padding: 16, paddingTop: 8, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refetch} tintColor="#2A6049" />}
        ListEmptyComponent={<EmptyState title="All done!" message="No active to-do items." />}
        renderItem={({ item }) => (
          <TodoPersonSection group={item} showCompleted={showCompleted} onToggle={toggleTodo} onDelete={deleteTodo} />
        )}
      />

      <FAB onPress={() => setShowAddModal(true)} accessibilityLabel="Add to-do" />
      <AddTodoModal visible={showAddModal} isLoading={isAdding} people={people} doctors={doctors} visits={visits} onAdd={addTodo} onDismiss={() => setShowAddModal(false)} />
    </View>
  );
};
