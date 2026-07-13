// src/features/packs/hooks/usePackData.ts
// Fans out the existing feature queries for one person + visit.
// Read-only. Adds no new repository calls — everything here is already cached.

import { useMemo } from 'react';

import { usePersonQuery } from '@/features/family/queries/family.queries';
import { usePersonMedicationsQuery } from '@/features/medications/queries/medications.queries';
import { usePersonMedicalEventsQuery } from '@/features/medical-events/queries/medical-events.queries';
import { usePersonDoctorsQuery } from '@/features/doctors/queries/doctors.queries';
import { useVisitsForCalendarQuery } from '@/features/visits/queries/visits.queries';
import { useTodosQuery } from '@/features/todos/queries/todos.queries';
import { useVisitDocumentsQuery } from '@/features/documents/queries/documents.queries';

import type { Visit } from '@/features/visits/types/visits.types';
import type { PackInput } from '../domain/packs.domain';

export interface PackDataResult {
  isLoading: boolean;
  error: Error | null;
  visit: Visit | null;
  // Everything except `questions` and `todayIso`, which the screen supplies.
  input: Omit<PackInput, 'questions' | 'todayIso'> | null;
}

export function usePackData(visitId: string): PackDataResult {
  const visitsQ = useVisitsForCalendarQuery();

  const visit = useMemo(
    () => visitsQ.data?.find((v) => v.id === visitId) ?? null,
    [visitsQ.data, visitId],
  );

  const personId = visit?.personId ?? '';

  const personQ = usePersonQuery(personId);
  const medsQ = usePersonMedicationsQuery(personId);
  const eventsQ = usePersonMedicalEventsQuery(personId);
  const doctorsQ = usePersonDoctorsQuery(personId);
  const todosQ = useTodosQuery();
  const docsQ = useVisitDocumentsQuery(visitId);

  const todos = useMemo(
    () => (todosQ.data ?? []).flatMap((g) => g.todos),
    [todosQ.data],
  );

  const isLoading =
    visitsQ.isLoading ||
    personQ.isLoading ||
    medsQ.isLoading ||
    eventsQ.isLoading ||
    doctorsQ.isLoading ||
    todosQ.isLoading ||
    docsQ.isLoading;

  const error =
    visitsQ.error ??
    personQ.error ??
    medsQ.error ??
    eventsQ.error ??
    doctorsQ.error ??
    todosQ.error ??
    docsQ.error ??
    null;

  const person = personQ.data ?? null;

  const input = useMemo(() => {
    if (!person || !visit) return null;
    return {
      person,
      visit,
      medicationGroups: medsQ.data ?? [],
      eventGroups: eventsQ.data ?? [],
      doctors: doctorsQ.data ?? [],
      allVisits: visitsQ.data ?? [],
      todos,
      documents: docsQ.data ?? [],
    };
  }, [person, visit, medsQ.data, eventsQ.data, doctorsQ.data, visitsQ.data, todos, docsQ.data]);

  return { isLoading, error, visit, input };
}
