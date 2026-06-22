// src/features/notes/queries/notes.queries.ts
// TanStack Query wrappers for note data.
// Joins doctor and medication names at the query layer.

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import { fetchNotesByPerson, fetchNotesByVisit } from '../repository/notes.repository';
import { fetchDoctors } from '@/features/doctors/repository/doctors.repository';
import { fetchMedicationsByPerson } from '@/features/medications/repository/medications.repository';
import { fetchVisitsByPerson } from '@/features/visits/repository/visits.repository';
import { formatDate } from '@/shared/utils/dates';
import { mapDbNoteToNote, sortNotes } from '../domain/notes.domain';

import type { Note } from '../types/notes.types';

// Shared helper — builds name lookup maps from doctor and medication arrays
async function buildNameMaps(personId: string) {
  const [dbDoctors, dbMeds, dbVisits] = await Promise.all([
    fetchDoctors(),
    fetchMedicationsByPerson(personId),
    fetchVisitsByPerson(personId),
  ]);
  const doctorMap = new Map(dbDoctors.map((d) => [d.id, d.name]));
  const medMap = new Map(dbMeds.map((m) => [m.id, m.name]));
  const visitMap = new Map(
    dbVisits.map((v) => [v.id, `${v.title} — ${formatDate(v.visit_date)}`]),
  );
  return { doctorMap, medMap, visitMap };
}

export function usePersonNotesQuery(personId: string) {
  return useQuery<Note[], Error>({
    queryKey: queryKeys.notes.byPerson(personId),
    queryFn: async () => {
      const [dbNotes, { doctorMap, medMap, visitMap }] = await Promise.all([
        fetchNotesByPerson(personId),
        buildNameMaps(personId),
      ]);

      const notes = dbNotes.map((db) =>
        mapDbNoteToNote(
          db,
          db.doctor_id ? (doctorMap.get(db.doctor_id) ?? null) : null,
          db.medication_id ? (medMap.get(db.medication_id) ?? null) : null,
          db.visit_id ? (visitMap.get(db.visit_id) ?? null) : null,
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
      const [dbNotes, { doctorMap, medMap, visitMap }] = await Promise.all([
        fetchNotesByVisit(visitId),
        buildNameMaps(personId),
      ]);

      return dbNotes.map((db) =>
        mapDbNoteToNote(
          db,
          db.doctor_id ? (doctorMap.get(db.doctor_id) ?? null) : null,
          db.medication_id ? (medMap.get(db.medication_id) ?? null) : null,
          db.visit_id ? (visitMap.get(db.visit_id) ?? null) : null,
        ),
      );
    },
    enabled: Boolean(visitId),
  });
}
