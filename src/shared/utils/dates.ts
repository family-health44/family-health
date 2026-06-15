// src/shared/utils/dates.ts
// Pure date formatting utilities — no external imports.
// All dates from Supabase arrive as ISO strings — format them here for display.

// Formats an ISO date string for display: "12 Jan 2025"
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return 'Invalid date';

  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
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
