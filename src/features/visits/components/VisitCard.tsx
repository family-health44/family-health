import { PressableBase } from '@/design-system/components/PressableBase';
import { View, Text } from 'react-native';
import { getPersonColour } from '@/shared/utils/avatar';
import { formatDate } from '@/shared/utils/dates';
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

  return (
    <PressableBase
      onPress={() => onPress?.(visit.id)}
      accessibilityRole="button"
      accessibilityLabel={`${visit.title} on ${formatDate(visit.visitDate)}`}
      style={(pressed) => ({
        backgroundColor: colourSet.bg,
        borderColor: colourSet.border,
        borderWidth: 1.5,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        opacity: isPast ? 0.6 : pressed ? 0.85 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colourSet.dot, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Text style={{ color: 'white', fontSize: 11, fontWeight: '700' }}>
            {visit.personName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <Text style={{ fontSize: 14, fontWeight: '700', color: colourSet.text, flex: 1 }}>{visit.title}</Text>
        <Text style={{ color: colourSet.border, fontSize: 13 }}>›</Text>
      </View>
      <View style={{ paddingLeft: 44, flexDirection: 'row', gap: 8 }}>
        <Text style={{ fontSize: 11, fontWeight: '600', color: colourSet.text }}>{visit.personName}</Text>
        <Text style={{ fontSize: 11, color: colourSet.dot, fontWeight: '500' }}>{formatDate(visit.visitDate)}</Text>
      </View>
    </PressableBase>
  );
};
