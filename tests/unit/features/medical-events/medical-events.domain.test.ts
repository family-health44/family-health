// tests/unit/features/medical-events/medical-events.domain.test.ts
import {
  parseNoteAsMedicalEvent,
  groupMedicalEventsByType,
  buildEventNoteContent,
} from '@/features/medical-events/domain/medical-events.domain';

import type { DbNote } from '@/shared/types/database';

const makeDbNote = (content: string, overrides: Partial<DbNote> = {}): DbNote => ({
  id: 'note-1',
  content,
  note_date: null,
  person_id: 'person-1',
  doctor_id: null,
  medication_id: null,
  visit_id: null,
  family_group_id: 'group-1',
  hidden: false,
  ...overrides,
});

describe('medical-events.domain', () => {
  describe('parseNoteAsMedicalEvent', () => {
    it('parses a valid event note', () => {
      const note = makeDbNote('[EVENT:2024-01-15:diagnosis] Type 2 diabetes');
      const event = parseNoteAsMedicalEvent(note);
      expect(event).not.toBeNull();
      expect(event?.eventDate).toBe('2024-01-15');
      expect(event?.eventType).toBe('diagnosis');
      expect(event?.description).toBe('Type 2 diabetes');
      expect(event?.id).toBe('note-1');
    });

    it('returns null for non-event notes', () => {
      expect(parseNoteAsMedicalEvent(makeDbNote('Just a regular note'))).toBeNull();
      expect(parseNoteAsMedicalEvent(makeDbNote('[SECTION:Overview] text'))).toBeNull();
    });

    it('drops notes with an unrecognised event type', () => {
      const note = makeDbNote('[EVENT:2024-01-01:unknowntype] description');
      const event = parseNoteAsMedicalEvent(note);
      expect(event).toBeNull();
    });

    it('is case-insensitive for event type', () => {
      const note = makeDbNote('[EVENT:2024-01-01:DIAGNOSIS] description');
      const event = parseNoteAsMedicalEvent(note);
      expect(event?.eventType).toBe('diagnosis');
    });

    it('includes doctor name when provided', () => {
      const note = makeDbNote('[EVENT:2024-01-01:procedure] Surgery', { doctor_id: 'doc-1' });
      const event = parseNoteAsMedicalEvent(note, 'Dr. Smith');
      expect(event?.doctorName).toBe('Dr. Smith');
    });
  });

  describe('groupMedicalEventsByType', () => {
    it('groups by type and sorts events by date descending', () => {
      const events = [
        { id: '1', eventDate: '2024-01-01', eventType: 'diagnosis' as const, description: 'Old', personId: 'p1', doctorId: null, doctorName: null, familyGroupId: 'g1' },
        { id: '2', eventDate: '2024-06-01', eventType: 'diagnosis' as const, description: 'New', personId: 'p1', doctorId: null, doctorName: null, familyGroupId: 'g1' },
        { id: '3', eventDate: '2024-03-01', eventType: 'procedure' as const, description: 'Scan', personId: 'p1', doctorId: null, doctorName: null, familyGroupId: 'g1' },
      ];
      const groups = groupMedicalEventsByType(events);
      expect(groups.find((g) => g.type === 'diagnosis')?.events[0]?.eventDate).toBe('2024-06-01');
      expect(groups.find((g) => g.type === 'procedure')).toBeDefined();
    });

    it('shows all live types as groups, even when empty', () => {
      const events = [
        { id: '1', eventDate: '2024-01-01', eventType: 'diagnosis' as const, description: 'D', personId: 'p1', doctorId: null, doctorName: null, familyGroupId: 'g1' },
      ];
      const groups = groupMedicalEventsByType(events);
      expect(groups).toHaveLength(3);
      expect(groups.find((g) => g.type === 'diagnosis')?.events).toHaveLength(1);
      expect(groups.find((g) => g.type === 'procedure')?.events).toHaveLength(0);
    });
  });

  describe('buildEventNoteContent', () => {
    it('builds correctly formatted content string', () => {
      const content = buildEventNoteContent('2024-01-15', 'diagnosis', 'Type 2 diabetes');
      expect(content).toBe('[EVENT:2024-01-15:diagnosis] Type 2 diabetes');
    });

    it('trims the description', () => {
      const content = buildEventNoteContent('2024-01-15', 'diagnosis', '  trimmed  ');
      expect(content).toBe('[EVENT:2024-01-15:diagnosis] trimmed');
    });
  });
});
