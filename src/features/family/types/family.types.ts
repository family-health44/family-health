// src/features/family/types/family.types.ts
// Domain types for the family feature.
// These are the app-level types — not raw database rows.
// Repositories map DbPerson → Person before returning data.

import type { PersonColourSet } from '@/design-system/tokens/colours';

export interface Person {
  id: string;
  name: string;
  familyGroupId: string;
  colourSet: PersonColourSet;
  colourIndex: number;
  initials: string;
}

export interface FamilyGroup {
  id: string;
  name: string;
}

export interface FamilyHomeData {
  familyGroup: FamilyGroup;
  people: Person[];
}
