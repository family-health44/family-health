// src/features/doctors/components/DoctorCard.tsx
// Doctor card — shows name, type badge, phone and address.
// Used in both the person doctors tab and the main doctors screen.

import { View, Text, Pressable, Linking, Alert } from 'react-native';

import { Badge } from '@/design-system/components/Badge';
import { formatPhone } from '../domain/doctors.domain';

import type { Doctor } from '../types/doctors.types';
import type { PersonColourSet } from '@/design-system/tokens/colours';

interface DoctorCardProps {
  doctor: Doctor;
  colourSet?: PersonColourSet;
  onPress?: (doctorId: string) => void;
  onUnlink?: (doctorId: string) => void;
}

export const DoctorCard = ({ doctor, colourSet, onPress, onUnlink }: DoctorCardProps) => {
  const handlePhonePress = async () => {
    const url = `tel:${doctor.phone}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Cannot make call', 'Phone calls are not supported on this device.');
    }
  };

  const handleUnlink = () => {
    Alert.alert(
      'Remove doctor',
      `Remove ${doctor.name} from this person's doctors?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onUnlink?.(doctor.id),
        },
      ],
    );
  };

  const cardStyle = colourSet
    ? {
        backgroundColor: colourSet.bg,
        borderColor: colourSet.border,
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
      }
    : {
        backgroundColor: '#FFFFFF',
        borderColor: '#E8E4DC',
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
      };

  return (
    <Pressable
      onPress={() => onPress?.(doctor.id)}
      style={({ pressed }) => ({ ...cardStyle, opacity: pressed ? 0.85 : 1 })}
      accessibilityRole="button"
      accessibilityLabel={`${doctor.name}, ${doctor.type ?? 'Doctor'}`}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: 6 }}>
          {/* Name */}
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1A1A1A' }}>
            {doctor.name}
          </Text>

          {/* Type badge */}
          {doctor.type ? (
            <Badge label={doctor.type} variant="info" />
          ) : null}

          {/* Phone */}
          {doctor.phone ? (
            <Pressable onPress={handlePhonePress} accessibilityRole="link">
              <Text style={{ fontSize: 14, color: '#2A6049', marginTop: 2 }}>
                📞 {formatPhone(doctor.phone)}
              </Text>
            </Pressable>
          ) : null}

          {/* Address */}
          {doctor.address ? (
            <Text style={{ fontSize: 13, color: '#6B6866', marginTop: 2 }} numberOfLines={2}>
              📍 {doctor.address}
            </Text>
          ) : null}
        </View>

        {/* Unlink button */}
        {onUnlink ? (
          <Pressable
            onPress={handleUnlink}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${doctor.name}`}
            style={({ pressed }) => ({
              padding: 6,
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <Text style={{ fontSize: 18, color: '#9B3A4A' }}>×</Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
};
