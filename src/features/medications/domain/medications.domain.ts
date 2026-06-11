// src/features/medications/domain/medications.domain.ts
// Pure domain logic — zero external imports.

import type { DbMedication } from '@/shared/types/database';
import type { Medication, MedicationGroup, MedicationStatus } from '../types/medications.types';

// Status display config — order determines group order on screen
const STATUS_CONFIG: Record<MedicationStatus, { label: string; order: number }> = {
  active: { label: 'Active', order: 0 },
  as_needed: { label: 'As Needed', order: 1 },
  inactive: { label: 'Inactive', order: 2 },
  completed: { label: 'Completed', order: 3 },
};

// Normalises a raw DB status string (any casing/format) to the app's enum.
// The DB stores human-readable values like "Active" or "As needed".
export function normaliseMedicationStatus(raw: string | null | undefined): MedicationStatus {
  const s = (raw ?? '').toLowerCase().trim().replace(/[\s-]+/g, '_');
  switch (s) {
    case 'active': return 'active';
    case 'as_needed': return 'as_needed';
    case 'inactive': return 'inactive';
    case 'completed': return 'completed';
    default: return 'active'; // safe fallback so nothing silently disappears
  }
}

export function mapDbMedicationToMedication(
  db: DbMedication,
  prescribedByName: string | null = null,
): Medication {
  return {
    id: db.id,
    name: db.name,
    dosage: db.dosage,
    frequency: db.frequency,
    reason: db.reason,
    status: normaliseMedicationStatus(db.status as unknown as string),
    startDate: db.start_date,
    endDate: db.end_date,
    personId: db.person_id,
    prescribedBy: db.prescribed_by,
    prescribedByName,
    familyGroupId: db.family_group_id,
  };
}

// Groups medications by status, sorted alphabetically within each group.
// Empty groups are omitted.
export function groupMedicationsByStatus(medications: Medication[]): MedicationGroup[] {
  const map = new Map<MedicationStatus, Medication[]>();

  for (const med of medications) {
    const existing = map.get(med.status) ?? [];
    map.set(med.status, [...existing, med]);
  }

  return (Object.keys(STATUS_CONFIG) as MedicationStatus[])
    .filter((status) => map.has(status))
    .map((status) => ({
      status,
      label: STATUS_CONFIG[status].label,
      medications: [...(map.get(status) ?? [])].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    }));
}

// Maps medication status to badge variant
export function statusToBadgeVariant(
  status: MedicationStatus,
): 'success' | 'neutral' | 'warning' {
  switch (status) {
    case 'active': return 'success';
    case 'as_needed': return 'success';
    case 'inactive': return 'warning';
    case 'completed': return 'neutral';
  }
}

// Returns a human-readable status label
export function statusLabel(status: MedicationStatus): string {
  return STATUS_CONFIG[status].label;
}
