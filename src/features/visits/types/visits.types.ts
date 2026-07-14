// src/features/visits/types/visits.types.ts
// Domain types for the visits feature.

export type VisitsViewMode = 'list' | 'week' | 'month';

export interface Visit {
  id: string;
  title: string;
  visitDate: string; // ISO date string YYYY-MM-DD
  visitTime: string | null;
  doctorId: string | null;
  doctorName: string | null;
  personId: string;
  personName: string;
  personColourIndex: number;
  familyGroupId: string;
  preNotes: string | null;
  postNotes: string | null;
  totalCost: number | null;
  outOfPocket: number | null;
  reminderOffsetMinutes: number | null;
  reminderAt: string | null;
}

// A day cell in the calendar — may have visits
export interface CalendarDay {
  date: string; // ISO date YYYY-MM-DD
  dayNumber: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  visits: Visit[];
}

// Week view — Mon–Sun
export interface CalendarWeek {
  days: CalendarDay[];
}
