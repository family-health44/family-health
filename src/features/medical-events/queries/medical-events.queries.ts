// src/features/medical-events/queries/medical-events.queries.ts
// Medical events are stored as notes — we fetch notes and parse them here.
// No separate repository needed — reuses notes and doctors repositories.

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import { fetchNotesByPerson } from '@/features/notes/repository/notes.repository';
import { fetchDoctors } from '@/features/doctors/repository/doctors.repository';
import {
  parseNoteAsMedicalEvent,
  groupMedicalEventsByType,
} from '../domain/medical-events.domain';

import type { MedicalEventGroup } from '../types/medical-events.types';

export function usePersonMedicalEventsQuery(personId: string) {
  return useQuery<MedicalEventGroup[], Error>({
    queryKey: queryKeys.medicalEvents.byPerson(personId),
    queryFn: async () => {
      const [dbNotes, dbDoctors] = await Promise.all([
        fetchNotesByPerson(personId),
        fetchDoctors(),
      ]);

      const doctorMap = new Map(dbDoctors.map((d) => [d.id, d.name]));

      const events = dbNotes
        .map((db) =>
          parseNoteAsMedicalEvent(
            db,
            db.doctor_id ? (doctorMap.get(db.doctor_id) ?? null) : null,
          ),
        )
        .filter((e): e is NonNullable<typeof e> => e !== null);

      return groupMedicalEventsByType(events);
    },
    enabled: Boolean(personId),
  });
}
