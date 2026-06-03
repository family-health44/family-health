// src/features/todos/screens/TodosScreen.tsx
// Todos screen — coloured per-person sections, completion toggle, add modal.
// Thin screen: imports hook + components only. No business logic.
import { useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { ScreenWrapper } from '@/design-system/components/ScreenWrapper';
import { EmptyState, ErrorState, LoadingState } from '@/design-system/components/EmptyState';
import { FAB } from '@/design-system/components/FAB';
import { HamburgerButton } from '@/design-system/components/HamburgerButton';
import { Fonts } from '@/design-system/tokens/fonts';
import { useTodos } from '../hooks/useTodos';
import { TodoPersonSection } from '../components/TodoPersonSection';
import { AddTodoModal } from '../components/AddTodoModal';
import { countIncompleteTodos, countOverdueTodos } from '../domain/todos.domain';
import type { TodoPersonGroup } from '../types/todos.types';

export const TodosScreen = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const {
    groups, isLoading, isRefreshing, error,
    addTodo, toggleTodo, deleteTodo, isAdding, refetch,
  } = useTodos();

  const incompleteCount = countIncompleteTodos(groups);
  const overdueCount = countOverdueTodos(groups);

  if (isLoading) {
    return <ScreenWrapper><LoadingState message="Loading to-dos..." /></ScreenWrapper>;
  }
  if (error) {
    return <ScreenWrapper><ErrorState message={error.message} onRetry={refetch} /></ScreenWrapper>;
  }

  return (
    <ScreenWrapper padded={false}>
      <FlatList<TodoPersonGroup>
        data={groups}
        keyExtractor={(item) => item.personId ?? 'general'}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refetch} tintColor="#2A6049" />
        }
        ListHeaderComponent={
          <View style={{ marginBottom: 16 }}>
            {/* Top row: hamburger + show completed */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <HamburgerButton onPress={() => {/* TODO: open drawer */}} />
              <View style={{ flex: 1 }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text
                  style={{ fontSize: 11, fontWeight: '500', color: '#6B6460' }}
                  onPress={() => setShowCompleted(!showCompleted)}
                >
                  Show completed
                </Text>
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderWidth: 1.5,
                    borderColor: showCompleted ? '#2A6049' : '#C8C4BC',
                    borderRadius: 3,
                    backgroundColor: showCompleted ? '#2A6049' : 'white',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  accessible={true}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: showCompleted }}
                >
                  {showCompleted && (
                    <Text style={{ color: 'white', fontSize: 9, lineHeight: 12 }}>✓</Text>
                  )}
                </View>
              </View>
            </View>
            {/* Title */}
            <Text style={{ fontSize: 33, fontWeight: '300', color: '#1C1917', fontFamily: Fonts.serif, lineHeight: 36 }}>
              To Do
            </Text>
            {/* Subtitle */}
            <Text style={{ fontSize: 12, color: '#A8A09A', marginTop: 2 }}>
              {incompleteCount} active{overdueCount > 0 ? ` · ${overdueCount} overdue` : ''}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState title="All done!" message="No active to-do items." />
        }
        renderItem={({ item }) => (
          <TodoPersonSection
            group={item}
            showCompleted={showCompleted}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        )}
      />

      <FAB onPress={() => setShowAddModal(true)} accessibilityLabel="Add to-do" />

      <AddTodoModal
        visible={showAddModal}
        isLoading={isAdding}
        onAdd={addTodo}
        onDismiss={() => setShowAddModal(false)}
      />
    </ScreenWrapper>
  );
};