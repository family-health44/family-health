// tests/unit/features/notes/notes.domain.test.ts
import {
  parseNoteContent,
  getNotePreview,
  mapDbNoteToNote,
} from '@/features/notes/domain/notes.domain';

import type { DbNote } from '@/shared/types/database';

const makeDbNote = (overrides: Partial<DbNote> = {}): DbNote => ({
  id: 'note-1',
  content: 'A simple note',
  note_date: null,
  created_at: null,
  person_id: 'person-1',
  doctor_id: null,
  medication_id: null,
  visit_id: null,
  family_group_id: 'group-1',
  hidden: false,
  ...overrides,
});

describe('notes.domain', () => {
  describe('parseNoteContent', () => {
    it('parses plain text as text segment', () => {
      const segments = parseNoteContent('Hello world');
      expect(segments).toHaveLength(1);
      expect(segments[0]?.type).toBe('text');
      expect(segments[0]?.content).toBe('Hello world');
    });

    it('parses EVENT marker correctly', () => {
      const segments = parseNoteContent('[EVENT:2024-01-15:diagnosis] Type 2 diabetes');
      expect(segments).toHaveLength(1);
      expect(segments[0]?.type).toBe('event');
      expect(segments[0]?.eventDate).toBe('2024-01-15');
      expect(segments[0]?.eventType).toBe('diagnosis');
      expect(segments[0]?.content).toBe('Type 2 diabetes');
    });

    it('parses SECTION marker correctly', () => {
      const segments = parseNoteContent('[SECTION:Results] All clear');
      expect(segments[0]?.type).toBe('section');
      expect(segments[0]?.content).toBe('Results');
      expect(segments[1]?.type).toBe('text');
      expect(segments[1]?.content).toBe('All clear');
    });

    it('parses mixed content', () => {
      const content = [
        '[SECTION:Overview]',
        'Patient is well',
        '[EVENT:2024-06-01:procedure] Blood test',
      ].join('\n');
      const segments = parseNoteContent(content);
      expect(segments[0]?.type).toBe('section');
      expect(segments[1]?.type).toBe('text');
      expect(segments[2]?.type).toBe('event');
    });

    it('returns empty array for empty content', () => {
      expect(parseNoteContent('')).toHaveLength(0);
      expect(parseNoteContent('   ')).toHaveLength(0);
    });

    it('skips blank lines', () => {
      const segments = parseNoteContent('Line one\n\n\nLine two');
      expect(segments).toHaveLength(2);
    });
  });

  describe('getNotePreview', () => {
    it('strips EVENT markers', () => {
      const preview = getNotePreview('[EVENT:2024-01-01:diagnosis] Some condition');
      expect(preview).toBe('Some condition');
    });

    it('strips SECTION markers', () => {
      const preview = getNotePreview('[SECTION:Results] Content here');
      expect(preview).toBe('Content here');
    });

    it('truncates long content with ellipsis', () => {
      const long = 'a'.repeat(200);
      const preview = getNotePreview(long, 100);
      expect(preview).toHaveLength(101); // 100 + ellipsis
      expect(preview.endsWith('…')).toBe(true);
    });

    it('does not truncate short content', () => {
      const short = 'Short note';
      expect(getNotePreview(short)).toBe('Short note');
    });
  });

  describe('mapDbNoteToNote', () => {
    it('maps correctly', () => {
      const result = mapDbNoteToNote(makeDbNote());
      expect(result.id).toBe('note-1');
      expect(result.content).toBe('A simple note');
      expect(result.hidden).toBe(false);
      expect(result.doctorName).toBeNull();
    });

    it('includes doctor and medication names when provided', () => {
      const result = mapDbNoteToNote(makeDbNote(), 'Dr. Smith', 'Amoxicillin');
      expect(result.doctorName).toBe('Dr. Smith');
      expect(result.medicationName).toBe('Amoxicillin');
    });
  });
});
