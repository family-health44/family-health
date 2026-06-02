// src/features/todos/screens/TodosScreen.tsx
// Todos screen — coloured per-person sections, completion toggle, add modal.
// Thin screen: imports hook + components only. No business logic.

import { useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';

import { ScreenWrapper } from '@/design-system/components/ScreenWrapper';
import { EmptyState, ErrorState, LoadingState } from '@/design-system/components/EmptyState';
import { useTodos } from '../hooks/useTodos';
import { TodoPersonSection } from '../components/TodoPersonSection';
import { AddTodoModal } from '../components/AddTodoModal';
import { countIncompleteTodos } from '../domain/todos.domain';

import type { TodoPersonGroup } from '../types/todos.types';

export const TodosScreen = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const {
    groups, isLoading, isRefreshing, error,
    addTodo, toggleTodo, deleteTodo, isAdding, refetch,
  } = useTodos();

  const incompleteCount = countIncompleteTodos(groups);

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
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            tintColor="#2A6049"
          />
        }
        ListHeaderComponent={
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            marginTop: 8,
          }}>
            <View>
              <Text style={{ fontSize: 28, fontWeight: '700', color: '#1A1A1A' }}>
                To Do
              </Text>
              {incompleteCount > 0 && (
                <Text style={{ fontSize: 13, color: '#6B6866', marginTop: 2 }}>
                  {incompleteCount} remaining
                </Text>
              )}
            </View>

            <Pressable
              onPress={() => setShowAddModal(true)}
              accessibilityRole="button"
              accessibilityLabel="Add to-do"
              style={({ pressed }) => ({
                backgroundColor: '#2A6049',
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 8,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
                + Add
              </Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="All done!"
            message="No to-dos yet. Add one to get started."
            actionLabel="Add to-do"
            onAction={() => setShowAddModal(true)}
          />
        }
        renderItem={({ item: group }) => (
          <TodoPersonSection
            group={group}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        )}
      />

      <AddTodoModal
        visible={showAddModal}
        isLoading={isAdding}
        onAdd={addTodo}
        onDismiss={() => setShowAddModal(false)}
      />
    </ScreenWrapper>
  );
};
