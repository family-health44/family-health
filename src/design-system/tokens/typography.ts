// src/design-system/tokens/typography.ts
// Type scale, text-colour roles, and shadow elevation — single source of truth.
// Refactoring-UI aligned: fixed scale, no ad-hoc sizes; 3 text roles; 3 shadow levels.

import type { TextStyle, ViewStyle } from 'react-native';

export const Type = {
  display: { fontSize: 28, fontWeight: '600' },
  title:   { fontSize: 22, fontWeight: '700' },
  heading: { fontSize: 17, fontWeight: '600' },
  body:    { fontSize: 15, fontWeight: '400' },
  label:   { fontSize: 13, fontWeight: '600' },
  caption: { fontSize: 12, fontWeight: '500' },
  micro:   { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
} as const satisfies Record<string, TextStyle>;

export const TextColour = {
  ink:       '#17211C',
  secondary: 'rgba(23,33,28,0.65)',
  muted:     'rgba(23,33,28,0.55)',
  faint:     'rgba(23,33,28,0.40)',
} as const;

export const Shadow = {
  resting: {
    shadowColor: '#17211C', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  raised: {
    shadowColor: '#17211C', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 12, elevation: 6,
  },
  modal: {
    shadowColor: '#17211C', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18, shadowRadius: 24, elevation: 12,
  },
} as const satisfies Record<string, ViewStyle>;
