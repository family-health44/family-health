// src/core/notifications/reminders.domain.ts
// Pure logic. One reminder mode: an absolute instant, chosen by the user.
//
// Visits and todos behave identically. A reminder does NOT follow a date change
// — the UI prompts to keep or clear it instead.

/** Fire instant for a visit reminder, or null if none set / unresolvable. */
export function resolveVisitReminder(v: { reminderAt: string | null }): Date | null {
  if (!v.reminderAt) return null;
  const d = new Date(v.reminderAt);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Fire instant for a todo reminder, or null if none set / unresolvable. */
export function resolveTodoReminder(t: { reminderAt: string | null }): Date | null {
  if (!t.reminderAt) return null;
  const d = new Date(t.reminderAt);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** True when a reminder must be re-checked after a date/time edit. */
export function reminderNeedsReview(
  beforeDate: string,
  afterDate: string,
  hasReminder: boolean,
): boolean {
  if (!hasReminder) return false;
  return beforeDate !== afterDate;
}

/** Short display label for a reminder instant, e.g. "14 Jul, 11:44". */
export function formatReminderShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-AU', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}
