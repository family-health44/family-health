// src/features/doctors/domain/doctors.domain.ts
// Pure domain logic — zero external imports.
// Groups, sorts, and transforms doctor data.

import type { DbDoctor } from '@/shared/types/database';
import type { Doctor, DoctorGroup } from '../types/doctors.types';

const UNKNOWN_TYPE = 'Other';

export function mapDbDoctorToDoctor(db: DbDoctor): Doctor {
  return {
    id: db.id,
    name: db.name,
    type: db.type,
    address: db.address,
    phone: db.phone,
    familyGroupId: db.family_group_id,
  };
}

// Groups doctors alphabetically by type.
// Doctors with no type go into "Other" at the end.
export function groupDoctorsByType(doctors: Doctor[]): DoctorGroup[] {
  const map = new Map<string, Doctor[]>();

  for (const doctor of doctors) {
    const type = doctor.type ?? UNKNOWN_TYPE;
    const existing = map.get(type) ?? [];
    map.set(type, [...existing, doctor]);
  }

  // Sort groups alphabetically, "Other" always last
  const entries = [...map.entries()].sort(([a], [b]) => {
    if (a === UNKNOWN_TYPE) return 1;
    if (b === UNKNOWN_TYPE) return -1;
    return a.localeCompare(b);
  });

  return entries.map(([type, doctors]) => ({
    type,
    doctors: [...doctors].sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

// Filters doctors assigned to a specific person
export function filterDoctorsByPerson(
  doctors: Doctor[],
  personDoctorIds: string[],
): Doctor[] {
  const idSet = new Set(personDoctorIds);
  return doctors.filter((d) => idSet.has(d.id));
}

// Formats a phone number for display — returns as-is if not parseable
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)} ${digits.slice(6)}`;
  }
  return phone;
}
