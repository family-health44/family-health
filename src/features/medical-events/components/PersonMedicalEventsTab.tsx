// src/features/medical-events/components/PersonMedicalEventsTab.tsx
import { PressableBase } from '@/design-system/components/PressableBase';
import { SubScreenHeader } from '@/design-system/components/SubScreenHeader';
import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ErrorState, LoadingState } from '@/design-system/components/EmptyState';
import { FAB } from '@/design-system/components/FAB';
import { usePersonMedicalEvents } from '../hooks/usePersonMedicalEvents';
import { MedicalEventCard } from './MedicalEventCard';
import { AddMedicalEventModal } from './AddMedicalEventModal';
import { EditMedicalEventModal } from './EditMedicalEventModal';
import type { MedicalEvent } from '../types/medical-events.types';

interface PersonMedicalEventsTabProps {
  personId: string;
  personName?: string;
}

// Section header colours — these are the coloured accordion headers.
// Cards inside use plain white to avoid clashing with the header hue.
const SECTION_COLOURS = [
  { bg: '#EAF0F8', border: '#B0C8E8', text: '#1A3254' }, // blue
  { bg: '#EEF4E8', border: '#C2D9A8', text: '#243F0A' }, // green
  { bg: '#FAEAEA', border: '#F0B8B8', text: '#8F2E3B' }, // red
];

export const PersonMedicalEventsTab = ({ personId, personName }: PersonMedicalEventsTabProps) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState<MedicalEvent | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const { groups, isLoading, error, addEvent, updateEvent, deleteEvent, isAdding, isUpdating } = usePersonMedicalEvents(personId);

  if (isLoading) return <LoadingState message="Loading medical events..." />;
  if (error) return <ErrorState message={error.message} />;

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}>
      <SubScreenHeader title="Medical Events" subtitle={personName || undefined} />

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 8, flexGrow: 1 }}>
        {groups.map((group, index) => {
          const sc = SECTION_COLOURS[index % SECTION_COLOURS.length]!;
          const isCollapsed = collapsed[group.type] ?? false;
          return (
            <View key={group.type} style={{ marginBottom: 10 }}>
              <PressableBase
                onPress={() => setCollapsed((prev) => ({ ...prev, [group.type]: !isCollapsed }))}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: sc.bg, borderWidth: 1.5, borderColor: sc.border,
                  borderTopLeftRadius: 12, borderTopRightRadius: 12,
                  borderBottomLeftRadius: isCollapsed ? 12 : 0,
                  borderBottomRightRadius: isCollapsed ? 12 : 0,
                  paddingHorizontal: 14, paddingVertical: 11,
                }}
              >
                <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: sc.text }}>{group.label}</Text>
                <Text style={{ color: sc.border, fontSize: 13 }}>{isCollapsed ? '∨' : '∧'}</Text>
              </PressableBase>
              {!isCollapsed && (
                <View style={{ backgroundColor: 'white', borderLeftWidth: 1.5, borderRightWidth: 1.5, borderBottomWidth: 1.5, borderColor: sc.border, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, overflow: 'hidden' }}>
                  {group.events.length === 0 ? (
                    <View style={{ padding: 14, alignItems: 'center' }}>
                      <Text style={{ fontSize: 12, color: 'rgba(23,33,28,0.55)', fontStyle: 'italic' }}>No {group.label.toLowerCase()} recorded yet</Text>
                    </View>
                  ) : (
                    group.events.map((event, i) => (
                      <MedicalEventCard
                        key={event.id}
                        event={event}
                        onDelete={deleteEvent}
                        onEdit={setEditing}
                        isLast={i === group.events.length - 1}
                      />
                    ))
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <FAB onPress={() => setShowAddModal(true)} accessibilityLabel="Add medical event" />
      <AddMedicalEventModal visible={showAddModal} isLoading={isAdding} onAdd={addEvent} onDismiss={() => setShowAddModal(false)} />
      <EditMedicalEventModal visible={editing !== null} isLoading={isUpdating} event={editing} onSave={updateEvent} onDismiss={() => setEditing(null)} />
    </View>
  );
};
