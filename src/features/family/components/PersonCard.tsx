// src/features/family/components/PersonCard.tsx
// PersonCard — displays a family member with their colour scheme.
// Tappable — navigates to person detail screen.
// No business logic — purely presentational.

import { View, Text, Pressable } from 'react-native';

import { Avatar } from '@/design-system/components/Avatar';

import type { Person } from '../types/family.types';

interface PersonCardProps {
  person: Person;
  onPress: (personId: string) => void;
}

export const PersonCard = ({ person, onPress }: PersonCardProps) => {
  const { colourSet } = person;

  return (
    <Pressable
      onPress={() => onPress(person.id)}
      accessibilityRole="button"
      accessibilityLabel={`View ${person.name}'s health records`}
      style={({ pressed }) => ({
        backgroundColor: colourSet.bg,
        borderColor: colourSet.border,
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        opacity: pressed ? 0.85 : 1,
        marginBottom: 12,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {/* Avatar */}
        <Avatar
          initials={person.initials}
          colourSet={colourSet}
          size="md"
        />

        {/* Name + chevron */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: '600',
              color: colourSet.text,
            }}
          >
            {person.name}
          </Text>
        </View>

        {/* Chevron */}
        <View
          style={{
            width: 24,
            height: 24,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: colourSet.border, fontSize: 18 }}>›</Text>
        </View>
      </View>
    </Pressable>
  );
};
