// src/design-system/components/SectionCard.tsx
// G2 collapsible section: white floating card + coloured accent pill.
// Shared by DoctorDetailScreen (Visits/Notes/Medications) and
// PersonMedicalEventsTab (Diagnosis/Procedure/Illness) so the section
// style lives in one place (no per-screen drift).
import { PressableBase } from './PressableBase';
import { useState } from 'react';
import { View, Text } from 'react-native';
import { Type, TextColour, Shadow } from '@/design-system/tokens/typography';

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
        ...Shadow.resting,
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
          <Text style={{ ...Type.caption, fontWeight: '600', color: tone.pillText }}>{title}</Text>
        </View>
        <Text style={{ color: '#C8C4BC', ...Type.label, fontWeight: '400' }}>{collapsed ? '⌄' : '⌃'}</Text>
      </PressableBase>
      {!collapsed && <View style={{ marginTop: 10 }}>{children}</View>}
    </View>
  );
};

// Empty-state row used inside a SectionCard body.
export const SectionEmpty = ({ text }: { text: string }) => (
  <Text style={{ ...Type.label, fontWeight: '400', color: TextColour.muted, fontStyle: 'italic' }}>{text}</Text>
);
