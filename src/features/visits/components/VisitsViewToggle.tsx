// src/features/visits/components/VisitsViewToggle.tsx
// Toggle bar for switching between list, week, and month views.
import { View, Text, Pressable } from 'react-native';
import type { VisitsViewMode } from '../types/visits.types';

interface VisitsViewToggleProps {
  activeMode: VisitsViewMode;
  onModeChange: (mode: VisitsViewMode) => void;
  /** 'onColour' = translucent treatment for use inside the green header block */
  variant?: 'default' | 'onColour';
}

const MODES: { key: VisitsViewMode; label: string }[] = [
  { key: 'list', label: 'List' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
];

export const VisitsViewToggle = ({ activeMode, onModeChange, variant = 'default' }: VisitsViewToggleProps) => {
  const onColour = variant === 'onColour';
  return (
  <View style={{
    flexDirection: 'row',
    backgroundColor: onColour ? 'rgba(255,255,255,0.16)' : '#ECEBE5',
    borderRadius: 10,
    padding: 3,
    marginHorizontal: onColour ? 0 : 16,
    marginTop: onColour ? 12 : 0,
    marginBottom: onColour ? 0 : 8,
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
            color: isActive ? '#1F5C41' : onColour ? 'rgba(255,255,255,0.75)' : 'rgba(23,33,28,0.55)',
          }}>
            {mode.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
  );
};
