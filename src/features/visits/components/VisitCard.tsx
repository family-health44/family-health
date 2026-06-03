// src/features/visits/components/VisitCard.tsx
// Visit card — coloured per person, used in list and calendar views.
import { View, Text, Pressable } from 'react-native';
import { PERSON_COLOURS } from '@/design-system/tokens/colours';
import { formatDate } from '@/shared/utils/dates';
import type { Visit } from '../types/visits.types';

interface VisitCardProps {
  visit: Visit;
  onPress?: (visitId: string) => void;
  compact?: boolean;
  isPast?: boolean;
}

export const VisitCard = ({ visit, onPress, compact = false, isPast = false }: VisitCardProps) => {
  const colourIndex = Math.abs(visit.personId.charCodeAt(0)) % PERSON_COLOURS.length;
  const colourSet = PERSON_COLOURS[colourIndex] ?? PERSON_COLOURS[0];

  if (compact) {
    return (
      <Pressable
        onPress={() => onPress?.(visit.id)}
        accessibilityRole="button"
        accessibilityLabel={visit.title}
        style={({ pressed }) => ({
          backgroundColor: colourSet?.bg ?? '#E8EFF8',
          borderRadius: 4,
          paddingHorizontal: 5,
          paddingVertical: 2,
          marginBottom: 2,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text numberOfLines={1} style={{ fontSize: 10, color: colourSet?.text ?? '#1A3A6B', fontWeight: '600' }}>
          {visit.title}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => onPress?.(visit.id)}
      accessibilityRole="button"
      accessibilityLabel={`${visit.title} on ${formatDate(visit.visitDate)}`}
      style={({ pressed }) => ({
        backgroundColor: colourSet?.bg ?? '#E8EFF8',
        borderColor: colourSet?.border ?? '#C0CFDF',
        borderWidth: 1.5,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        opacity: isPast ? 0.6 : pressed ? 0.85 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        {/* Initials avatar */}
        <View style={{
          width: 34, height: 34, borderRadius: 17,
          backgroundColor: colourSet?.dot ?? '#2C5282',
          alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Text style={{ color: 'white', fontSize: 11, fontWeight: '700' }}>
            {visit.personName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <Text style={{ fontSize: 14, fontWeight: '700', color: colourSet?.text ?? '#1A3A6B', flex: 1 }}>
          {visit.title}
        </Text>
        <Text style={{ color: colourSet?.border ?? '#C0CFDF', fontSize: 13 }}>›</Text>
      </View>
      <View style={{ paddingLeft: 44, flexDirection: 'row', gap: 8 }}>
        <Text style={{ fontSize: 11, fontWeight: '600', color: colourSet?.text ?? '#1A3A6B' }}>
          {visit.personName}
        </Text>
        <Text style={{ fontSize: 11, color: colourSet?.dot ?? '#2C5282', fontWeight: '500' }}>
          {formatDate(visit.visitDate)}
        </Text>
      </View>
    </Pressable>
  );
};
