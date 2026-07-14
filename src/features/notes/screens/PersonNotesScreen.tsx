// src/features/notes/screens/PersonNotesScreen.tsx
// Person notes list — sort pill (newest/oldest), single-select type filter,
// tap-to-edit cards, and an add FAB that returns here on save.

import { PressableBase } from '@/design-system/components/PressableBase';
import { SubScreenHeader } from '@/design-system/components/SubScreenHeader';
import { useMemo, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ErrorState, LoadingState, EmptyState } from '@/design-system/components/EmptyState';
import { FAB } from '@/design-system/components/FAB';
import { NoteModal } from '../components/NoteModal';
import { NoteCard } from '../components/NoteCard';
import { usePersonNotes } from '../hooks/usePersonNotes';
import { usePersonDoctorsQuery } from '@/features/doctors/queries/doctors.queries';
import { usePersonMedicationsQuery } from '@/features/medications/queries/medications.queries';
import { useVisits } from '@/features/visits/hooks/useVisits';
import type { Note } from '../types/notes.types';
import { Icon } from '@/design-system/components/Icon';

type SortOrder = 'newest' | 'oldest';
type LinkFilter = 'doctor' | 'medication' | 'visit' | null;

interface PersonNotesScreenProps {
  personId: string;
  personName?: string;
}

const FILTER_CHIPS: { key: Exclude<LinkFilter, null>; emoji: string; label: string }[] = [
  { key: 'doctor', emoji: '👨‍⚕️', label: 'Doctor' },
  { key: 'medication', emoji: '💊', label: 'Medication' },
  { key: 'visit', emoji: '📅', label: 'Visit' },
];

// Notes with no date sort last regardless of order.
function sortByDate(notes: Note[], order: SortOrder): Note[] {
  const key = (n: Note) => `${n.noteDate ?? n.createdAt ?? ''}|${n.createdAt ?? ''}`;
  return [...notes].sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    if (!ka && !kb) return 0;
    if (!ka) return 1;
    if (!kb) return -1;
    return order === 'newest' ? kb.localeCompare(ka) : ka.localeCompare(kb);
  });
}

export const PersonNotesScreen = ({ personId, personName }: PersonNotesScreenProps) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [filter, setFilter] = useState<LinkFilter>(null);
  const [showHidden, setShowHidden] = useState(false);

  const { notes, isLoading, error, addNote, updateNote, deleteNote, setHidden, isSubmitting } = usePersonNotes(personId, showHidden);
  const { data: doctors = [] } = usePersonDoctorsQuery(personId);
  const { data: medicationGroups = [] } = usePersonMedicationsQuery(personId);
  const medications = medicationGroups.flatMap((g) => g.medications);
  const { listGroups } = useVisits();
  const personVisits = (listGroups ?? []).flatMap((g) => g.visits).filter((v) => v.personId === personId);

  const visibleNotes = useMemo(() => {
    const filtered = notes.filter((n) => {
      if (filter === 'doctor') return Boolean(n.doctorId);
      if (filter === 'medication') return Boolean(n.medicationId);
      if (filter === 'visit') return Boolean(n.visitId);
      return true;
    });
    return sortByDate(filtered, sortOrder);
  }, [notes, filter, sortOrder]);

  const HiddenToggle = (
    <PressableBase
      onPress={() => setShowHidden(!showHidden)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: showHidden }}
      accessibilityLabel="Show hidden"
      style={(pressed) => ({ flexDirection: 'row', alignItems: 'center', gap: 6, opacity: pressed ? 0.7 : 1 })}
    >
      <Text style={{ fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.85)' }}>Hidden</Text>
      <View style={{ width: 14, height: 14, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', borderRadius: 3, backgroundColor: showHidden ? '#FFFFFF' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
        {showHidden && <Icon name="checkmark" size={9} color="#1F5C41" weight="bold" />}
      </View>
    </PressableBase>
  );

  if (isLoading) return <LoadingState message="Loading notes..." />;
  if (error) return <ErrorState message={error.message} />;

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}>
      <SubScreenHeader title="Notes" subtitle={personName || undefined} right={HiddenToggle} />
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 }}>
        <View>
          <Text style={{ fontSize: 11, color: 'rgba(23,33,28,0.55)', marginBottom: 6 }}>Sort</Text>
          <PressableBase
            onPress={() => setSortOrder((o) => (o === 'newest' ? 'oldest' : 'newest'))}
            accessibilityRole="button"
            accessibilityLabel={`Sort ${sortOrder === 'newest' ? 'newest' : 'oldest'} first`}
            style={(pressed) => ({ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: pressed ? '#F0EFEA' : 'white', borderWidth: 1, borderColor: '#E3E2DB', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 })}
          >
            <Text style={{ fontSize: 12, color: 'rgba(23,33,28,0.65)' }}>{sortOrder === 'newest' ? '↓' : '↑'}</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(23,33,28,0.65)' }}>{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</Text>
          </PressableBase>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: 'rgba(23,33,28,0.55)', marginBottom: 6 }}>Filter</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {FILTER_CHIPS.map((chip) => {
              const active = filter === chip.key;
              return (
                <PressableBase
                  key={chip.key}
                  onPress={() => setFilter((f) => (f === chip.key ? null : chip.key))}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${chip.label}`}
                  style={(pressed) => ({ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: active ? '#1F5C41' : 'white', borderWidth: 1, borderColor: active ? '#1F5C41' : '#E3E2DB', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, opacity: pressed ? 0.7 : 1 })}
                >
                  <Text style={{ fontSize: 12 }}>{chip.emoji}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: active ? 'white' : 'rgba(23,33,28,0.65)' }}>{chip.label}</Text>
                </PressableBase>
              );
            })}
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 100, flexGrow: 1 }}>
        {visibleNotes.length === 0 ? (
          <EmptyState title={filter ? 'No matches' : 'No notes yet'} message={filter ? 'No notes match this filter.' : 'Tap + to add the first note.'} />
        ) : (
          visibleNotes.map((note) => (
            <NoteCard key={note.id} note={note} onEdit={setEditing} onDelete={deleteNote} dimmed={note.hidden} onToggleHidden={setHidden} />
          ))
        )}
      </ScrollView>

      <FAB onPress={() => setShowAddModal(true)} accessibilityLabel="Add note" />

      <NoteModal
        visible={showAddModal}
        editingNote={null}
        doctors={doctors}
        medications={medications}
        visits={personVisits}
        isLoading={isSubmitting}
        onSave={async (values) => { await addNote(values); setShowAddModal(false); }}
        onDismiss={() => setShowAddModal(false)}
      />

      <NoteModal
        visible={editing !== null}
        editingNote={editing}
        doctors={doctors}
        medications={medications}
        visits={personVisits}
        isLoading={isSubmitting}
        onSave={async (values) => { if (editing) await updateNote(editing.id, values); setEditing(null); }}
        onDismiss={() => setEditing(null)}
      />
    </View>
  );
};
