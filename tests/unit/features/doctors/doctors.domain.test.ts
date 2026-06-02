// tests/unit/features/doctors/doctors.domain.test.ts
import {
  mapDbDoctorToDoctor,
  groupDoctorsByType,
  filterDoctorsByPerson,
  formatPhone,
} from '@/features/doctors/domain/doctors.domain';

import type { DbDoctor } from '@/shared/types/database';
import type { Doctor } from '@/features/doctors/types/doctors.types';

const makeDbDoctor = (overrides: Partial<DbDoctor> = {}): DbDoctor => ({
  id: 'doc-1',
  name: 'Dr. Jane Smith',
  type: 'GP',
  address: '123 Main St',
  phone: '0212345678',
  family_group_id: 'group-1',
  ...overrides,
});

const makeDoctor = (overrides: Partial<Doctor> = {}): Doctor => ({
  id: 'doc-1',
  name: 'Dr. Jane Smith',
  type: 'GP',
  address: '123 Main St',
  phone: '0212345678',
  familyGroupId: 'group-1',
  ...overrides,
});

describe('doctors.domain', () => {
  describe('mapDbDoctorToDoctor', () => {
    it('maps correctly', () => {
      const result = mapDbDoctorToDoctor(makeDbDoctor());
      expect(result.id).toBe('doc-1');
      expect(result.name).toBe('Dr. Jane Smith');
      expect(result.type).toBe('GP');
      expect(result.familyGroupId).toBe('group-1');
    });

    it('handles null type', () => {
      const result = mapDbDoctorToDoctor(makeDbDoctor({ type: null }));
      expect(result.type).toBeNull();
    });
  });

  describe('groupDoctorsByType', () => {
    it('groups doctors by type alphabetically', () => {
      const doctors: Doctor[] = [
        makeDoctor({ id: '1', name: 'Dr. B', type: 'Specialist' }),
        makeDoctor({ id: '2', name: 'Dr. A', type: 'GP' }),
        makeDoctor({ id: '3', name: 'Dr. C', type: 'Specialist' }),
      ];
      const groups = groupDoctorsByType(doctors);
      expect(groups).toHaveLength(2);
      expect(groups[0]?.type).toBe('GP');
      expect(groups[1]?.type).toBe('Specialist');
      expect(groups[1]?.doctors).toHaveLength(2);
    });

    it('puts null type doctors in Other group at end', () => {
      const doctors: Doctor[] = [
        makeDoctor({ id: '1', type: 'GP' }),
        makeDoctor({ id: '2', name: 'Dr. X', type: null }),
      ];
      const groups = groupDoctorsByType(doctors);
      expect(groups[groups.length - 1]?.type).toBe('Other');
    });

    it('sorts doctors alphabetically within each group', () => {
      const doctors: Doctor[] = [
        makeDoctor({ id: '1', name: 'Dr. Zara', type: 'GP' }),
        makeDoctor({ id: '2', name: 'Dr. Adam', type: 'GP' }),
      ];
      const groups = groupDoctorsByType(doctors);
      expect(groups[0]?.doctors[0]?.name).toBe('Dr. Adam');
      expect(groups[0]?.doctors[1]?.name).toBe('Dr. Zara');
    });

    it('handles empty array', () => {
      expect(groupDoctorsByType([])).toEqual([]);
    });
  });

  describe('filterDoctorsByPerson', () => {
    it('filters to only person-assigned doctors', () => {
      const doctors: Doctor[] = [
        makeDoctor({ id: 'doc-1' }),
        makeDoctor({ id: 'doc-2', name: 'Dr. Other' }),
      ];
      const result = filterDoctorsByPerson(doctors, ['doc-1']);
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('doc-1');
    });

    it('returns empty array when no ids match', () => {
      const doctors: Doctor[] = [makeDoctor({ id: 'doc-1' })];
      expect(filterDoctorsByPerson(doctors, ['doc-99'])).toHaveLength(0);
    });
  });

  describe('formatPhone', () => {
    it('formats 10 digit Australian number', () => {
      expect(formatPhone('0212345678')).toBe('(02) 1234 5678');
    });

    it('returns original string if not 10 digits', () => {
      expect(formatPhone('+61 2 1234 5678')).toBe('+61 2 1234 5678');
    });

    it('handles already formatted numbers', () => {
      expect(formatPhone('(02) 1234 5678')).toBe('(02) 1234 5678');
    });
  });
});
