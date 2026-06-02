// src/features/notes/queries/notes.queries.ts
// TanStack Query wrappers for note data.
// Joins doctor and medication names at the query layer.

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import { fetchNotesByPerson, fetchNotesByVisit } from '../repository/notes.repository';
import { fetchDoctors } from '@/features/doctors/repository/doctors.repository';
import { fetchMedicationsByPerson } from '@/features/medications/repository/medications.repository';
import { mapDbNoteToNote, sortNotes } from '../domain/notes.domain';

import type { Note } from '../types/notes.types';

// Shared helper — builds name lookup maps from doctor and medication arrays
async function buildNameMaps(personId: string) {
  const [dbDoctors, dbMeds] = await Promise.all([
    fetchDoctors(),
    fetchMedicationsByPerson(personId),
  ]);
  const doctorMap = new Map(dbDoctors.map((d) => [d.id, d.name]));
  const medMap = new Map(dbMeds.map((m) => [m.id, m.name]));
  return { doctorMap, medMap };
}

export function usePersonNotesQuery(personId: string) {
  return useQuery<Note[], Error>({
    queryKey: queryKeys.notes.byPerson(personId),
    queryFn: async () => {
      const [dbNotes, { doctorMap, medMap }] = await Promise.all([
        fetchNotesByPerson(personId),
        buildNameMaps(personId),
      ]);

      const notes = dbNotes.map((db) =>
        mapDbNoteToNote(
          db,
          db.doctor_id ? (doctorMap.get(db.doctor_id) ?? null) : null,
          db.medication_id ? (medMap.get(db.medication_id) ?? null) : null,
        ),
      );

      return sortNotes(notes);
    },
    enabled: Boolean(personId),
  });
}

export function useVisitNotesQuery(visitId: string, personId: string) {
  return useQuery<Note[], Error>({
    queryKey: queryKeys.notes.byVisit(visitId),
    queryFn: async () => {
      const [dbNotes, { doctorMap, medMap }] = await Promise.all([
        fetchNotesByVisit(visitId),
        buildNameMaps(personId),
      ]);

      return dbNotes.map((db) =>
        mapDbNoteToNote(
          db,
          db.doctor_id ? (doctorMap.get(db.doctor_id) ?? null) : null,
          db.medication_id ? (medMap.get(db.medication_id) ?? null) : null,
        ),
      );
    },
    enabled: Boolean(visitId),
  });
}
