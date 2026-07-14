import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import type { Person } from '../types/family.types';
import { Icon } from '@/design-system/components/Icon';
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
      accessibilityLabel={`View ${person.name}'s records`}
      style={{
        backgroundColor: pressed ? '#F0EFEA' : '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#17211C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colourSet.dot, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>{person.initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#17211C' }}>
            {person.name}
          </Text>
        </View>
        <Icon name="chevron.right" size={15} color="rgba(23,33,28,0.4)" />
      </View>
    </Pressable>
  );
};
