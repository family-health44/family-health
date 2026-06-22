// src/features/medications/components/MedicationNotesTab.tsx
import { View, Text } from 'react-native';
import { EmptyState } from '@/design-system/components/EmptyState';
import { formatDate } from '@/shared/utils/dates';
import { usePersonNotesQuery } from '@/features/notes/queries/notes.queries';
import { parseNoteContent } from '@/features/notes/domain/notes.domain';

export const MedicationNotesTab = ({ personId, medicationId }: { personId: string; medicationId: string }) => {
  const { data: allNotes = [], isLoading } = usePersonNotesQuery(personId);
  const notes = allNotes.filter((n) => n.medicationId === medicationId);

  if (isLoading) return <Text style={{ fontSize: 13, color: '#A8A09A', textAlign: 'center', paddingVertical: 20 }}>Loading notes...</Text>;
  if (notes.length === 0) return <EmptyState title="No notes" message="Notes linked to this medication will appear here." />;

  return (
    <View style={{ gap: 10 }}>
      {notes.map((note) => {
        const segments = parseNoteContent(note.content);
        return (
          <View key={note.id} style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8E4DC', borderRadius: 12, padding: 12 }}>
            {note.noteDate ? (
              <Text style={{ fontSize: 12, color: '#6B6866', fontWeight: '600', marginBottom: 6 }}>{formatDate(note.noteDate)}</Text>
            ) : null}
            {segments.map((seg, i) => (
              <Text key={i} style={{ fontSize: 14, color: '#1A1A1A', lineHeight: 20 }}>{seg.content}</Text>
            ))}
          </View>
        );
      })}
    </View>
  );
};
