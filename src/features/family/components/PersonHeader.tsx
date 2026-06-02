// src/features/family/components/PersonHeader.tsx
// Coloured header for the person detail screen.
// Shows avatar, name, and back navigation. No business logic.

import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/design-system/components/Avatar';

import type { Person } from '../types/family.types';

interface PersonHeaderProps {
  person: Person;
  onBack: () => void;
}

export const PersonHeader = ({ person, onBack }: PersonHeaderProps) => {
  const insets = useSafeAreaInsets();
  const { colourSet } = person;

  return (
    <View
      style={{
        backgroundColor: colourSet.bg,
        paddingTop: insets.top + 8,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colourSet.border,
      }}
    >
      {/* Back button */}
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          marginBottom: 16,
          opacity: pressed ? 0.6 : 1,
          alignSelf: 'flex-start',
        })}
      >
        <Text style={{ fontSize: 17, color: colourSet.dot }}>‹</Text>
        <Text style={{ fontSize: 15, color: colourSet.dot, fontWeight: '500' }}>
          Family
        </Text>
      </Pressable>

      {/* Person info */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Avatar initials={person.initials} colourSet={colourSet} size="lg" />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '700',
              color: colourSet.text,
            }}
            numberOfLines={1}
          >
            {person.name}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: colourSet.text,
              opacity: 0.7,
              marginTop: 2,
            }}
          >
            Health Records
          </Text>
        </View>
      </View>
    </View>
  );
};
