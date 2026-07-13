// src/features/family/types/family.types.ts
// Domain types for the family feature.
// These are the app-level types — not raw database rows.
// Repositories map DbPerson → Person before returning data.

import type { PersonColourSet } from '@/design-system/tokens/colours';

export interface PersonInfoCard {
  dob: string | null;
  medicareNumber: string | null;
  bloodType: string | null;
  immunisationsCurrent: boolean | null;
  allergies: string | null;
  diagnoses: string | null;
  healthFund: string | null;
  healthFundNumber: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  notes: string | null;
}

export interface Person {
  id: string;
  name: string;
  familyGroupId: string;
  colourSet: PersonColourSet;
  colourIndex: number;
  initials: string;
  infoCard: PersonInfoCard;
}

export interface FamilyGroup {
  id: string;
  name: string;
  storageCapBytes: number;
}

export interface FamilyHomeData {
  familyGroup: FamilyGroup;
  people: Person[];
}
