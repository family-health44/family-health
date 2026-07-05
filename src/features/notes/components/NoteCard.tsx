// src/features/notes/components/NoteCard.tsx
// NoteCard — renders a note with rich content parsing.
// EVENT segments display as styled chips, SECTION segments as headers.
// Long-press to edit or delete.

import { PressableBase } from '@/design-system/components/PressableBase';
import { View, Text, Pressable, Alert } from 'react-native';

import { Badge } from '@/design-system/components/Badge';
import { formatDate } from '@/shared/utils/dates';
import { parseNoteContent } from '../domain/notes.domain';

import type { Note, NoteSegment } from '../types/notes.types';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  dimmed?: boolean;
  onToggleHidden?: (note: Note, hidden: boolean) => void;
}

const NoteSegmentView = ({ segment }: { segment: NoteSegment }) => {
  if (segment.type === 'event') {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginVertical: 4 }}>
        <Badge label={segment.eventType ?? 'Event'} variant="info" />
        {segment.eventDate ? (
          <Text style={{ fontSize: 12, color: 'rgba(23,33,28,0.65)' }}>
            {formatDate(segment.eventDate)}
          </Text>
        ) : null}
        {segment.content ? (
          <Text style={{ fontSize: 14, color: '#1A1A1A', flex: 1 }}>
            {segment.content}
          </Text>
        ) : null}
      </View>
    );
  }

  if (segment.type === 'section') {
    return (
      <Text style={{
        fontSize: 11, fontWeight: '700', color: 'rgba(23,33,28,0.65)',
        textTransform: 'uppercase', letterSpacing: 0.8,
        marginTop: 8, marginBottom: 2,
      }}>
        {segment.content}
      </Text>
    );
  }

  return (
    <Text style={{ fontSize: 14, color: '#1A1A1A', lineHeight: 20 }}>
      {segment.content}
    </Text>
  );
};

export const NoteCard = ({ note, onEdit, onDelete, dimmed, onToggleHidden }: NoteCardProps) => {
  const segments = parseNoteContent(note.content);

  const handleLongPress = () => {
    Alert.alert(
      'Note options',
      undefined,
      [
        { text: 'Edit', onPress: () => onEdit(note) },
        {
          text: 'Delete', style: 'destructive',
          onPress: () => Alert.alert(
            'Delete note',
            'This cannot be undone.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => onDelete(note.id) },
            ],
          ),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  return (
    <PressableBase
      onLongPress={handleLongPress}
      onPress={() => onEdit(note)}
      accessibilityRole="button"
      accessibilityLabel="Note — tap to edit, long press for options"
      style={(pressed) => ({
        backgroundColor: '#FFFFFF',
        borderColor: '#E3E2DB',
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        opacity: pressed ? 0.85 : dimmed ? 0.55 : 1,
      })}
    >
      {note.hidden && onToggleHidden ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Text style={{ fontSize: 12 }}>🙈</Text>
            <Text style={{ fontSize: 11, fontWeight: '700', color: 'rgba(23,33,28,0.55)', textTransform: 'uppercase', letterSpacing: 0.6 }}>Hidden</Text>
          </View>
          <PressableBase
            onPress={() => onToggleHidden(note, false)}
            accessibilityRole="button"
            accessibilityLabel="Unhide note"
            style={(pressed) => ({ backgroundColor: pressed ? '#F0EFEA' : 'white', borderWidth: 1, borderColor: '#E3E2DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 })}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#1F5C41' }}>Unhide</Text>
          </PressableBase>
        </View>
      ) : null}

      {/* Linked context badges */}
      {(note.doctorName ?? note.medicationName) ? (
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
          {note.doctorName ? <Badge label={note.doctorName} variant="info" /> : null}
          {note.medicationName ? <Badge label={note.medicationName} variant="success" /> : null}
        </View>
      ) : null}

      {note.noteDate ? (
        <Text style={{ fontSize: 12, color: 'rgba(23,33,28,0.65)', fontWeight: '600', marginBottom: 6 }}>
          {formatDate(note.noteDate)}
        </Text>
      ) : null}

      {/* Parsed content */}
      <View style={{ gap: 2 }}>
        {segments.map((segment, index) => (
          <NoteSegmentView key={index} segment={segment} />
        ))}
      </View>
    </PressableBase>
  );
};
