// src/features/medical-events/types/medical-events.types.ts
// Domain types for medical events.
// Medical events are stored as notes with [EVENT:date:type] markers.
// The domain layer parses these from the notes table — no separate table needed.

export type MedicalEventType =
  | 'diagnosis'
  | 'procedure'
  | 'illness'
  | 'allergy'
  | 'injury'
  | 'surgery'
  | 'test'
  | 'other';

export interface MedicalEvent {
  id: string; // note id
  eventDate: string; // ISO date string
  eventType: MedicalEventType;
  description: string;
  personId: string | null;
  doctorId: string | null;
  doctorName: string | null;
  familyGroupId: string;
}

// Grouped by type for display
export interface MedicalEventGroup {
  type: MedicalEventType;
  label: string;
  events: MedicalEvent[];
}

// Config for each event type
export const MEDICAL_EVENT_CONFIG: Record<
  MedicalEventType,
  { label: string; badgeVariant: 'danger' | 'warning' | 'info' | 'neutral' }
> = {
  diagnosis: { label: 'Diagnosis', badgeVariant: 'danger' },
  procedure: { label: 'Procedure', badgeVariant: 'info' },
  illness: { label: 'Illness', badgeVariant: 'warning' },
  allergy: { label: 'Allergy', badgeVariant: 'danger' },
  injury: { label: 'Injury', badgeVariant: 'warning' },
  surgery: { label: 'Surgery', badgeVariant: 'info' },
  test: { label: 'Test / Result', badgeVariant: 'neutral' },
  other: { label: 'Other', badgeVariant: 'neutral' },
} as const;

export const MEDICAL_EVENT_TYPES = Object.keys(
  MEDICAL_EVENT_CONFIG,
) as MedicalEventType[];
