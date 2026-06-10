// src/features/doctors/components/DoctorCard.tsx
// Doctor card — coloured card with initials avatar and specialty pill.
// Uses person's colourSet directly if provided, otherwise falls back to index.
import { PressableBase } from '@/design-system/components/PressableBase';
import { View, Text, Alert } from 'react-native';
import { PERSON_COLOURS } from '@/design-system/tokens/colours';
import type { PersonColourSet } from '@/design-system/tokens/colours';
import type { Doctor } from '../types/doctors.types';

interface DoctorCardProps {
  doctor: Doctor;
  colourSet?: PersonColourSet;
  colourIndex?: number;
  onPress?: (doctorId: string) => void;
  onUnlink?: (doctorId: string) => void;
}

export const DoctorCard = ({ doctor, colourSet: colourSetProp, colourIndex = 0, onPress, onUnlink }: DoctorCardProps) => {
  const colourSet = colourSetProp ?? PERSON_COLOURS[colourIndex % PERSON_COLOURS.length] ?? PERSON_COLOURS[0];

  const initials = doctor.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleUnlink = () => {
    Alert.alert(
      'Remove doctor',
      `Remove ${doctor.name} from this person's doctors?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onUnlink?.(doctor.id) },
      ],
    );
  };

  return (
    <PressableBase
      onPress={() => onPress?.(doctor.id)}
      accessibilityRole="button"
      accessibilityLabel={`${doctor.name}, ${doctor.type ?? 'Doctor'}`}
      style={(pressed) => ({
        backgroundColor: colourSet?.bg,
        borderColor: colourSet?.border,
        borderWidth: 1.5,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: colourSet?.dot, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Text style={{ color: 'white', fontSize: 14, fontWeight: '700' }}>{initials}</Text>
      </View>
      <View style={{ flex: 1, gap: 5 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: colourSet?.text }}>{doctor.name}</Text>
        {doctor.type ? (
          <View style={{ alignSelf: 'flex-start', backgroundColor: colourSet?.border, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: colourSet?.text }}>{doctor.type}</Text>
          </View>
        ) : null}
      </View>
      {onUnlink ? (
        <PressableBase onPress={handleUnlink} accessibilityRole="button" accessibilityLabel={`Remove ${doctor.name}`} style={(pressed) => ({ padding: 6, opacity: pressed ? 0.5 : 1 })}>
          <Text style={{ fontSize: 18, color: '#9B3A4A' }}>×</Text>
        </PressableBase>
      ) : (
        <Text style={{ color: colourSet?.border, fontSize: 16 }}>›</Text>
      )}
    </PressableBase>
  );
};
