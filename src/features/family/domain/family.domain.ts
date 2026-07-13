// src/features/family/domain/family.domain.ts
// Pure domain logic — zero external imports.
// Transforms raw database rows into typed domain objects.
// Handles colour assignment, initials, and sorting.

import { PERSON_COLOURS } from '@/design-system/tokens/colours';
import { getInitials } from '@/shared/utils/initials';
import { getPersonColour } from '@/shared/utils/avatar';
import { sortPeopleByCreation } from '@/shared/utils/personOrder';

import type { DbPerson, DbFamilyGroup } from '@/shared/types/database';
import type { Person, FamilyGroup, FamilyHomeData } from '../types/family.types';

// Maps a raw DbPerson to a domain Person.
// colourIndex is the person's position in the family (0-based) — determines colour.
export function mapDbPersonToPerson(dbPerson: DbPerson, colourIndex: number): Person {
  return {
    id: dbPerson.id,
    name: dbPerson.name,
    familyGroupId: dbPerson.family_group_id,
    colourSet: getPersonColour(colourIndex),
    colourIndex,
    initials: getInitials(dbPerson.name),
    infoCard: {
      dob: dbPerson.dob,
      medicareNumber: dbPerson.medicare_number,
      bloodType: dbPerson.blood_type,
      immunisationsCurrent: dbPerson.immunisations_current,
      allergies: dbPerson.allergies,
      diagnoses: dbPerson.diagnoses,
      healthFund: dbPerson.health_fund,
      healthFundNumber: dbPerson.health_fund_number,
      emergencyContact: dbPerson.emergency_contact,
      emergencyPhone: dbPerson.emergency_phone,
      notes: dbPerson.notes,
    },
  };
}

export function mapDbFamilyGroupToFamilyGroup(dbGroup: DbFamilyGroup): FamilyGroup {
  return {
    id: dbGroup.id,
    name: dbGroup.name,
    storageCapBytes: dbGroup.storage_cap_bytes,
  };
}

// Sorts people alphabetically by name.
export function sortPeopleAlphabetically(people: Person[]): Person[] {
  return [...people].sort((a, b) => a.name.localeCompare(b.name));
}

// Assembles FamilyHomeData from raw db rows.
// People are sorted alphabetically then assigned colours by sorted order.
export function buildFamilyHomeData(
  dbGroup: DbFamilyGroup,
  dbPeople: DbPerson[],
): FamilyHomeData {
  const sorted = sortPeopleByCreation(dbPeople);
  const people = sorted.map((p, index) => mapDbPersonToPerson(p, index));

  return {
    familyGroup: mapDbFamilyGroupToFamilyGroup(dbGroup),
    people,
  };
}

// Returns the total number of colour slots available
export function getColourCount(): number {
  return PERSON_COLOURS.length;
}
