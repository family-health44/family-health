// src/features/visits/screens/VisitsScreen.tsx
// Visits screen — list, week, and month views switchable via toggle.
// Thin screen: imports hook + components only. No business logic.
import { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenHeader } from '@/design-system/components/ScreenHeader';
import { EmptyState, ErrorState, LoadingState } from '@/design-system/components/EmptyState';
import { FAB } from '@/design-system/components/FAB';
import { useVisits } from '../hooks/useVisits';
import { useFamilyHome } from '@/features/family/hooks/useFamilyHome';
import { useDoctorsQuery } from '@/features/doctors/queries/doctors.queries';
import { PressableBase } from '@/design-system/components/PressableBase';
import { Icon } from '@/design-system/components/Icon';
import { VisitsViewToggle } from '../components/VisitsViewToggle';
import { VisitCard } from '../components/VisitCard';
import { WeekCalendarView } from '../components/WeekCalendarView';
import { MonthCalendarView } from '../components/MonthCalendarView';
import { AddVisitModal } from '../components/AddVisitModal';
import type { Visit } from '../types/visits.types';

export const VisitsScreen = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [jumpDate, setJumpDate] = useState<string | null>(null);
  const [pastExpanded, setPastExpanded] = useState(false);

  const { add } = useLocalSearchParams<{ add?: string }>();
  const handledAddToken = useRef<string | null>(null);
  useEffect(() => {
    // The nudge sends a unique ?add token each tap, so this fires every time —
    // even when this screen is already mounted (e.g. the Visits tab) and not
    // remounted. Track the last handled token to avoid reopening on unrelated
    // re-renders.
    if (add && add !== handledAddToken.current) {
      handledAddToken.current = add;
      setShowAddModal(true);
    }
  }, [add]);
  const {
    viewMode, setViewMode,
    listGroups, calendarVisits,
    isLoading, error,
    addVisit, isAdding, refetch,
  } = useVisits();
  const { data: familyData } = useFamilyHome();
  const { data: doctorGroups } = useDoctorsQuery();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const people = familyData?.people ?? [];
  const doctors = (doctorGroups ?? []).flatMap((g) => g.doctors);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refetch();
    setIsRefreshing(false);
  };

  const handleVisitPress = (visitId: string) => {
    router.push(`/(app)/visits/${visitId}`);
  };

  if (isLoading) {
    return <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}><LoadingState message="Loading visits..." /></View>;
  }
  if (error) {
    return <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}><ErrorState message={error.message} onRetry={refetch} /></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}>
      <ScreenHeader title="Visits">
        <VisitsViewToggle activeMode={viewMode} onModeChange={setViewMode} variant="onColour" />
      </ScreenHeader>

      {/* Content */}
      {viewMode === 'list' && (
        <FlatList
          data={listGroups ?? []}
          keyExtractor={(item) => item.label}
          contentContainerStyle={{ padding: 16, paddingTop: 16, flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#1F5C41" />
          }
          ListEmptyComponent={
            <EmptyState
              title="No visits yet"
              message="Add a visit to track medical appointments."
              actionLabel="Add visit"
              onAction={() => setShowAddModal(true)}
            />
          }
          renderItem={({ item: group }) => {
            const isPast = group.label === 'Past';
            const isCollapsed = isPast && !pastExpanded;
            const labelStyle = {
              fontSize: 10,
              fontWeight: '700' as const,
              color: 'rgba(23,33,28,0.55)',
              textTransform: 'uppercase' as const,
              letterSpacing: 0.8,
            };
            return (
              <View style={{ marginBottom: 16 }}>
                {isPast ? (
                  <PressableBase
                    onPress={() => setPastExpanded((v) => !v)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: pastExpanded }}
                    accessibilityLabel={`Past visits, ${group.visits.length}`}
                    style={() => ({ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 })}
                  >
                    <Text style={labelStyle}>{group.label}</Text>
                    <Text style={{ ...labelStyle, color: 'rgba(23,33,28,0.40)' }}>{group.visits.length}</Text>
                    <Icon
                      name={pastExpanded ? 'chevron.up' : 'chevron.down'}
                      size={11}
                      color="rgba(23,33,28,0.55)"
                    />
                  </PressableBase>
                ) : (
                  <Text style={{ ...labelStyle, marginBottom: 8 }}>{group.label}</Text>
                )}
                {!isCollapsed && group.visits.map((visit: Visit) => (
                  <VisitCard key={visit.id} visit={visit} onPress={handleVisitPress} />
                ))}
              </View>
            );
          }}
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
          initialSelectedDate={jumpDate}
        />
      )}

      <FAB onPress={() => setShowAddModal(true)} accessibilityLabel="Add visit" />

      <AddVisitModal
        visible={showAddModal}
        isLoading={isAdding}
        people={people}
        doctors={doctors}
        onAdd={addVisit}
        onDismiss={() => setShowAddModal(false)}
      />
    </View>
  );
};
