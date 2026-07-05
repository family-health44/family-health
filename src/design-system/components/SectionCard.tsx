// src/design-system/components/SectionCard.tsx
// G2 collapsible section: white floating card + coloured accent pill.
// Shared by DoctorDetailScreen (Visits/Notes/Medications) and
// PersonMedicalEventsTab (Diagnosis/Procedure/Illness) so the section
// style lives in one place (no per-screen drift).
import { PressableBase } from './PressableBase';
import { useState } from 'react';
import { View, Text } from 'react-native';

export interface SectionCardTone {
  pillBg: string;
  pillText: string;
}

interface SectionCardProps {
  title: string;
  tone: SectionCardTone;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

export const SectionCard = ({ title, tone, children, defaultCollapsed = false }: SectionCardProps) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  return (
    <View
      style={{
        backgroundColor: 'white',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#17211C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <PressableBase
        onPress={() => setCollapsed((c) => !c)}
        accessibilityRole="button"
        style={(pressed) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <View
          style={{
            backgroundColor: tone.pillBg,
            paddingHorizontal: 11,
            paddingVertical: 4,
            borderRadius: 999,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '600', color: tone.pillText }}>{title}</Text>
        </View>
        <Text style={{ color: '#C8C4BC', fontSize: 13 }}>{collapsed ? '⌄' : '⌃'}</Text>
      </PressableBase>
      {!collapsed && <View style={{ marginTop: 10 }}>{children}</View>}
    </View>
  );
};

// Empty-state row used inside a SectionCard body.
export const SectionEmpty = ({ text }: { text: string }) => (
  <Text style={{ fontSize: 13, color: 'rgba(23,33,28,0.5)', fontStyle: 'italic' }}>{text}</Text>
);
