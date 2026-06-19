// src/features/notes/domain/notes.domain.ts
// Pure domain logic — zero external imports.
// Parses the special note content format used in the proof-of-concept.
//
// Content format:
//   Plain text — displayed as-is
//   [EVENT:2024-01-15:diagnosis] text — medical event marker
//   [SECTION:Results] text — section header divider

import type { DbNote } from '@/shared/types/database';
import type { Note, NoteSegment } from '../types/notes.types';

// ─── Mapping ──────────────────────────────────────────────────────────────────

export function mapDbNoteToNote(
  db: DbNote,
  doctorName: string | null = null,
  medicationName: string | null = null,
): Note {
  return {
    id: db.id,
    content: db.content,
    personId: db.person_id,
    doctorId: db.doctor_id,
    doctorName,
    medicationId: db.medication_id,
    medicationName,
    visitId: db.visit_id,
    familyGroupId: db.family_group_id,
    hidden: db.hidden,
    noteDate: db.note_date,
  };
}

// ─── Content parsing ──────────────────────────────────────────────────────────

// Parses note content into typed segments for rich display.
// [EVENT:date:type] text → event segment
// [SECTION:name] text → section segment
// Everything else → text segment
export function parseNoteContent(content: string): NoteSegment[] {
  if (!content.trim()) return [];

  const segments: NoteSegment[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Match [EVENT:date:type]
    const eventMatch = trimmed.match(/^\[EVENT:([^:]+):([^\]]+)\]\s*(.*)/);
    if (eventMatch) {
      segments.push({
        type: 'event',
        eventDate: eventMatch[1] ?? '',
        eventType: eventMatch[2] ?? '',
        content: eventMatch[3] ?? '',
      });
      continue;
    }

    // Match [S:name] (short section marker — appointment-saved notes use this)
    const shortSectionMatch = trimmed.match(/^\[S:([^\]]+)\]\s*(.*)/);
    if (shortSectionMatch) {
      segments.push({ type: 'section', content: shortSectionMatch[1] ?? '' });
      if (shortSectionMatch[2]?.trim()) {
        segments.push({ type: 'text', content: shortSectionMatch[2].trim() });
      }
      continue;
    }
    // Match [SECTION:name]
    const sectionMatch = trimmed.match(/^\[SECTION:([^\]]+)\]\s*(.*)/);
    if (sectionMatch) {
      segments.push({
        type: 'section',
        content: sectionMatch[1] ?? '',
      });
      if (sectionMatch[2]?.trim()) {
        segments.push({ type: 'text', content: sectionMatch[2].trim() });
      }
      continue;
    }

    segments.push({ type: 'text', content: trimmed });
  }

  return segments;
}

// Returns a short preview of note content (first 100 chars, stripped of markers)
export function getNotePreview(content: string, maxLength = 100): string {
  const stripped = content
    .replace(/\[EVENT:[^\]]+\]\s*/g, '')
    .replace(/\[SECTION:[^\]]+\]\s*/g, '')
    .trim();

  if (stripped.length <= maxLength) return stripped;
  return `${stripped.slice(0, maxLength)}…`;
}

// Sorts notes — most recent visit notes first, then by content length descending
export function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    // Pinned to visit first
    if (a.visitId && !b.visitId) return -1;
    if (!a.visitId && b.visitId) return 1;
    return b.content.length - a.content.length;
  });
}
