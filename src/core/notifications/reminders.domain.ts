// src/core/notifications/reminders.domain.ts
// Pure logic. Resolves the two reminder modes to a single fire instant.
//
//   Timed visit      -> offset minutes before (visitDate + visitTime)
//   Untimed visit    -> absolute reminderAt
//   Todo             -> absolute reminderAt
//
// Local Date construction only — never Date.parse on a bare ISO date (UTC drift).

export const OFFSET_OPTIONS: { minutes: number; label: string }[] = [
  { minutes: 15, label: '15 minutes before' },
  { minutes: 30, label: '30 minutes before' },
  { minutes: 60, label: '1 hour before' },
  { minutes: 120, label: '2 hours before' },
  { minutes: 1440, label: '1 day before' },
  { minutes: 2880, label: '2 days before' },
  { minutes: 10080, label: '1 week before' },
];

/** Builds a local Date from 'YYYY-MM-DD' + 'HH:MM'. */
export function toLocalInstant(isoDate: string, time: string): Date | null {
  const [y, m, d] = isoDate.split('-').map(Number);
  const [h, min] = time.split(':').map(Number);
  if (!y || !m || !d || h === undefined || Number.isNaN(h)) return null;
  return new Date(y, m - 1, d, h, Number.isNaN(min) ? 0 : min, 0, 0);
}

/** Fire instant for a visit reminder, or null if none set / unresolvable. */
export function resolveVisitReminder(v: {
  visitDate: string;
  visitTime: string | null;
  reminderOffsetMinutes: number | null;
  reminderAt: string | null;
}): Date | null {
  if (v.visitTime && v.reminderOffsetMinutes != null) {
    const start = toLocalInstant(v.visitDate, v.visitTime);
    if (!start) return null;
    return new Date(start.getTime() - v.reminderOffsetMinutes * 60_000);
  }
  if (v.reminderAt) {
    const d = new Date(v.reminderAt);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/** Fire instant for a todo reminder (absolute only). */
export function resolveTodoReminder(t: { reminderAt: string | null }): Date | null {
  if (!t.reminderAt) return null;
  const d = new Date(t.reminderAt);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** True when a visit's reminder must be re-checked after a date/time edit. */
export function visitReminderNeedsReview(
  before: { visitDate: string; visitTime: string | null },
  after: { visitDate: string; visitTime: string | null },
  hasAbsoluteReminder: boolean,
): boolean {
  if (!hasAbsoluteReminder) return false;
  return before.visitDate !== after.visitDate || before.visitTime !== after.visitTime;
}
