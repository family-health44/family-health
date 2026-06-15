// src/features/visits/domain/visits.domain.ts
// Pure domain logic — zero external imports.
// Handles calendar building, visit grouping, and date math.

import type { DbVisit } from '@/shared/types/database';
import type { Visit, CalendarDay, CalendarWeek } from '../types/visits.types';

// ─── Mapping ──────────────────────────────────────────────────────────────────

export function mapDbVisitToVisit(
  db: DbVisit,
  personName: string,
  doctorName: string | null = null,
): Visit {
  return {
    id: db.id,
    title: db.title,
    visitDate: db.visit_date,
    visitTime: db.visit_time,
    doctorId: db.doctor_id,
    doctorName,
    personId: db.person_id,
    personName,
    familyGroupId: db.family_group_id,
    preNotes: db.pre_notes,
    postNotes: db.post_notes,
  };
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function toISODate(date: Date): string {
  // Format from LOCAL date components — never via toISOString(), which converts
  // to UTC and shifts the date back a day in positive-offset zones (e.g. AEST).
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

// Returns Monday of the week containing the given date
export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // adjust to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Returns array of 7 dates Mon–Sun for the week containing `date`
export function getWeekDates(date: Date): Date[] {
  const monday = getMondayOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

// Returns all dates in the month grid (Mon–Sun, filling partial weeks)
export function getMonthGridDates(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const gridStart = getMondayOfWeek(firstDay);
  const gridEnd = new Date(lastDay);

  // Extend to Sunday
  const endDay = gridEnd.getDay();
  if (endDay !== 0) gridEnd.setDate(gridEnd.getDate() + (7 - endDay));

  const dates: Date[] = [];
  const current = new Date(gridStart);
  while (current <= gridEnd) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// ─── Calendar building ────────────────────────────────────────────────────────

function buildCalendarDay(
  date: Date,
  visits: Visit[],
  currentMonth?: number,
): CalendarDay {
  const iso = toISODate(date);
  const today = todayISO();
  return {
    date: iso,
    dayNumber: date.getDate(),
    isToday: iso === today,
    isCurrentMonth: currentMonth === undefined ? true : date.getMonth() === currentMonth,
    visits: visits.filter((v) => v.visitDate === iso),
  };
}

export function buildWeekCalendar(centerDate: Date, visits: Visit[]): CalendarWeek {
  const days = getWeekDates(centerDate).map((d) => buildCalendarDay(d, visits));
  return { days };
}

export function buildMonthGrid(
  year: number,
  month: number,
  visits: Visit[],
): CalendarDay[] {
  return getMonthGridDates(year, month).map((d) =>
    buildCalendarDay(d, visits, month),
  );
}

// ─── List grouping ────────────────────────────────────────────────────────────

export interface VisitListGroup {
  label: string;
  visits: Visit[];
}

// Groups visits into Upcoming and Past, sorted by date
export function groupVisitsForList(visits: Visit[]): VisitListGroup[] {
  const today = todayISO();
  const upcoming = visits
    .filter((v) => v.visitDate >= today)
    .sort((a, b) => a.visitDate.localeCompare(b.visitDate));

  const past = visits
    .filter((v) => v.visitDate < today)
    .sort((a, b) => b.visitDate.localeCompare(a.visitDate)); // newest first

  const groups: VisitListGroup[] = [];
  if (upcoming.length > 0) groups.push({ label: 'Upcoming', visits: upcoming });
  if (past.length > 0) groups.push({ label: 'Past', visits: past });
  return groups;
}

// Short day labels for calendar header Mon–Sun
export const WEEK_DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

// Month names
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;
