// src/features/snapshot/domain/snapshot.domain.ts
// Pure domain logic — zero external imports.
// Builds a per-person triage snapshot from existing domain objects.

import type { Todo } from '@/features/todos/types/todos.types';
import type { Visit } from '@/features/visits/types/visits.types';
import type { Medication } from '@/features/medications/types/medications.types';

export type SnapshotWindow = 'week' | 'month';

export interface SnapshotTodo {
  id: string;
  title: string;
  dueDate: string | null;
  overdue: boolean;
  daysLate: number;
}
export interface SnapshotVisit {
  id: string;
  title: string;
  visitDate: string;
  visitTime: string | null;
  doctorName: string | null;
}
export interface SnapshotRefill {
  id: string;
  name: string;
  nextRefill: string;
  repeatsLeft: number | null;
  pharmacy: string | null;
}
export interface Snapshot {
  needsAction: SnapshotTodo[];
  appointments: SnapshotVisit[];
  refills: SnapshotRefill[];
  overdueCount: number;
  totalCount: number;
}

// Local-date ISO (YYYY-MM-DD) — never toISOString(), which UTC-shifts in AEST.
function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysBetween(fromISO: string, toISO: string): number {
  const a = new Date(fromISO + 'T00:00:00');
  const b = new Date(toISO + 'T00:00:00');
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function buildSnapshot(
  todos: Todo[],
  visits: Visit[],
  medications: Medication[],
  window: SnapshotWindow,
  now: Date = new Date(),
): Snapshot {
  const todayISO = isoDate(now);
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + (window === 'week' ? 7 : 30));
  const horizonISO = isoDate(horizon);

  const inWindow = (iso: string) => iso >= todayISO && iso <= horizonISO;

  // Needs action: incomplete todos that are overdue OR due within the window.
  const needsAction: SnapshotTodo[] = todos
    .filter((t) => !t.completed && t.dueDate != null)
    .map((t) => {
      const due = t.dueDate as string;
      const late = due < todayISO;
      return { id: t.id, title: t.title, dueDate: due, overdue: late, daysLate: late ? daysBetween(due, todayISO) : 0 };
    })
    .filter((t) => t.overdue || inWindow(t.dueDate as string))
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : a.dueDate! > b.dueDate! ? 1 : 0));

  const appointments: SnapshotVisit[] = visits
    .filter((v) => inWindow(v.visitDate))
    .map((v) => ({ id: v.id, title: v.title, visitDate: v.visitDate, visitTime: v.visitTime, doctorName: v.doctorName }))
    .sort((a, b) => (a.visitDate < b.visitDate ? -1 : a.visitDate > b.visitDate ? 1 : (a.visitTime ?? '').localeCompare(b.visitTime ?? '')));

  const refills: SnapshotRefill[] = medications
    .filter((m) => m.nextRefill != null && inWindow(m.nextRefill))
    .map((m) => ({ id: m.id, name: m.name, nextRefill: m.nextRefill as string, repeatsLeft: m.repeatsLeft, pharmacy: m.pharmacy }))
    .sort((a, b) => (a.nextRefill < b.nextRefill ? -1 : 1));

  const overdueCount = needsAction.filter((t) => t.overdue).length;
  const totalCount = needsAction.length + appointments.length + refills.length;

  return { needsAction, appointments, refills, overdueCount, totalCount };
}
