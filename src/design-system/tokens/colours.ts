// src/design-system/tokens/colours.ts
// Design token constants — single source of truth for all colour values.
// Domain layer may import from here. Components should prefer NativeWind classes.
// These raw values are used for dynamic styling (e.g. person colour assignment).
export const AppColours = {
  background: '#F7F5F0',
} as const;

export type PersonColourKey = 'green' | 'blue' | 'red' | 'purple' | 'amber';

export interface PersonColourSet {
  readonly bg: string;
  readonly border: string;
  readonly text: string;
  readonly dot: string;
}

// Ordered array — index matches person order in family group (0-based)
export const PERSON_COLOURS: readonly PersonColourSet[] = [
  { bg: '#E6F0EC', border: '#C0D8CA', text: '#1A4D35', dot: '#2A6049' }, // 0 — green
  { bg: '#E8EFF8', border: '#C0CFDF', text: '#1A3A6B', dot: '#2C5282' }, // 1 — blue
  { bg: '#F5E8EB', border: '#E0BDC4', text: '#7A2030', dot: '#9B3A4A' }, // 2 — red
  { bg: '#EEE8F7', border: '#D4C4E8', text: '#3D2070', dot: '#5B3A8E' }, // 3 — purple
  { bg: '#F5EBE0', border: '#DEBFAA', text: '#7A3A10', dot: '#B56B2A' }, // 4 — amber
] as const;

// Named map for explicit lookups
export const PERSON_COLOUR_MAP: Readonly<Record<PersonColourKey, PersonColourSet>> = {
  green:  PERSON_COLOURS[0] as PersonColourSet,
  blue:   PERSON_COLOURS[1] as PersonColourSet,
  red:    PERSON_COLOURS[2] as PersonColourSet,
  purple: PERSON_COLOURS[3] as PersonColourSet,
  amber:  PERSON_COLOURS[4] as PersonColourSet,
} as const;

// NativeWind class map — used when dynamic values aren't needed
export const PERSON_COLOUR_CLASSES: Readonly<
  Record<PersonColourKey, { bg: string; border: string; text: string; dot: string }>
> = {
  green: {
    bg: 'bg-person-green-bg',
    border: 'border-person-green-border',
    text: 'text-person-green-text',
    dot: 'bg-person-green-dot',
  },
  blue: {
    bg: 'bg-person-blue-bg',
    border: 'border-person-blue-border',
    text: 'text-person-blue-text',
    dot: 'bg-person-blue-dot',
  },
  red: {
    bg: 'bg-person-red-bg',
    border: 'border-person-red-border',
    text: 'text-person-red-text',
    dot: 'bg-person-red-dot',
  },
  purple: {
    bg: 'bg-person-purple-bg',
    border: 'border-person-purple-border',
    text: 'text-person-purple-text',
    dot: 'bg-person-purple-dot',
  },
  amber: {
    bg: 'bg-person-amber-bg',
    border: 'border-person-amber-border',
    text: 'text-person-amber-text',
    dot: 'bg-person-amber-dot',
  },
} as const;