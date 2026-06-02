// src/features/medical-events/domain/medical-events.domain.ts
// Pure domain logic — zero external imports.
// Medical events are stored as notes using the [EVENT:date:type] format.
// This layer parses those notes into typed MedicalEvent objects.

import type { DbNote } from '@/shared/types/database';
import type {
  MedicalEvent,
  MedicalEventGroup,
  MedicalEventType,
} from '../types/medical-events.types';
import {
  MEDICAL_EVENT_CONFIG,
  MEDICAL_EVENT_TYPES,
} from '../types/medical-events.types';

// Parses a note into a MedicalEvent if it contains an [EVENT:date:type] marker.
// Returns null if the note is not a medical event note.
export function parseNoteAsMedicalEvent(
  db: DbNote,
  doctorName: string | null = null,
): MedicalEvent | null {
  const match = db.content.match(/^\[EVENT:([^:]+):([^\]]+)\]\s*(.*)/s);
  if (!match) return null;

  const eventDate = match[1]?.trim() ?? '';
  const rawType = match[2]?.trim().toLowerCase() ?? 'other';
  const description = match[3]?.trim() ?? '';

  // Validate event type — fall back to 'other' if unrecognised
  const eventType: MedicalEventType = MEDICAL_EVENT_TYPES.includes(
    rawType as MedicalEventType,
  )
    ? (rawType as MedicalEventType)
    : 'other';

  return {
    id: db.id,
    eventDate,
    eventType,
    description,
    personId: db.person_id,
    doctorId: db.doctor_id,
    doctorName,
    familyGroupId: db.family_group_id,
  };
}

// Groups events by type, sorted by date descending within each group.
// Empty groups are omitted.
export function groupMedicalEventsByType(
  events: MedicalEvent[],
): MedicalEventGroup[] {
  const map = new Map<MedicalEventType, MedicalEvent[]>();

  for (const event of events) {
    const existing = map.get(event.eventType) ?? [];
    map.set(event.eventType, [...existing, event]);
  }

  return MEDICAL_EVENT_TYPES.filter((type) => map.has(type)).map((type) => ({
    type,
    label: MEDICAL_EVENT_CONFIG[type].label,
    events: [...(map.get(type) ?? [])].sort((a, b) =>
      b.eventDate.localeCompare(a.eventDate),
    ),
  }));
}

// Builds the [EVENT:date:type] note content string from form values
export function buildEventNoteContent(
  date: string,
  type: MedicalEventType,
  description: string,
): string {
  return `[EVENT:${date}:${type}] ${description}`.trim();
}
