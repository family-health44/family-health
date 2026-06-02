// src/features/notes/types/notes.types.ts
// Domain types for the notes feature.
// Notes use a special content format from the proof-of-concept:
//   [EVENT:date:type] text  — marks a medical event embedded in a note
//   [SECTION:name] text     — section divider within a note
// These are parsed by the domain layer for display.

export interface Note {
  id: string;
  content: string;
  personId: string | null;
  doctorId: string | null;
  doctorName: string | null;
  medicationId: string | null;
  medicationName: string | null;
  visitId: string | null;
  familyGroupId: string;
  hidden: boolean;
}

// Parsed segment of a note's content
export type NoteSegmentType = 'text' | 'event' | 'section';

export interface NoteSegment {
  type: NoteSegmentType;
  content: string;
  // For 'event' segments
  eventDate?: string;
  eventType?: string;
}

export interface NoteFormValues {
  content: string;
  doctorId: string | null;
  medicationId: string | null;
  hidden: boolean;
}
