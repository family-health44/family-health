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
}

const NoteSegmentView = ({ segment }: { segment: NoteSegment }) => {
  if (segment.type === 'event') {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginVertical: 4 }}>
        <Badge label={segment.eventType ?? 'Event'} variant="info" />
        {segment.eventDate ? (
          <Text style={{ fontSize: 12, color: '#6B6866' }}>
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
        fontSize: 11, fontWeight: '700', color: '#6B6866',
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

export const NoteCard = ({ note, onEdit, onDelete }: NoteCardProps) => {
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
        borderColor: '#E8E4DC',
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {/* Linked context badges */}
      {(note.doctorName ?? note.medicationName) ? (
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
          {note.doctorName ? <Badge label={note.doctorName} variant="info" /> : null}
          {note.medicationName ? <Badge label={note.medicationName} variant="success" /> : null}
        </View>
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
