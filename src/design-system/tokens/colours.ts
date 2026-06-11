// src/design-system/tokens/colours.ts
// Design token constants — single source of truth for all colour values.
// Domain layer may import from here. Components should prefer NativeWind classes.
// These raw values are used for dynamic styling (e.g. person colour assignment,
// doctor specialty colour assignment).
//
// Indices 0–4 are the original person colours (used for person assignment).
// Indices 5–29 extend the palette for doctor specialty colours.
// Person colour assignment only ever uses indices 0–4 (by alphabetical position).
// Doctor specialty colours may use the full 0–29 range.

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

// Ordered array — indices 0-4 used for person colour assignment (alphabetical order).
// Indices 5-29 used for doctor specialty colours only.
export const PERSON_COLOURS: readonly PersonColourSet[] = [
  { bg: '#E6F0EC', border: '#C0D8CA', text: '#1A4D35', dot: '#2A6049' }, // 0 — sage green
  { bg: '#E8EFF8', border: '#C0CFDF', text: '#1A3A6B', dot: '#2C5282' }, // 1 — sky blue
  { bg: '#F5E8EB', border: '#E0BDC4', text: '#7A2030', dot: '#9B3A4A' }, // 2 — dusty rose
  { bg: '#EEE8F7', border: '#D4C4E8', text: '#3D2070', dot: '#5B3A8E' }, // 3 — soft purple
  { bg: '#F5EBE0', border: '#DEBFAA', text: '#7A3A10', dot: '#B56B2A' }, // 4 — warm amber
  { bg: '#E4F2F2', border: '#B0D4D4', text: '#1A4A4A', dot: '#2A7070' }, // 5 — teal
  { bg: '#FAE8E4', border: '#F0C4B8', text: '#7A2C1A', dot: '#B8432A' }, // 6 — coral
  { bg: '#E4F5EC', border: '#A8DCBC', text: '#1A4A30', dot: '#2A7A50' }, // 7 — mint
  { bg: '#EEE8F8', border: '#CEC0F0', text: '#3A1A70', dot: '#5A3AAA' }, // 8 — lavender
  { bg: '#F5EDD8', border: '#DECCAA', text: '#6A4410', dot: '#B07820' }, // 9 — gold
  { bg: '#E8EDF5', border: '#BCC8E0', text: '#1A2860', dot: '#2C4080' }, // 10 — slate blue
  { bg: '#F8E8F0', border: '#ECC0D8', text: '#6A1840', dot: '#9A2860' }, // 11 — dusty pink
  { bg: '#EEF0E0', border: '#CCD0A0', text: '#3A4010', dot: '#5A6018' }, // 12 — olive
  { bg: '#E0F0F8', border: '#A8CDE0', text: '#0A3855', dot: '#1A5C80' }, // 13 — sky teal
  { bg: '#F8E8EC', border: '#EEBCC8', text: '#6A1830', dot: '#A02848' }, // 14 — warm rose
  { bg: '#E0EEEA', border: '#A0CCB8', text: '#0A4028', dot: '#187050' }, // 15 — forest green
  { bg: '#E8EAF8', border: '#B8BEE8', text: '#1E2070', dot: '#3040A0' }, // 16 — periwinkle
  { bg: '#F8EEE4', border: '#EED0B0', text: '#6A3A18', dot: '#A85C28' }, // 17 — peach
  { bg: '#E4EEEC', border: '#B0CCCA', text: '#1A3A38', dot: '#286060' }, // 18 — sage teal
  { bg: '#F0E8F5', border: '#D8B8E8', text: '#4A1A60', dot: '#7A3090' }, // 19 — warm purple
  { bg: '#F5EAE0', border: '#E0C4A0', text: '#602810', dot: '#905020' }, // 20 — burnt orange
  { bg: '#E8ECF8', border: '#B0B8E8', text: '#1A1E68', dot: '#2830A8' }, // 21 — indigo
  { bg: '#E8F0E0', border: '#BED0A0', text: '#2A3C10', dot: '#487020' }, // 22 — fern
  { bg: '#F0E8F0', border: '#D8B8D8', text: '#481848', dot: '#784878' }, // 23 — mauve
  { bg: '#E4EEF8', border: '#A8C4E4', text: '#0E2C60', dot: '#1A4A90' }, // 24 — azure
  { bg: '#E4F0EC', border: '#A8CCC0', text: '#0E3830', dot: '#1A5C50' }, // 25 — deep teal
  { bg: '#EEE4F8', border: '#C8A8E8', text: '#3C0E68', dot: '#6018A8' }, // 26 — lilac
  { bg: '#F5EDE0', border: '#E0C4A4', text: '#643A18', dot: '#9C5C28' }, // 27 — copper
  { bg: '#E0F4EE', border: '#A0D4C0', text: '#0E4030', dot: '#186850' }, // 28 — seafoam
  { bg: '#EAE4F8', border: '#C0A8E8', text: '#30106C', dot: '#5028A8' }, // 29 — violet
] as const;

// Named map for the 5 person colours (explicit lookups — these never change)
export const PERSON_COLOUR_MAP: Readonly<Record<PersonColourKey, PersonColourSet>> = {
  green:  PERSON_COLOURS[0] as PersonColourSet,
  blue:   PERSON_COLOURS[1] as PersonColourSet,
  red:    PERSON_COLOURS[2] as PersonColourSet,
  purple: PERSON_COLOURS[3] as PersonColourSet,
  amber:  PERSON_COLOURS[4] as PersonColourSet,
} as const;

// NativeWind class map — used when dynamic values aren't needed
export const PERSON_COLOUR_CLASSES: Readonly
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
