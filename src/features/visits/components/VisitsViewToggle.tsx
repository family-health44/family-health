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
    backgroundColor: '#EEEAE3',
    borderRadius: 10,
    padding: 3,
    marginHorizontal: 16,
    marginBottom: 8,
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
            paddingVertical: 6,
            borderRadius: 7,
            alignItems: 'center',
            backgroundColor: isActive ? '#FFFFFF' : 'transparent',
            shadowColor: isActive ? '#000' : 'transparent',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isActive ? 0.08 : 0,
            shadowRadius: 2,
            elevation: isActive ? 1 : 0,
          }}
        >
          <Text style={{
            fontSize: 12,
            fontWeight: isActive ? '700' : '600',
            color: isActive ? '#2A6049' : '#A8A09A',
          }}>
            {mode.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);
