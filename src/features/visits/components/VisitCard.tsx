import { PressableBase } from '@/design-system/components/PressableBase';
import { View, Text } from 'react-native';
import { getPersonColour } from '@/shared/utils/avatar';
import { formatDate, formatTime } from '@/shared/utils/dates';
import type { Visit } from '../types/visits.types';

interface VisitCardProps {
  visit: Visit;
  onPress?: (visitId: string) => void;
  compact?: boolean;
  isPast?: boolean;
}

export const VisitCard = ({ visit, onPress, compact = false, isPast = false }: VisitCardProps) => {
  const colourSet = getPersonColour(visit.personColourIndex);

  if (compact) {
    return (
      <PressableBase
        onPress={() => onPress?.(visit.id)}
        accessibilityRole="button"
        accessibilityLabel={visit.title}
        style={(pressed) => ({
          backgroundColor: colourSet.bg,
          borderRadius: 4,
          paddingHorizontal: 5,
          paddingVertical: 2,
          marginBottom: 2,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text numberOfLines={1} style={{ fontSize: 10, color: colourSet.text, fontWeight: '600' }}>
          {visit.title}
        </Text>
      </PressableBase>
    );
  }

  const time = visit.visitTime ? formatTime(visit.visitTime) : null;
  const dateTime = time ? `${formatDate(visit.visitDate)} · ${time}` : formatDate(visit.visitDate);

  return (
    <PressableBase
      onPress={() => onPress?.(visit.id)}
      accessibilityRole="button"
      accessibilityLabel={`${visit.title} on ${formatDate(visit.visitDate)}`}
      style={(pressed) => ({
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 13,
        marginBottom: 10,
        shadowColor: '#17211C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        opacity: isPast ? 0.55 : pressed ? 0.85 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colourSet.dot, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Text style={{ color: 'white', fontSize: 11, fontWeight: '700' }}>
            {visit.personName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#17211C' }}>{visit.title}</Text>
          {visit.doctorName ? (
            <Text style={{ fontSize: 12, color: 'rgba(23,33,28,0.55)' }}>{visit.doctorName}</Text>
          ) : null}
          <Text style={{ fontSize: 11.5, color: '#1F5C41', fontWeight: '600' }}>{dateTime}</Text>
          <Text style={{ fontSize: 11, color: 'rgba(23,33,28,0.55)' }}>{visit.personName}</Text>
        </View>
        <Text style={{ color: 'rgba(23,33,28,0.4)', fontSize: 13 }}>›</Text>
      </View>
    </PressableBase>
  );
};
