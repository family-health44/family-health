// tests/unit/features/medications/medications.domain.test.ts
import {
  mapDbMedicationToMedication,
  groupMedicationsByStatus,
  statusToBadgeVariant,
  statusLabel,
} from '@/features/medications/domain/medications.domain';

import type { DbMedication } from '@/shared/types/database';
import type { Medication } from '@/features/medications/types/medications.types';

const makeDbMedication = (overrides: Partial<DbMedication> = {}): DbMedication => ({
  id: 'med-1',
  name: 'Amoxicillin',
  dosage: '500mg',
  frequency: 'Twice daily',
  reason: 'Ear infection',
  status: 'active',
  start_date: '2024-01-01',
  end_date: null,
  person_id: 'person-1',
  prescribed_by: null,
  family_group_id: 'group-1',
  ...overrides,
});

const makeMedication = (overrides: Partial<Medication> = {}): Medication => ({
  id: 'med-1',
  name: 'Amoxicillin',
  dosage: '500mg',
  frequency: 'Twice daily',
  reason: 'Ear infection',
  status: 'active',
  startDate: '2024-01-01',
  endDate: null,
  personId: 'person-1',
  prescribedBy: null,
  prescribedByName: null,
  familyGroupId: 'group-1',
  ...overrides,
});

describe('medications.domain', () => {
  describe('mapDbMedicationToMedication', () => {
    it('maps correctly', () => {
      const result = mapDbMedicationToMedication(makeDbMedication());
      expect(result.id).toBe('med-1');
      expect(result.name).toBe('Amoxicillin');
      expect(result.status).toBe('active');
      expect(result.startDate).toBe('2024-01-01');
      expect(result.prescribedByName).toBeNull();
    });

    it('includes doctor name when provided', () => {
      const result = mapDbMedicationToMedication(makeDbMedication(), 'Dr. Smith');
      expect(result.prescribedByName).toBe('Dr. Smith');
    });
  });

  describe('groupMedicationsByStatus', () => {
    it('groups medications by status in correct order', () => {
      const medications: Medication[] = [
        makeMedication({ id: '1', status: 'as_needed' }),
        makeMedication({ id: '2', status: 'active' }),
        makeMedication({ id: '3', status: 'inactive' }),
      ];
      const groups = groupMedicationsByStatus(medications);
      expect(groups[0]?.status).toBe('active');
      expect(groups[1]?.status).toBe('as_needed');
      expect(groups[2]?.status).toBe('inactive');
    });

    it('omits empty groups', () => {
      const medications: Medication[] = [
        makeMedication({ status: 'active' }),
      ];
      const groups = groupMedicationsByStatus(medications);
      expect(groups).toHaveLength(1);
      expect(groups[0]?.status).toBe('active');
    });

    it('sorts medications alphabetically within group', () => {
      const medications: Medication[] = [
        makeMedication({ id: '1', name: 'Zinc', status: 'active' }),
        makeMedication({ id: '2', name: 'Aspirin', status: 'active' }),
      ];
      const groups = groupMedicationsByStatus(medications);
      expect(groups[0]?.medications[0]?.name).toBe('Aspirin');
      expect(groups[0]?.medications[1]?.name).toBe('Zinc');
    });

    it('handles empty array', () => {
      expect(groupMedicationsByStatus([])).toEqual([]);
    });
  });

  describe('statusToBadgeVariant', () => {
    it('maps active to success', () => {
      expect(statusToBadgeVariant('active')).toBe('success');
    });
    it('maps inactive to warning', () => {
      expect(statusToBadgeVariant('inactive')).toBe('warning');
    });
    it('maps as_needed to success', () => {
      expect(statusToBadgeVariant('as_needed')).toBe('success');
    });
  });

  describe('statusLabel', () => {
    it('returns correct labels', () => {
      expect(statusLabel('active')).toBe('Active');
      expect(statusLabel('inactive')).toBe('Inactive');
      expect(statusLabel('as_needed')).toBe('As Needed');
    });
  });
});
