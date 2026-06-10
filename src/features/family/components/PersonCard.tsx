import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Avatar } from '@/design-system/components/Avatar';
import type { Person } from '../types/family.types';
interface PersonCardProps {
  person: Person;
  onPress: (personId: string) => void;
}
export const PersonCard = ({ person, onPress }: PersonCardProps) => {
  const { colourSet } = person;
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={() => onPress(person.id)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={`View ${person.name}'s health records`}
      style={{
        backgroundColor: pressed ? colourSet.border : colourSet.bg,
        borderColor: colourSet.border,
        borderWidth: 1.5,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar initials={person.initials} colourSet={colourSet} size="md" />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: '600', color: colourSet.text }}>
            {person.name}
          </Text>
        </View>
        <Text style={{ color: colourSet.border, fontSize: 18 }}>›</Text>
      </View>
    </Pressable>
  );
};
