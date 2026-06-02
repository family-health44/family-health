// src/features/visits/screens/VisitsScreen.tsx
// Visits screen — list, week, and month views switchable via toggle.
// Thin screen: imports hook + components only. No business logic.

import { useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { router } from 'expo-router';

import { ScreenWrapper } from '@/design-system/components/ScreenWrapper';
import { EmptyState, ErrorState, LoadingState } from '@/design-system/components/EmptyState';
import { useVisits } from '../hooks/useVisits';
import { VisitsViewToggle } from '../components/VisitsViewToggle';
import { VisitCard } from '../components/VisitCard';
import { WeekCalendarView } from '../components/WeekCalendarView';
import { MonthCalendarView } from '../components/MonthCalendarView';
import { AddVisitModal } from '../components/AddVisitModal';

export const VisitsScreen = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const {
    viewMode, setViewMode,
    listGroups, calendarVisits,
    isLoading, error,
    addVisit, isAdding, refetch,
  } = useVisits();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refetch();
    setIsRefreshing(false);
  };

  const handleVisitPress = (visitId: string) => {
    router.push(`/(app)/visits/${visitId}`);
  };

  if (isLoading) {
    return <ScreenWrapper><LoadingState message="Loading visits..." /></ScreenWrapper>;
  }

  if (error) {
    return <ScreenWrapper><ErrorState message={error.message} onRetry={refetch} /></ScreenWrapper>;
  }

  return (
    <ScreenWrapper padded={false}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#1A1A1A' }}>Visits</Text>
          <Pressable
            onPress={() => setShowAddModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Add visit"
            style={({ pressed }) => ({
              backgroundColor: '#2A6049',
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 8,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>+ Add</Text>
          </Pressable>
        </View>
      </View>

      {/* View toggle */}
      <VisitsViewToggle activeMode={viewMode} onModeChange={setViewMode} />

      {/* Content */}
      {viewMode === 'list' && (
        <FlatList
          data={listGroups ?? []}
          keyExtractor={(item) => item.label}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#2A6049" />
          }
          ListEmptyComponent={
            <EmptyState
              title="No visits yet"
              message="Add a visit to track medical appointments."
              actionLabel="Add visit"
              onAction={() => setShowAddModal(true)}
            />
          }
          renderItem={({ item: group }) => (
            <View style={{ marginBottom: 16 }}>
              <Text style={{
                fontSize: 13, fontWeight: '600', color: '#6B6866',
                textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10,
              }}>
                {group.label}
              </Text>
              {group.visits.map((visit: import('@/features/visits/types/visits.types').Visit) => (
                <VisitCard key={visit.id} visit={visit} onPress={handleVisitPress} />
              ))}
            </View>
          )}
        />
      )}

      {viewMode === 'week' && (
        <WeekCalendarView
          visits={calendarVisits ?? []}
          onVisitPress={handleVisitPress}
        />
      )}

      {viewMode === 'month' && (
        <MonthCalendarView
          visits={calendarVisits ?? []}
          onVisitPress={handleVisitPress}
        />
      )}

      <AddVisitModal
        visible={showAddModal}
        isLoading={isAdding}
        onAdd={addVisit}
        onDismiss={() => setShowAddModal(false)}
      />
    </ScreenWrapper>
  );
};
