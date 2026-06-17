// tests/unit/features/family/family.domain.test.ts
import {
  mapDbPersonToPerson,
  mapDbFamilyGroupToFamilyGroup,
  sortPeopleAlphabetically,
  buildFamilyHomeData,
} from '@/features/family/domain/family.domain';
import { PERSON_COLOURS } from '@/design-system/tokens/colours';

import type { DbPerson, DbFamilyGroup } from '@/shared/types/database';

const makeDbPerson = (overrides: Partial<DbPerson> = {}): DbPerson => ({
  id: 'person-1',
  name: 'Jane Smith',
  family_group_id: 'group-1',
  created_at: '2024-01-01T00:00:00Z',
  dob: null,
  medicare_number: null,
  blood_type: null,
  immunisations_current: null,
  allergies: null,
  diagnoses: null,
  health_fund: null,
  health_fund_number: null,
  emergency_contact: null,
  emergency_phone: null,
  notes: null,
  ...overrides,
});

const makeDbGroup = (overrides: Partial<DbFamilyGroup> = {}): DbFamilyGroup => ({
  id: 'group-1',
  name: 'The Smiths',
  ...overrides,
});

describe('family.domain', () => {
  describe('mapDbPersonToPerson', () => {
    it('maps db person to domain person correctly', () => {
      const result = mapDbPersonToPerson(makeDbPerson(), 0);
      expect(result.id).toBe('person-1');
      expect(result.name).toBe('Jane Smith');
      expect(result.familyGroupId).toBe('group-1');
      expect(result.colourIndex).toBe(0);
      expect(result.initials).toBe('JS');
    });

    it('assigns correct colour set by index', () => {
      const result0 = mapDbPersonToPerson(makeDbPerson(), 0);
      const result1 = mapDbPersonToPerson(makeDbPerson(), 1);
      expect(result0.colourSet).toEqual(PERSON_COLOURS[0]);
      expect(result1.colourSet).toEqual(PERSON_COLOURS[1]);
    });

    it('wraps colour index at the array length', () => {
      const n = PERSON_COLOURS.length;
      const result = mapDbPersonToPerson(makeDbPerson(), n);
      expect(result.colourSet).toEqual(PERSON_COLOURS[0]);
      expect(result.colourIndex).toBe(n);
    });

    it('generates correct initials for single name', () => {
      const result = mapDbPersonToPerson(makeDbPerson({ name: 'Alice' }), 0);
      expect(result.initials).toBe('AL');
    });

    it('generates correct initials for full name', () => {
      const result = mapDbPersonToPerson(makeDbPerson({ name: 'John William Doe' }), 0);
      expect(result.initials).toBe('JD');
    });
  });

  describe('mapDbFamilyGroupToFamilyGroup', () => {
    it('maps db group to domain group', () => {
      const result = mapDbFamilyGroupToFamilyGroup(makeDbGroup());
      expect(result.id).toBe('group-1');
      expect(result.name).toBe('The Smiths');
    });
  });

  describe('sortPeopleAlphabetically', () => {
    it('sorts people alphabetically by name', () => {
      const people = [
        mapDbPersonToPerson(makeDbPerson({ id: '3', name: 'Charlie' }), 0),
        mapDbPersonToPerson(makeDbPerson({ id: '1', name: 'Alice' }), 1),
        mapDbPersonToPerson(makeDbPerson({ id: '2', name: 'Bob' }), 2),
      ];
      const sorted = sortPeopleAlphabetically(people);
      expect(sorted.map((p) => p.name)).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    it('does not mutate the original array', () => {
      const people = [
        mapDbPersonToPerson(makeDbPerson({ name: 'Zara' }), 0),
        mapDbPersonToPerson(makeDbPerson({ name: 'Adam' }), 1),
      ];
      const original = [...people];
      sortPeopleAlphabetically(people);
      expect(people[0]?.name).toBe(original[0]?.name);
    });
  });

  describe('buildFamilyHomeData', () => {
    it('assembles family home data with sorted people and colour indices', () => {
      const dbPeople: DbPerson[] = [
        makeDbPerson({ id: '2', name: 'Bob', family_group_id: 'group-1' }),
        makeDbPerson({ id: '1', name: 'Alice', family_group_id: 'group-1' }),
      ];
      const result = buildFamilyHomeData(makeDbGroup(), dbPeople);

      expect(result.familyGroup.name).toBe('The Smiths');
      expect(result.people).toHaveLength(2);
      // Sorted alphabetically
      expect(result.people[0]?.name).toBe('Alice');
      expect(result.people[1]?.name).toBe('Bob');
      // Colour indices assigned by sorted order
      expect(result.people[0]?.colourIndex).toBe(0);
      expect(result.people[1]?.colourIndex).toBe(1);
    });

    it('handles empty people array', () => {
      const result = buildFamilyHomeData(makeDbGroup(), []);
      expect(result.people).toHaveLength(0);
    });
  });
});
