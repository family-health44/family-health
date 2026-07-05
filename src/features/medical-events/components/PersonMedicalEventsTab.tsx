// src/features/medical-events/components/PersonMedicalEventsTab.tsx
import { SubScreenHeader } from '@/design-system/components/SubScreenHeader';
import { SectionCard, SectionEmpty, type SectionCardTone } from '@/design-system/components/SectionCard';
import { useState } from 'react';
import { View, ScrollView } from 'react-native';
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

// Accent-pill tones per event type (colour still encodes the type).
const SECTION_TONES: SectionCardTone[] = [
  { pillBg: '#E6F1FB', pillText: '#0C447C' }, // blue — diagnosis
  { pillBg: '#EAF3DE', pillText: '#27500A' }, // green — procedure
  { pillBg: '#FCEBEB', pillText: '#791F1F' }, // red — illness
];

export const PersonMedicalEventsTab = ({ personId, personName }: PersonMedicalEventsTabProps) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState<MedicalEvent | null>(null);
  const { groups, isLoading, error, addEvent, updateEvent, deleteEvent, isAdding, isUpdating } = usePersonMedicalEvents(personId);

  if (isLoading) return <LoadingState message="Loading medical events..." />;
  if (error) return <ErrorState message={error.message} />;

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}>
      <SubScreenHeader title="Medical Events" subtitle={personName || undefined} />

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 8, flexGrow: 1 }}>
        {groups.map((group, index) => (
          <SectionCard key={group.type} title={group.label} tone={SECTION_TONES[index % SECTION_TONES.length]!}>
            {group.events.length === 0 ? (
              <SectionEmpty text={`No ${group.label.toLowerCase()} recorded yet`} />
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
          </SectionCard>
        ))}
      </ScrollView>

      <FAB onPress={() => setShowAddModal(true)} accessibilityLabel="Add medical event" />
      <AddMedicalEventModal visible={showAddModal} isLoading={isAdding} onAdd={addEvent} onDismiss={() => setShowAddModal(false)} />
      <EditMedicalEventModal visible={editing !== null} isLoading={isUpdating} event={editing} onSave={updateEvent} onDismiss={() => setEditing(null)} />
    </View>
  );
};
