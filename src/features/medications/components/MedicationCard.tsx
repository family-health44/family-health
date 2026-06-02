// src/features/medications/components/MedicationCard.tsx
// Medication card — name, dosage, frequency, reason, prescribed by, status badge.
// Status can be toggled active ↔ inactive directly from the card.

import { View, Text, Pressable } from 'react-native';

import { Badge } from '@/design-system/components/Badge';
import { formatDate } from '@/shared/utils/dates';
import { statusToBadgeVariant, statusLabel } from '../domain/medications.domain';

import type { Medication, MedicationStatus } from '../types/medications.types';
import type { PersonColourSet } from '@/design-system/tokens/colours';

interface MedicationCardProps {
  medication: Medication;
  colourSet?: PersonColourSet;
  onStatusToggle?: (medicationId: string, newStatus: MedicationStatus) => void;
  onPress?: (medicationId: string) => void;
}

export const MedicationCard = ({
  medication,
  colourSet,
  onStatusToggle,
  onPress,
}: MedicationCardProps) => {
  const cardStyle = colourSet
    ? { backgroundColor: colourSet.bg, borderColor: colourSet.border }
    : { backgroundColor: '#FFFFFF', borderColor: '#E8E4DC' };

  const handleStatusToggle = () => {
    if (!onStatusToggle) return;
    const newStatus: MedicationStatus =
      medication.status === 'active' ? 'inactive' : 'active';
    onStatusToggle(medication.id, newStatus);
  };

  return (
    <Pressable
      onPress={() => onPress?.(medication.id)}
      style={({ pressed }) => ({
        ...cardStyle,
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        opacity: pressed ? 0.85 : 1,
      })}
      accessibilityRole="button"
      accessibilityLabel={`${medication.name}, ${statusLabel(medication.status)}`}
    >
      {/* Header row */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1A1A1A' }}>
            {medication.name}
          </Text>
          {medication.dosage ? (
            <Text style={{ fontSize: 14, color: '#4A4744', marginTop: 2 }}>
              {medication.dosage}
              {medication.frequency ? ` · ${medication.frequency}` : ''}
            </Text>
          ) : null}
        </View>

        {/* Status badge — tappable to toggle active/inactive */}
        {medication.status !== 'completed' && onStatusToggle ? (
          <Pressable
            onPress={handleStatusToggle}
            accessibilityRole="button"
            accessibilityLabel={`Mark as ${medication.status === 'active' ? 'inactive' : 'active'}`}
            hitSlop={8}
          >
            <Badge
              label={statusLabel(medication.status)}
              variant={statusToBadgeVariant(medication.status)}
            />
          </Pressable>
        ) : (
          <Badge
            label={statusLabel(medication.status)}
            variant={statusToBadgeVariant(medication.status)}
          />
        )}
      </View>

      {/* Detail rows */}
      <View style={{ marginTop: 8, gap: 4 }}>
        {medication.reason ? (
          <Text style={{ fontSize: 13, color: '#6B6866' }}>
            Reason: {medication.reason}
          </Text>
        ) : null}

        {medication.prescribedByName ? (
          <Text style={{ fontSize: 13, color: '#6B6866' }}>
            Prescribed by: {medication.prescribedByName}
          </Text>
        ) : null}

        {medication.startDate ? (
          <Text style={{ fontSize: 13, color: '#6B6866' }}>
            Started: {formatDate(medication.startDate)}
            {medication.endDate ? ` · Ended: ${formatDate(medication.endDate)}` : ''}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
};
