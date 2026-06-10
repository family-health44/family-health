// src/features/medical-events/components/PersonMedicalEventsTab.tsx
// Medical events screen — collapsible coloured sections per event type.
import { PressableBase } from '@/design-system/components/PressableBase';
import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState, ErrorState, LoadingState } from '@/design-system/components/EmptyState';
import { FAB } from '@/design-system/components/FAB';
import { Fonts } from '@/design-system/tokens/fonts';
import { usePersonMedicalEvents } from '../hooks/usePersonMedicalEvents';
import { MedicalEventCard } from './MedicalEventCard';
import { AddMedicalEventModal } from './AddMedicalEventModal';
import type { PersonColourSet } from '@/design-system/tokens/colours';

interface PersonMedicalEventsTabProps {
  personId: string;
  colourSet: PersonColourSet;
  personName?: string;
}

const SECTION_COLOURS = [
  { bg: '#EAF0F8', border: '#B0C8E8', text: '#1A3254' },
  { bg: '#EEF4E8', border: '#C2D9A8', text: '#243F0A' },
  { bg: '#FAEAEA', border: '#F0B8B8', text: '#7A2030' },
];

export const PersonMedicalEventsTab = ({
  personId, colourSet, personName,
}: PersonMedicalEventsTabProps) => {
  const insets = useSafeAreaInsets();
  const [showAddModal, setShowAddModal] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const { groups, isLoading, error, addEvent, deleteEvent, isAdding } =
    usePersonMedicalEvents(personId);

  if (isLoading) return <LoadingState message="Loading medical events..." />;
  if (error) return <ErrorState message={error.message} />;

  const totalCount = groups.reduce((acc, g) => acc + g.events.length, 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 16, paddingBottom: 8 }}>
        <PressableBase
          onPress={() => router.back()}
          accessibilityRole="button"
          style={(pressed) => ({ opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 })}
        >
          <Text style={{ fontSize: 15, color: '#2A6049' }}>‹</Text>
          <Text style={{ fontSize: 14, color: '#2A6049', fontWeight: '500' }}>Back</Text>
        </PressableBase>
        <Text style={{ fontSize: 28, fontWeight: '300', fontFamily: Fonts.serif, color: '#1C1917', lineHeight: 32 }}>
          Medical Events
        </Text>
        {personName ? (
          <Text style={{ fontSize: 12, color: '#A8A09A', marginTop: 2 }}>{personName}</Text>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 8, flexGrow: 1 }}>
        {totalCount === 0 ? (
          <EmptyState
            title="No medical events yet"
            message="Record diagnoses, procedures, illnesses and other medical events."
          />
        ) : (
          groups.map((group, index) => {
            const sectionColour = SECTION_COLOURS[index % SECTION_COLOURS.length];
            const isCollapsed = collapsed[group.type] ?? false;
            return (
              <View key={group.type} style={{ marginBottom: 10 }}>
                {/* Collapsible header */}
                <PressableBase
                  onPress={() => setCollapsed((prev) => ({ ...prev, [group.type]: !isCollapsed }))}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: sectionColour?.bg,
                    borderWidth: 1.5,
                    borderColor: sectionColour?.border,
                    borderRadius: isCollapsed ? 12 : 12,
                    paddingHorizontal: 14,
                    paddingVertical: 11,
                  }}
                >
                  <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: sectionColour?.text }}>
                    {group.label}
                  </Text>
                  <Text style={{ color: sectionColour?.border, fontSize: 13 }}>
                    {isCollapsed ? '∨' : '∧'}
                  </Text>
                </PressableBase>

                {/* Events */}
                {!isCollapsed && (
                  <View style={{ marginTop: 2 }}>
                    {group.events.length === 0 ? (
                      <View style={{ padding: 12, alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, color: '#A8A09A' }}>No events yet</Text>
                      </View>
                    ) : (
                      group.events.map((event) => (
                        <MedicalEventCard
                          key={event.id}
                          event={event}
                          colourSet={colourSet}
                          onDelete={deleteEvent}
                        />
                      ))
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      <FAB onPress={() => setShowAddModal(true)} accessibilityLabel="Add medical event" />

      <AddMedicalEventModal
        visible={showAddModal}
        isLoading={isAdding}
        onAdd={addEvent}
        onDismiss={() => setShowAddModal(false)}
      />
    </View>
  );
};
