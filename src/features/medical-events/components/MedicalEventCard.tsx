// src/features/medical-events/components/MedicalEventCard.tsx
// Cards always use white background — they live inside coloured section containers
// and must not clash with the section header colour.

import { PressableBase } from '@/design-system/components/PressableBase';
import { View, Text, Alert } from 'react-native';
import { Badge } from '@/design-system/components/Badge';
import { formatDate } from '@/shared/utils/dates';
import { MEDICAL_EVENT_CONFIG } from '../types/medical-events.types';
import type { MedicalEvent } from '../types/medical-events.types';

interface MedicalEventCardProps {
  event: MedicalEvent;
  onDelete: (noteId: string) => void;
  onEdit: (event: MedicalEvent) => void;
  isLast?: boolean;
}

export const MedicalEventCard = ({ event, onDelete, onEdit, isLast = false }: MedicalEventCardProps) => {
  const config = MEDICAL_EVENT_CONFIG[event.eventType];

  const handleLongPress = () => {
    Alert.alert(
      'Delete event',
      `Delete this ${config.label.toLowerCase()} record? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(event.id) },
      ],
    );
  };

  return (
    <PressableBase
      onPress={() => onEdit(event)}
      onLongPress={handleLongPress}
      accessibilityRole="button"
      accessibilityLabel={`${config.label} on ${formatDate(event.eventDate)}: ${event.description}`}
      accessibilityHint="Tap to edit, long press to delete"
      style={(pressed) => ({
        backgroundColor: '#FFFFFF',
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: '#F0EFEA',
        padding: 14,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Badge label={config.label} variant={config.badgeVariant} />
        <Text style={{ fontSize: 13, color: 'rgba(23,33,28,0.65)', marginLeft: 'auto' }}>
          {formatDate(event.eventDate)}
        </Text>
      </View>
      {event.description ? (
        <Text style={{ fontSize: 14, color: '#1A1A1A', lineHeight: 20 }}>
          {event.description}
        </Text>
      ) : null}
      {event.doctorName ? (
        <Text style={{ fontSize: 13, color: 'rgba(23,33,28,0.65)', marginTop: 6 }}>
          {event.doctorName}
        </Text>
      ) : null}
    </PressableBase>
  );
};
