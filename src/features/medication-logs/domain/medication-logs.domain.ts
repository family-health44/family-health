// src/features/medication-logs/domain/medication-logs.domain.ts
// Pure domain logic — zero external imports beyond shared DB types.

import type { DbMedicationLog } from '@/shared/types/database';
import type {
  MedicationLog,
  MedicationLogStats,
  Feeling,
  DoseStatus,
} from '../types/medication-logs.types';

// ── Feeling config (1–5) ────────────────────────────────────────────────────
// Colours band red → amber → green across the scale (matches the mockup dots).
export const FEELING_CONFIG: Record<Feeling, { emoji: string; label: string; colour: string }> = {
  1: { emoji: '😣', label: 'Bad',     colour: '#E24B4A' },
  2: { emoji: '😕', label: 'Off',     colour: '#EF9F27' },
  3: { emoji: '😐', label: 'Neutral', colour: '#BA7517' },
  4: { emoji: '😊', label: 'Good',    colour: '#639922' },
  5: { emoji: '😄', label: 'Great',   colour: '#3B6D11' },
};

export const FEELINGS: Feeling[] = [1, 2, 3, 4, 5];

const DOSE_STATUS_LABELS: Record<DoseStatus, string> = {
  taken: 'Took as prescribed',
  missed: 'Missed dose',
  different: 'Took different amount',
};

export function doseStatusLabel(status: DoseStatus): string {
  return DOSE_STATUS_LABELS[status];
}

// Narrows a raw DB feeling (smallint) to the 1–5 union, or null if out of range.
function normaliseFeeling(raw: number | null): Feeling | null {
  if (raw == null) return null;
  if (raw >= 1 && raw <= 5) return raw as Feeling;
  return null;
}

function normaliseDoseStatus(raw: string | null): DoseStatus | null {
  if (raw === 'taken' || raw === 'missed' || raw === 'different') return raw;
  return null;
}

export function mapDbMedicationLogToLog(db: DbMedicationLog): MedicationLog {
  return {
    id: db.id,
    medicationId: db.medication_id,
    personId: db.person_id,
    familyGroupId: db.family_group_id,
    loggedDate: db.logged_date,
    loggedTime: db.logged_time,
    feeling: normaliseFeeling(db.feeling),
    doseStatus: normaliseDoseStatus(db.dose_status),
    note: db.note,
    tags: db.tags ?? [],
    createdAt: db.created_at,
  };
}

// Newest first. Sort key: logged_date, then logged_time, then created_at as tiebreak.
export function sortLogsNewestFirst(logs: MedicationLog[]): MedicationLog[] {
  const key = (l: MedicationLog) =>
    `${l.loggedDate}|${l.loggedTime ?? '00:00:00'}|${l.createdAt ?? ''}`;
  return [...logs].sort((a, b) => key(b).localeCompare(key(a)));
}

// Stat-strip values computed from the logs.
export function computeLogStats(logs: MedicationLog[]): MedicationLogStats {
  const count = logs.length;
  if (count === 0) {
    return { count: 0, mostCommonFeeling: null, weeksOnMed: null };
  }

  // Most common feeling (mode). Ties resolve to the higher feeling value.
  const tally = new Map<Feeling, number>();
  for (const l of logs) {
    if (l.feeling != null) tally.set(l.feeling, (tally.get(l.feeling) ?? 0) + 1);
  }
  let mostCommonFeeling: Feeling | null = null;
  let best = -1;
  for (const f of FEELINGS) {
    const n = tally.get(f) ?? 0;
    if (n >= best && n > 0) { best = n; mostCommonFeeling = f; }
  }

  // Weeks since the earliest logged_date.
  const dates = logs.map((l) => l.loggedDate).filter(Boolean).sort();
  const earliest = dates[0];
  let weeksOnMed: number | null = null;
  if (earliest) {
    const parts = earliest.split('-').map(Number);
    const ey = parts[0] ?? 1970;
    const em = parts[1] ?? 1;
    const ed = parts[2] ?? 1;
    const start = new Date(ey, em - 1, ed);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.max(0, Math.round((today.getTime() - start.getTime()) / 86_400_000));
    weeksOnMed = Math.max(1, Math.floor(diffDays / 7) || 1);
  }

  return { count, mostCommonFeeling, weeksOnMed };
}
