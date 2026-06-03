// src/features/visits/screens/VisitsScreen.tsx
// Visits screen — list, week, and month views switchable via toggle.
// Thin screen: imports hook + components only. No business logic.
import { useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { ScreenWrapper } from '@/design-system/components/ScreenWrapper';
import { EmptyState, ErrorState, LoadingState } from '@/design-system/components/EmptyState';
import { FAB } from '@/design-system/components/FAB';
import { HamburgerButton } from '@/design-system/components/HamburgerButton';
import { Fonts } from '@/design-system/tokens/fonts';
import { useDrawer } from '@/design-system/components/DrawerContext';
import { useVisits } from '../hooks/useVisits';
import { VisitsViewToggle } from '../components/VisitsViewToggle';
import { VisitCard } from '../components/VisitCard';
import { WeekCalendarView } from '../components/WeekCalendarView';
import { MonthCalendarView } from '../components/MonthCalendarView';
import { AddVisitModal } from '../components/AddVisitModal';
import type { Visit } from '../types/visits.types';

export const VisitsScreen = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const {
    viewMode, setViewMode,
    listGroups, calendarVisits,
    isLoading, error,
    addVisit, isAdding, refetch,
  } = useVisits();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { openDrawer } = useDrawer();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refetch();
    setIsRefreshing(false);
  };

  const handleVisitPress = (visitId: string) => {
    router.push(`/(app)/visits/${visitId}`);
  };

  const upcomingCount = listGroups?.find(g => g.label === 'Upcoming')?.visits.length ?? 0;

  if (isLoading) {
    return <ScreenWrapper><LoadingState message="Loading visits..." /></ScreenWrapper>;
  }
  if (error) {
    return <ScreenWrapper><ErrorState message={error.message} onRetry={refetch} /></ScreenWrapper>;
  }

  return (
    <ScreenWrapper padded={false}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <HamburgerButton onPress={openDrawer} />
        <Text style={{
          fontSize: 33,
          fontWeight: '300',
          color: '#1C1917',
          fontFamily: Fonts.serif,
          lineHeight: 36,
          marginTop: 8,
        }}>
          Visits
        </Text>
        <Text style={{ fontSize: 12, color: '#A8A09A', marginTop: 2 }}>
          {upcomingCount} upcoming
        </Text>
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
                fontSize: 10,
                fontWeight: '700',
                color: '#A8A09A',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: 8,
              }}>
                {group.label}
              </Text>
              {group.visits.map((visit: Visit) => (
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

      <FAB onPress={() => setShowAddModal(true)} accessibilityLabel="Add visit" />

      <AddVisitModal
        visible={showAddModal}
        isLoading={isAdding}
        onAdd={addVisit}
        onDismiss={() => setShowAddModal(false)}
      />
    </ScreenWrapper>
  );
};