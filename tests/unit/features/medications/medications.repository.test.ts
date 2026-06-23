// tests/unit/features/medications/medications.repository.test.ts
// Guards the A20 bug class: a repository write silently dropping a column.
// Mocks the Supabase client and asserts insert/update send EVERY db column.

const captured: { insert?: Record<string, unknown>; update?: Record<string, unknown> } = {};

jest.mock('@/lib/supabase', () => {
  const single = jest.fn().mockResolvedValue({ data: { id: 'm1' }, error: null });
  const select = jest.fn(() => ({ single }));
  return {
    db: {
      from: jest.fn(() => ({
        insert: jest.fn((obj: Record<string, unknown>) => { captured.insert = obj; return { select }; }),
        update: jest.fn((obj: Record<string, unknown>) => {
          captured.update = obj;
          return { eq: jest.fn(() => ({ select })) };
        }),
      })),
    },
  };
});

import { insertMedication, updateMedication } from '@/features/medications/repository/medications.repository';

const ALL_DB_COLUMNS = [
  'name', 'dosage', 'frequency', 'reason', 'status', 'start_date', 'end_date',
  'person_id', 'prescribed_by', 'family_group_id', 'form', 'time_of_day',
  'with_food', 'repeats_left', 'next_refill', 'pharmacy',
];

// update can't change person_id / family_group_id — those are insert-only
const UPDATE_DB_COLUMNS = ALL_DB_COLUMNS.filter((c) => c !== 'person_id' && c !== 'family_group_id');

const baseInsert = {
  name: 'Amoxicillin', dosage: '500mg', frequency: 'Twice daily', reason: 'Infection',
  status: 'active' as const, startDate: '2026-01-01', endDate: null, personId: 'p1',
  prescribedBy: 'd1', familyGroupId: 'g1', form: 'Tablet', timeOfDay: 'Morning',
  withFood: 'Preferred', repeatsLeft: 3, nextRefill: '2026-02-01', pharmacy: 'Chemist',
};

describe('medications.repository — column completeness', () => {
  beforeEach(() => { captured.insert = undefined; captured.update = undefined; });

  it('insertMedication sends every db column', async () => {
    await insertMedication(baseInsert);
    expect(captured.insert).toBeDefined();
    for (const col of ALL_DB_COLUMNS) {
      expect(captured.insert).toHaveProperty(col);
    }
  });

  it('insertMedication maps camelCase params to snake_case columns', async () => {
    await insertMedication(baseInsert);
    expect(captured.insert).toMatchObject({
      person_id: 'p1', family_group_id: 'g1', start_date: '2026-01-01',
      time_of_day: 'Morning', with_food: 'Preferred', repeats_left: 3, next_refill: '2026-02-01',
    });
  });

  it('updateMedication sends every editable db column', async () => {
    await updateMedication({ medicationId: 'm1', ...baseInsert });
    expect(captured.update).toBeDefined();
    for (const col of UPDATE_DB_COLUMNS) {
      expect(captured.update).toHaveProperty(col);
    }
  });

  it('updateMedication does NOT change person_id or family_group_id', async () => {
    await updateMedication({ medicationId: 'm1', ...baseInsert });
    expect(captured.update).not.toHaveProperty('person_id');
    expect(captured.update).not.toHaveProperty('family_group_id');
  });
});
