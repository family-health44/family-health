// tests/unit/shared/utils.test.ts
import { getInitials } from '@/shared/utils/initials';
import { getPersonColour } from '@/shared/utils/avatar';
import {
  formatDate,
  formatRelativeDate,
  formatTime,
  isPastDate,
  isToday,
  toISODateString,
} from '@/shared/utils/dates';
import { PERSON_COLOURS } from '@/design-system/tokens/colours';

describe('getInitials', () => {
  it('returns JS for Jane Smith', () => expect(getInitials('Jane Smith')).toBe('JS'));
  it('returns first two letters for single name', () => expect(getInitials('Alice')).toBe('AL'));
  it('uses first and last word for multi-word names', () => expect(getInitials('John William Doe')).toBe('JD'));
  it('returns ? for empty string', () => expect(getInitials('')).toBe('?'));
  it('handles extra whitespace', () => expect(getInitials('  Jane   Smith  ')).toBe('JS'));
  it('uppercases result', () => expect(getInitials('jane smith')).toBe('JS'));
});

describe('getPersonColour', () => {
  it('returns correct colour for index 0–4', () => {
    for (let i = 0; i < 5; i++) {
      expect(getPersonColour(i)).toEqual(PERSON_COLOURS[i]);
    }
  });

  it('wraps around at the palette length', () => {
    const n = PERSON_COLOURS.length;
    expect(getPersonColour(n)).toEqual(PERSON_COLOURS[0]);
    expect(getPersonColour(n + 1)).toEqual(PERSON_COLOURS[1]);
  });

  it('handles large indices', () => {
    expect(getPersonColour(100)).toEqual(PERSON_COLOURS[100 % PERSON_COLOURS.length]);
  });
});

describe('formatDate', () => {
  it('formats ISO date string for display', () => {
    const result = formatDate('2024-01-15');
    expect(result).toMatch(/15/);
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/2024/);
  });

  it('returns Invalid date for bad input', () => {
    expect(formatDate('not-a-date')).toBe('Invalid date');
  });
});

describe('formatTime', () => {
  it('formats 09:30:00 as 9:30 AM', () => {
    expect(formatTime('09:30:00')).toBe('9:30 AM');
  });

  it('formats 14:00:00 as 2:00 PM', () => {
    expect(formatTime('14:00:00')).toBe('2:00 PM');
  });

  it('formats 00:00:00 as 12:00 AM', () => {
    expect(formatTime('00:00:00')).toBe('12:00 AM');
  });

  it('formats 12:00:00 as 12:00 PM', () => {
    expect(formatTime('12:00:00')).toBe('12:00 PM');
  });

  it('pads minutes', () => {
    expect(formatTime('09:05:00')).toBe('9:05 AM');
  });
});

describe('isPastDate', () => {
  it('returns true for yesterday', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    expect(isPastDate(yesterday)).toBe(true);
  });

  it('returns false for tomorrow', () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    expect(isPastDate(tomorrow)).toBe(false);
  });
});

describe('isToday', () => {
  it('returns true for today', () => {
    expect(isToday(new Date().toISOString())).toBe(true);
  });

  it('returns false for yesterday', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    expect(isToday(yesterday)).toBe(false);
  });
});

describe('toISODateString', () => {
  it('returns YYYY-MM-DD format', () => {
    const result = toISODateString(new Date('2024-06-15T00:00:00.000Z'));
    expect(result).toBe('2024-06-15');
  });
});

describe('formatRelativeDate', () => {
  it('returns Today for today', () => {
    expect(formatRelativeDate(new Date().toISOString())).toBe('Today');
  });

  it('returns Yesterday for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatRelativeDate(yesterday.toISOString())).toBe('Yesterday');
  });

  it('returns Tomorrow for tomorrow', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(formatRelativeDate(tomorrow.toISOString())).toBe('Tomorrow');
  });
});
