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
  { bg: '#F3E4E2', border: '#DCAFA8', text: '#71291E', dot: '#A93E2D' }, // 5 — red
  { bg: '#E2EDF3', border: '#A8CADC', text: '#1E5571', dot: '#2D80A9' }, // 6 — cyan blue
  { bg: '#F3EFE2', border: '#DCCFA8', text: '#715C1E', dot: '#A98A2D' }, // 7 — gold
  { bg: '#EDE2F3', border: '#CAA8DC', text: '#551E71', dot: '#802DA9' }, // 8 — violet
  { bg: '#E2F3EB', border: '#A8DCC2', text: '#1E7147', dot: '#2DA96B' }, // 9 — emerald
  { bg: '#F3E2EB', border: '#DCA8C2', text: '#711E47', dot: '#A92D6B' }, // 10 — magenta pink
  { bg: '#E3EFF2', border: '#ACD0D8', text: '#245F6B', dot: '#368EA0' }, // 11 — teal
  { bg: '#F3E9E2', border: '#DCBEA8', text: '#71401E', dot: '#A9612D' }, // 12 — burnt orange
  { bg: '#E6E2F3', border: '#B5A8DC', text: '#331E71', dot: '#4C2DA9' }, // 13 — indigo
  { bg: '#E9F3E2', border: '#BEDCA8', text: '#40711E', dot: '#61A92D' }, // 14 — olive lime
  { bg: '#F2E3F0', border: '#D9ABD1', text: '#6D2260', dot: '#A33390' }, // 15 — purple magenta
  { bg: '#E2F3F0', border: '#A8DCD3', text: '#1E7163', dot: '#2DA995' }, // 16 — spring green
  { bg: '#F2E3E6', border: '#D8ACB3', text: '#6B2430', dot: '#A03648' }, // 17 — rose
  { bg: '#E3E8F2', border: '#ABBAD9', text: '#223B6D', dot: '#3358A3' }, // 18 — blue
  { bg: '#F0F3E2', border: '#D3DCA8', text: '#63711E', dot: '#95A92D' }, // 19 — chartreuse
  { bg: '#EFE4F1', border: '#D0ADD6', text: '#5D2669', dot: '#8C399D' }, // 20 — amethyst
  { bg: '#E3F2E6', border: '#ACD8B3', text: '#246B30', dot: '#36A048' }, // 21 — green
  { bg: '#F2E7E3', border: '#D8B7AC', text: '#6B3624', dot: '#A05136' }, // 22 — terracotta
  { bg: '#E4E5F1', border: '#AFB2D5', text: '#282E66', dot: '#3D449A' }, // 23 — periwinkle
  { bg: '#F2F1E3', border: '#D8D4AC', text: '#6B6524', dot: '#A09736' }, // 24 — mustard
  { bg: '#EAE5F1', border: '#BFB0D4', text: '#432A64', dot: '#644097' }, // 25 — slate violet
  { bg: '#E7F1E5', border: '#B6D4B0', text: '#34642A', dot: '#4E9740' }, // 26 — moss
  { bg: '#F1E5E9', border: '#D4B0BC', text: '#642A3E', dot: '#97405D' }, // 27 — dusty rose
  { bg: '#E5F1F1', border: '#B0D4D4', text: '#2A6464', dot: '#409797' }, // 28 — muted teal
  { bg: '#F1ECE5', border: '#D4C5B0', text: '#644C2A', dot: '#977240' }, // 29 — ochre
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
