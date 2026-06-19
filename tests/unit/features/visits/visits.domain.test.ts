// tests/unit/features/visits/visits.domain.test.ts
import {
  getMondayOfWeek,
  getWeekDates,
  getMonthGridDates,
  buildWeekCalendar,
  groupVisitsForList,
  toISODate,
  WEEK_DAY_LABELS,
  MONTH_NAMES,
} from '@/features/visits/domain/visits.domain';

import type { Visit } from '@/features/visits/types/visits.types';

const makeVisit = (overrides: Partial<Visit> = {}): Visit => ({
  id: 'visit-1',
  title: 'Checkup',
  visitDate: '2024-06-15',
  visitTime: null,
  doctorId: null,
  doctorName: null,
  personId: 'person-1',
  personColourIndex: 0,
  personName: 'Jane',
  familyGroupId: 'group-1',
  preNotes: null,
  postNotes: null, totalCost: null, outOfPocket: null,
  ...overrides,
});

describe('visits.domain', () => {
  describe('getMondayOfWeek', () => {
    it('returns Monday for a Wednesday input', () => {
      const wednesday = new Date('2024-06-19'); // Wednesday
      const monday = getMondayOfWeek(wednesday);
      expect(toISODate(monday)).toBe('2024-06-17'); // Monday of that week
    });

    it('returns same day for Monday input', () => {
      const monday = new Date('2024-06-17');
      expect(toISODate(getMondayOfWeek(monday))).toBe('2024-06-17');
    });

    it('returns previous Monday for Sunday input', () => {
      const sunday = new Date('2024-06-23');
      expect(toISODate(getMondayOfWeek(sunday))).toBe('2024-06-17');
    });
  });

  describe('getWeekDates', () => {
    it('returns 7 dates starting on Monday', () => {
      const dates = getWeekDates(new Date('2024-06-19'));
      expect(dates).toHaveLength(7);
      expect(toISODate(dates[0]!)).toBe('2024-06-17'); // Monday
      expect(toISODate(dates[6]!)).toBe('2024-06-23'); // Sunday
    });
  });

  describe('getMonthGridDates', () => {
    it('returns dates starting on Monday and ending on Sunday', () => {
      const dates = getMonthGridDates(2024, 5); // June 2024
      // First day should be a Monday
      expect(dates[0]!.getDay()).toBe(1); // 1 = Monday
      // Last day should be a Sunday
      expect(dates[dates.length - 1]!.getDay()).toBe(0); // 0 = Sunday
    });

    it('always returns multiples of 7', () => {
      for (let month = 0; month < 12; month++) {
        const dates = getMonthGridDates(2024, month);
        expect(dates.length % 7).toBe(0);
      }
    });
  });

  describe('buildWeekCalendar', () => {
    it('places visits on correct days', () => {
      const visits = [makeVisit({ visitDate: '2024-06-17' })];
      const week = buildWeekCalendar(new Date('2024-06-17'), visits);
      expect(week.days[0]?.visits).toHaveLength(1);
      expect(week.days[1]?.visits).toHaveLength(0);
    });

    it('marks today correctly', () => {
      const today = new Date();
      const visits: Visit[] = [];
      const week = buildWeekCalendar(today, visits);
      const todayDay = week.days.find((d) => d.isToday);
      expect(todayDay).toBeDefined();
    });

    it('returns 7 days', () => {
      const week = buildWeekCalendar(new Date(), []);
      expect(week.days).toHaveLength(7);
    });
  });

  describe('groupVisitsForList', () => {
    const today = new Date().toISOString().split('T')[0]!;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]!;
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]!;

    it('separates upcoming and past visits', () => {
      const visits = [
        makeVisit({ id: '1', visitDate: yesterday }),
        makeVisit({ id: '2', visitDate: tomorrow }),
        makeVisit({ id: '3', visitDate: today }),
      ];
      const groups = groupVisitsForList(visits);
      expect(groups.find((g) => g.label === 'Upcoming')?.visits).toHaveLength(2);
      expect(groups.find((g) => g.label === 'Past')?.visits).toHaveLength(1);
    });

    it('sorts upcoming visits ascending', () => {
      const visits = [
        makeVisit({ id: '2', visitDate: tomorrow }),
        makeVisit({ id: '1', visitDate: today }),
      ];
      const groups = groupVisitsForList(visits);
      const upcoming = groups.find((g) => g.label === 'Upcoming')!;
      expect(upcoming.visits[0]?.visitDate).toBe(today);
    });

    it('sorts past visits descending (newest first)', () => {
      const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0]!;
      const visits = [
        makeVisit({ id: '1', visitDate: twoDaysAgo }),
        makeVisit({ id: '2', visitDate: yesterday }),
      ];
      const groups = groupVisitsForList(visits);
      const past = groups.find((g) => g.label === 'Past')!;
      expect(past.visits[0]?.visitDate).toBe(yesterday);
    });

    it('omits empty groups', () => {
      const visits = [makeVisit({ visitDate: yesterday })];
      const groups = groupVisitsForList(visits);
      expect(groups).toHaveLength(1);
      expect(groups[0]?.label).toBe('Past');
    });
  });

  describe('constants', () => {
    it('WEEK_DAY_LABELS has 7 entries starting with Mon', () => {
      expect(WEEK_DAY_LABELS).toHaveLength(7);
      expect(WEEK_DAY_LABELS[0]).toBe('Mon');
      expect(WEEK_DAY_LABELS[6]).toBe('Sun');
    });

    it('MONTH_NAMES has 12 entries', () => {
      expect(MONTH_NAMES).toHaveLength(12);
      expect(MONTH_NAMES[0]).toBe('January');
      expect(MONTH_NAMES[11]).toBe('December');
    });
  });
});
