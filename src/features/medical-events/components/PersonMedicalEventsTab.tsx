// src/features/medical-events/components/PersonMedicalEventsTab.tsx
// Medical events tab for person detail — grouped by type, sorted by date.

import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';

import { EmptyState, ErrorState, LoadingState } from '@/design-system/components/EmptyState';
import { usePersonMedicalEvents } from '../hooks/usePersonMedicalEvents';
import { MedicalEventCard } from './MedicalEventCard';
import { AddMedicalEventModal } from './AddMedicalEventModal';

import type { PersonColourSet } from '@/design-system/tokens/colours';

interface PersonMedicalEventsTabProps {
  personId: string;
  colourSet: PersonColourSet;
}

export const PersonMedicalEventsTab = ({
  personId, colourSet,
}: PersonMedicalEventsTabProps) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const { groups, isLoading, error, addEvent, deleteEvent, isAdding } =
    usePersonMedicalEvents(personId);

  if (isLoading) return <LoadingState message="Loading medical events..." />;
  if (error) return <ErrorState message={error.message} />;

  const totalCount = groups.reduce((acc, g) => acc + g.events.length, 0);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {totalCount === 0 ? (
          <EmptyState
            title="No medical events yet"
            message="Record diagnoses, procedures, illnesses and other medical events."
            actionLabel="Add event"
            onAction={() => setShowAddModal(true)}
          />
        ) : (
          <>
            {groups.map((group) => (
              <View key={group.type} style={{ marginBottom: 20 }}>
                {/* Group header */}
                <Text style={{
                  fontSize: 13, fontWeight: '600', color: '#6B6866',
                  textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10,
                }}>
                  {group.label}
                </Text>

                {group.events.map((event) => (
                  <MedicalEventCard
                    key={event.id}
                    event={event}
                    colourSet={colourSet}
                    onDelete={deleteEvent}
                  />
                ))}
              </View>
            ))}

            {/* Add more button */}
            <Pressable
              onPress={() => setShowAddModal(true)}
              accessibilityRole="button"
              accessibilityLabel="Add medical event"
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 14,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: colourSet.border,
                borderStyle: 'dashed',
                backgroundColor: pressed ? colourSet.bg : 'transparent',
                gap: 8,
              })}
            >
              <Text style={{ fontSize: 18, color: colourSet.dot }}>+</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colourSet.dot }}>
                Add event
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      <AddMedicalEventModal
        visible={showAddModal}
        isLoading={isAdding}
        onAdd={addEvent}
        onDismiss={() => setShowAddModal(false)}
      />
    </View>
  );
};
