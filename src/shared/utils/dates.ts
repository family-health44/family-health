// src/shared/utils/dates.ts
// Pure date formatting utilities — no external imports.
// All dates from Supabase arrive as ISO strings — format them here for display.

// Formats an ISO date string for display: "12 Jan 2025"
export function formatDate(isoDate: string): string {
  // Pure string-split for bare YYYY-MM-DD — never new Date(), which parses a
  // bare date as UTC midnight and shifts the day in positive-offset zones (AEST).
  // Handles full ISO timestamps too by taking the date portion before any 'T'.
  const datePart = (isoDate ?? '').split('T')[0] ?? '';
  const display = isoToDisplayDate(datePart);
  return display || 'Invalid date';
}

// Formats an ISO date string as relative time: "Today", "Yesterday", "3 days ago"
export function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return 'Invalid date';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays === -1) return 'Tomorrow';
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < -1 && diffDays > -7) return `In ${Math.abs(diffDays)} days`;

  return formatDate(isoDate);
}

// Formats a time string "HH:MM:SS" → "9:30 AM"
export function formatTime(timeString: string): string {
  const [hoursStr, minutesStr] = timeString.split(':');
  const hours = parseInt(hoursStr ?? '0', 10);
  const minutes = parseInt(minutesStr ?? '0', 10);

  if (isNaN(hours) || isNaN(minutes)) return timeString;

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');

  return `${displayHours}:${displayMinutes} ${period}`;
}

// Returns true if an ISO date string is in the past
export function isPastDate(isoDate: string): boolean {
  const date = new Date(isoDate);
  return date < new Date();
}

// Returns true if an ISO date string is today
export function isToday(isoDate: string): boolean {
  const date = new Date(isoDate);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

// Formats a date as ISO date string "YYYY-MM-DD" for Supabase inserts.
// Uses LOCAL components (not toISOString) to avoid the UTC day-shift trap:
// in positive-offset zones (e.g. AEST UTC+10) toISOString() rolls the date
// back a day for any local time before 10:00.
export function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DOB_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ISO (YYYY-MM-DD) -> '3 Nov 2018'. Pure split, no Date, no timezone risk. '' on bad input.
export function isoToDisplayDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  const mi = Number(m) - 1;
  if (!y || !d || mi < 0 || mi > 11) return '';
  return `${Number(d)} ${DOB_MONTHS[mi]} ${y}`;
}

// ISO (YYYY-MM-DD) -> 'DD-MM-YYYY' for the editable field. '' on bad input.
export function isoToInputDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${d}-${m}-${y}` : '';
}

// 'DD-MM-YYYY' -> ISO (YYYY-MM-DD) for storage. null if invalid.
export function displayToIsoDate(input: string | null | undefined): string | null {
  if (!input) return null;
  const m = input.trim().match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (!m) return null;
  const day = Number(m[1]), month = Number(m[2]), year = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}
