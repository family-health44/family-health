// src/features/visits/components/VisitsViewToggle.tsx
// Toggle bar for switching between list, week, and month views.

import { View, Text, Pressable } from 'react-native';

import type { VisitsViewMode } from '../types/visits.types';

interface VisitsViewToggleProps {
  activeMode: VisitsViewMode;
  onModeChange: (mode: VisitsViewMode) => void;
}

const MODES: { key: VisitsViewMode; label: string }[] = [
  { key: 'list', label: 'List' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
];

export const VisitsViewToggle = ({ activeMode, onModeChange }: VisitsViewToggleProps) => (
  <View style={{
    flexDirection: 'row',
    backgroundColor: '#EEECE8',
    borderRadius: 10,
    padding: 3,
    marginHorizontal: 16,
    marginBottom: 12,
  }}>
    {MODES.map((mode) => {
      const isActive = mode.key === activeMode;
      return (
        <Pressable
          key={mode.key}
          onPress={() => onModeChange(mode.key)}
          accessibilityRole="tab"
          accessibilityState={{ selected: isActive }}
          style={{
            flex: 1,
            paddingVertical: 7,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor: isActive ? '#FFFFFF' : 'transparent',
          }}
        >
          <Text style={{
            fontSize: 13,
            fontWeight: isActive ? '600' : '400',
            color: isActive ? '#1A1A1A' : '#6B6866',
          }}>
            {mode.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);
