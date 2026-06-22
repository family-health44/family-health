// tests/unit/features/medication-logs/medication-logs.domain.test.ts
import {
  mapDbMedicationLogToLog,
  sortLogsNewestFirst,
  computeLogStats,
  FEELING_CONFIG,
} from '@/features/medication-logs/domain/medication-logs.domain';

import type { DbMedicationLog } from '@/shared/types/database';
import type { MedicationLog } from '@/features/medication-logs/types/medication-logs.types';

const makeDbLog = (overrides: Partial<DbMedicationLog> = {}): DbMedicationLog => ({
  id: 'log-1',
  medication_id: 'med-1',
  person_id: 'person-1',
  family_group_id: 'group-1',
  logged_date: '2026-06-01',
  logged_time: '08:00:00',
  feeling: 4,
  dose_status: 'taken',
  note: 'Felt fine',
  tags: ['good sleep'],
  created_at: '2026-06-01T08:00:00Z',
  ...overrides,
});

const makeLog = (overrides: Partial<MedicationLog> = {}): MedicationLog => ({
  id: 'log-1',
  medicationId: 'med-1',
  personId: 'person-1',
  familyGroupId: 'group-1',
  loggedDate: '2026-06-01',
  loggedTime: '08:00:00',
  feeling: 4,
  doseStatus: 'taken',
  note: null,
  tags: [],
  createdAt: '2026-06-01T08:00:00Z',
  ...overrides,
});

describe('medication-logs.domain', () => {
  describe('mapDbMedicationLogToLog', () => {
    it('maps fields correctly', () => {
      const r = mapDbMedicationLogToLog(makeDbLog());
      expect(r.medicationId).toBe('med-1');
      expect(r.feeling).toBe(4);
      expect(r.doseStatus).toBe('taken');
      expect(r.tags).toEqual(['good sleep']);
    });

    it('coerces null tags to empty array', () => {
      expect(mapDbMedicationLogToLog(makeDbLog({ tags: null })).tags).toEqual([]);
    });

    it('drops out-of-range feeling to null', () => {
      expect(mapDbMedicationLogToLog(makeDbLog({ feeling: 9 })).feeling).toBeNull();
      expect(mapDbMedicationLogToLog(makeDbLog({ feeling: 0 })).feeling).toBeNull();
      expect(mapDbMedicationLogToLog(makeDbLog({ feeling: null })).feeling).toBeNull();
    });

    it('drops invalid dose_status to null', () => {
      expect(mapDbMedicationLogToLog(makeDbLog({ dose_status: 'bogus' })).doseStatus).toBeNull();
    });
  });

  describe('sortLogsNewestFirst', () => {
    it('orders by date then time descending', () => {
      const logs = [
        makeLog({ id: 'a', loggedDate: '2026-06-01', loggedTime: '08:00:00' }),
        makeLog({ id: 'b', loggedDate: '2026-06-03', loggedTime: '09:00:00' }),
        makeLog({ id: 'c', loggedDate: '2026-06-01', loggedTime: '20:00:00' }),
      ];
      expect(sortLogsNewestFirst(logs).map((l) => l.id)).toEqual(['b', 'c', 'a']);
    });
  });

  describe('computeLogStats', () => {
    it('returns zeros for empty list', () => {
      const s = computeLogStats([]);
      expect(s.count).toBe(0);
      expect(s.mostCommonFeeling).toBeNull();
      expect(s.weeksOnMed).toBeNull();
    });

    it('counts logs and finds most common feeling', () => {
      const s = computeLogStats([
        makeLog({ id: '1', feeling: 4 }),
        makeLog({ id: '2', feeling: 4 }),
        makeLog({ id: '3', feeling: 2 }),
      ]);
      expect(s.count).toBe(3);
      expect(s.mostCommonFeeling).toBe(4);
    });

    it('weeksOnMed is at least 1', () => {
      expect(computeLogStats([makeLog({ loggedDate: '2026-06-20' })]).weeksOnMed).toBeGreaterThanOrEqual(1);
    });
  });

  describe('FEELING_CONFIG', () => {
    it('has all 5 levels with emoji and colour', () => {
      for (const f of [1, 2, 3, 4, 5] as const) {
        expect(FEELING_CONFIG[f].emoji).toBeTruthy();
        expect(FEELING_CONFIG[f].colour).toMatch(/^#/);
      }
    });
  });
});
