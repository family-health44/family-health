// src/features/medical-events/components/MedicalEventCard.tsx
// Displays a single medical event with type badge, date, description, and doctor.

import { PressableBase } from '@/design-system/components/PressableBase';
import { View, Text, Pressable, Alert } from 'react-native';

import { Badge } from '@/design-system/components/Badge';
import { formatDate } from '@/shared/utils/dates';
import { MEDICAL_EVENT_CONFIG } from '../types/medical-events.types';

import type { MedicalEvent } from '../types/medical-events.types';
import type { PersonColourSet } from '@/design-system/tokens/colours';

interface MedicalEventCardProps {
  event: MedicalEvent;
  colourSet?: PersonColourSet;
  onDelete: (noteId: string) => void;
}

export const MedicalEventCard = ({
  event, colourSet, onDelete,
}: MedicalEventCardProps) => {
  const config = MEDICAL_EVENT_CONFIG[event.eventType];

  const handleLongPress = () => {
    Alert.alert(
      'Delete event',
      `Delete this ${config.label.toLowerCase()} record? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(event.id),
        },
      ],
    );
  };

  return (
    <PressableBase
      onLongPress={handleLongPress}
      accessibilityRole="button"
      accessibilityLabel={`${config.label} on ${formatDate(event.eventDate)}: ${event.description}`}
      accessibilityHint="Long press to delete"
      style={(pressed) => ({
        backgroundColor: colourSet?.bg ?? '#FFFFFF',
        borderColor: colourSet?.border ?? '#E8E4DC',
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {/* Header row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Badge label={config.label} variant={config.badgeVariant} />
        <Text style={{ fontSize: 13, color: '#6B6866', marginLeft: 'auto' }}>
          {formatDate(event.eventDate)}
        </Text>
      </View>

      {/* Description */}
      {event.description ? (
        <Text style={{ fontSize: 14, color: '#1A1A1A', lineHeight: 20 }}>
          {event.description}
        </Text>
      ) : null}

      {/* Doctor */}
      {event.doctorName ? (
        <Text style={{ fontSize: 13, color: '#6B6866', marginTop: 6 }}>
          {event.doctorName}
        </Text>
      ) : null}
    </PressableBase>
  );
};
