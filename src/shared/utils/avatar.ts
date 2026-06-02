// src/shared/utils/avatar.ts
// Pure utility — assigns person colour set by index (0-based).
// Wraps around if there are more than 5 people.
// Domain layer safe — no external imports.

import { PERSON_COLOURS } from '@/design-system/tokens/colours';
import type { PersonColourSet } from '@/design-system/tokens/colours';

// Returns the colour set for a person at the given index.
// Wraps: index 5 → same as index 0, etc.
export function getPersonColour(index: number): PersonColourSet {
  const colour = PERSON_COLOURS[index % PERSON_COLOURS.length];
  // PERSON_COLOURS always has 5 entries and index % 5 is always 0–4
  // so this is always defined — but we guard for TypeScript strict mode
  if (!colour) {
    return PERSON_COLOURS[0] as PersonColourSet;
  }
  return colour;
}
