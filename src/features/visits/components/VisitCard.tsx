// src/features/visits/components/VisitCard.tsx
// Visit card — used in list view and as calendar day detail.
// Shows title, person, doctor, date/time. No business logic.

import { View, Text, Pressable } from 'react-native';

import { formatDate, formatTime } from '@/shared/utils/dates';

import type { Visit } from '../types/visits.types';

interface VisitCardProps {
  visit: Visit;
  onPress?: (visitId: string) => void;
  compact?: boolean; // compact mode for calendar day dots
}

export const VisitCard = ({ visit, onPress, compact = false }: VisitCardProps) => {
  if (compact) {
    return (
      <Pressable
        onPress={() => onPress?.(visit.id)}
        accessibilityRole="button"
        accessibilityLabel={visit.title}
        style={({ pressed }) => ({
          backgroundColor: '#E8EFF8',
          borderRadius: 6,
          paddingHorizontal: 6,
          paddingVertical: 3,
          marginBottom: 2,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text numberOfLines={1} style={{ fontSize: 11, color: '#1A3A6B', fontWeight: '500' }}>
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
        backgroundColor: '#FFFFFF',
        borderColor: '#E8E4DC',
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        opacity: pressed ? 0.85 : 1,
        borderLeftWidth: 3,
        borderLeftColor: '#2C5282',
      })}
    >
      {/* Title + date */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1A1A1A', flex: 1 }}>
          {visit.title}
        </Text>
        <Text style={{ fontSize: 13, color: '#6B6866', marginLeft: 8 }}>
          {formatDate(visit.visitDate)}
        </Text>
      </View>

      {/* Person + doctor */}
      <View style={{ marginTop: 6, gap: 2 }}>
        <Text style={{ fontSize: 13, color: '#4A4744' }}>
          {visit.personName}
          {visit.visitTime ? ` · ${formatTime(visit.visitTime)}` : ''}
        </Text>
        {visit.doctorName ? (
          <Text style={{ fontSize: 13, color: '#6B6866' }}>
            {visit.doctorName}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
};
