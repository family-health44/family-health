// src/design-system/components/Card.tsx
// Card primitive — base container used for person cards, visit cards, etc.
// Supports optional person colour theming via colourSet prop.
// No business logic — purely presentational.

import { PressableBase } from "@/design-system/components/PressableBase";
import { View, Pressable, type ViewProps, type PressableProps } from 'react-native';

import type { PersonColourSet } from '@/design-system/tokens/colours';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardProps extends ViewProps {
  children: React.ReactNode;
  // When provided, applies the person's colour scheme to the card
  colourSet?: PersonColourSet;
}

import type { PressableBaseProps } from "@/design-system/components/PressableBase";
interface PressableCardProps extends Omit<PressableBaseProps, 'style'> {
  children: React.ReactNode;
  colourSet?: PersonColourSet;
}

// ─── Static card ─────────────────────────────────────────────────────────────

export const Card = ({ children, colourSet, style, ...viewProps }: CardProps) => {
  if (colourSet) {
    return (
      <View
        style={[
          {
            backgroundColor: colourSet.bg,
            borderColor: colourSet.border,
            borderWidth: 1,
            borderRadius: 16,
            padding: 16,
          },
          style,
        ]}
        {...viewProps}
      >
        {children}
      </View>
    );
  }

  return (
    <View
      style={[
        {
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 16,
          shadowColor: '#17211C',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        },
        style,
      ]}
      {...viewProps}
    >
      {children}
    </View>
  );
};

// ─── Pressable card ───────────────────────────────────────────────────────────

export const PressableCard = ({
  children,
  colourSet,
  ...pressableProps
}: PressableCardProps) => {
  if (colourSet) {
    return (
      <PressableBase
        style={(pressed) => ({
          backgroundColor: colourSet.bg,
          borderColor: colourSet.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 16,
          opacity: pressed ? 0.85 : 1,
        })}
        accessibilityRole="button"
        {...pressableProps}
      >
        {children}
      </PressableBase>
    );
  }

  return (
    <PressableBase
      style={(pressed) => ({
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#17211C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        opacity: pressed ? 0.85 : 1,
      })}
      accessibilityRole="button" 
      {...pressableProps}
    >
      {children}
    </PressableBase>
  );
};
