// src/features/notes/components/PersonNotesSection.tsx
// Embeddable notes section — used in the person overview tab.
// Shows notes list with add/edit modal. Fetches its own doctors and medications
// for the linking UI so it's self-contained.

import { PressableBase } from '@/design-system/components/PressableBase';
import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';

import { EmptyState, ErrorState, LoadingState } from '@/design-system/components/EmptyState';
import { usePersonDoctorsQuery } from '@/features/doctors/queries/doctors.queries';
import { usePersonMedicationsQuery } from '@/features/medications/queries/medications.queries';
import { usePersonNotes } from '../hooks/usePersonNotes';
import { NoteCard } from './NoteCard';
import { NoteModal } from './NoteModal';

import type { PersonColourSet } from '@/design-system/tokens/colours';
import type { NoteFormValues } from '../types/notes.types';

interface PersonNotesSectionProps {
  personId: string;
  colourSet: PersonColourSet;
}

export const PersonNotesSection = ({ personId, colourSet }: PersonNotesSectionProps) => {
  const [showModal, setShowModal] = useState(false);
  const {
    notes, isLoading, error,
    editingNote, setEditingNote,
    addNote, updateNote, deleteNote, isSubmitting,
  } = usePersonNotes(personId);

  // Fetch doctors and medications for linking UI
  const { data: doctorGroups = [] } = usePersonDoctorsQuery(personId);
  const { data: medGroups = [] } = usePersonMedicationsQuery(personId);

  // Flatten for the modal
  const medications = medGroups.flatMap((g) => g.medications);

  const handleSave = async (values: NoteFormValues) => {
    if (editingNote) {
      await updateNote(editingNote.id, values);
    } else {
      await addNote(values);
    }
    setShowModal(false);
    setEditingNote(null);
  };

  const handleEdit = (note: Parameters<typeof setEditingNote>[0]) => {
    setEditingNote(note);
    setShowModal(true);
  };

  const handleDismiss = () => {
    setShowModal(false);
    setEditingNote(null);
  };

  if (isLoading) return <LoadingState message="Loading notes..." />;
  if (error) return <ErrorState message={error.message} />;

  return (
    <View style={{ padding: 16 }}>
      {/* Section header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 14,
      }}>
        <Text style={{
          fontSize: 13, fontWeight: '600', color: '#6B6866',
          textTransform: 'uppercase', letterSpacing: 0.8,
        }}>
          Notes
        </Text>
        <PressableBase
          onPress={() => { setEditingNote(null); setShowModal(true); }}
          accessibilityRole="button"
          accessibilityLabel="Add note"
          style={(pressed) => ({
            backgroundColor: colourSet.dot,
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingVertical: 5,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>+ Add</Text>
        </PressableBase>
      </View>

      {notes.length === 0 ? (
        <EmptyState
          title="No notes yet"
          message="Add a note to record observations, symptoms, or reminders."
          actionLabel="Add note"
          onAction={() => { setEditingNote(null); setShowModal(true); }}
        />
      ) : (
        notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={handleEdit}
            onDelete={deleteNote}
          />
        ))
      )}

      <NoteModal
        visible={showModal}
        isLoading={isSubmitting}
        editingNote={editingNote}
        doctors={doctorGroups}
        medications={medications}
        onSave={handleSave}
        onDismiss={handleDismiss}
      />
    </View>
  );
};
