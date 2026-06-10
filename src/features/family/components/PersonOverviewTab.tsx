// src/features/family/components/PersonOverviewTab.tsx
// Overview tab — summary tiles + notes section.
// Notes section is self-contained — fetches its own data.

import { PressableBase } from '@/design-system/components/PressableBase';
import { View, Text, Pressable, ScrollView } from 'react-native';

import { PersonNotesSection } from '@/features/notes/components/PersonNotesSection';

import type { PersonColourSet } from '@/design-system/tokens/colours';
import type { PersonTab } from '../types/person.types';

interface OverviewTileProps {
  label: string;
  count: number;
  colourSet: PersonColourSet;
  onPress: () => void;
}

const OverviewTile = ({ label, count, colourSet, onPress }: OverviewTileProps) => (
  <PressableBase
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`View ${label}`}
    style={(pressed) => ({
      flex: 1,
      backgroundColor: pressed ? colourSet.border : '#FFFFFF',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colourSet.border,
      padding: 16,
      alignItems: 'flex-start',
      minHeight: 88,
      justifyContent: 'space-between',
    })}
  >
    <Text style={{ fontSize: 28, fontWeight: '700', color: colourSet.dot }}>
      {count}
    </Text>
    <Text style={{ fontSize: 13, fontWeight: '500', color: colourSet.text, opacity: 0.8 }}>
      {label}
    </Text>
  </PressableBase>
);

interface PersonOverviewTabProps {
  personId: string;
  colourSet: PersonColourSet;
  onNavigate: (tab: PersonTab) => void;
}

export const PersonOverviewTab = ({ personId, colourSet, onNavigate }: PersonOverviewTabProps) => (
  <ScrollView showsVerticalScrollIndicator={false}>
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{
        fontSize: 13, fontWeight: '600', color: '#6B6866',
        textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4,
      }}>
        Summary
      </Text>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <OverviewTile label="Doctors" count={0} colourSet={colourSet} onPress={() => onNavigate('doctors')} />
        <OverviewTile label="Medications" count={0} colourSet={colourSet} onPress={() => onNavigate('medications')} />
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <OverviewTile label="Medical Events" count={0} colourSet={colourSet} onPress={() => onNavigate('medical-events')} />
        <View style={{ flex: 1 }} />
      </View>
    </View>

    {/* Notes section — self-contained */}
    <PersonNotesSection personId={personId} colourSet={colourSet} />
  </ScrollView>
);
