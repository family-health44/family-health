// src/lib/queryClient.ts
// TanStack Query client configuration.
// Conservative cache settings for a medical app — stale data could mislead users.
// Query keys are centralised here to prevent cache collisions across features.

import { QueryClient } from '@tanstack/react-query';

import { AppError } from '@/shared/types/errors';

// ─── Query client ─────────────────────────────────────────────────────────────

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 30 seconds — conservative for medical data
      staleTime: 30 * 1000,
      // 5 minutes garbage collection — balances memory vs re-fetch cost
      gcTime: 5 * 60 * 1000,
      // Retry logic — skip retrying auth errors, max 2 retries for others
      retry: (failureCount, error) => {
        if (error instanceof AppError) {
          if (error.code === 'AUTH_ERROR' || error.code === 'FORBIDDEN') return false;
          if (error.code === 'NOT_FOUND') return false;
        }
        return failureCount < 2;
      },
      // Exponential backoff: 1s, 2s (capped)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      // Don't refetch when user switches back to app — avoids jarring data changes
      refetchOnWindowFocus: false,
      // Do refetch when reconnecting after going offline
      refetchOnReconnect: true,
    },
    mutations: {
      // Mutations don't retry by default — avoid duplicate writes to medical records
      retry: false,
    },
  },
});

// ─── Query keys ───────────────────────────────────────────────────────────────
// Centralised factory — import and use these everywhere instead of raw strings.
// Structure: [feature, entity, ...params]
// This makes cache invalidation predictable and refactoring safe.

export const queryKeys = {
  // Family
  family: {
    all: ['family'] as const,
    people: () => [...queryKeys.family.all, 'people'] as const,
    person: (personId: string) => [...queryKeys.family.people(), personId] as const,
  },

  // Doctors
  doctors: {
    all: ['doctors'] as const,
    list: () => [...queryKeys.doctors.all, 'list'] as const,
    byPerson: (personId: string) => [...queryKeys.doctors.all, 'byPerson', personId] as const,
    detail: (doctorId: string) => [...queryKeys.doctors.all, doctorId] as const,
  },

  // Medications
  medications: {
    all: ['medications'] as const,
    byPerson: (personId: string) => [...queryKeys.medications.all, 'byPerson', personId] as const,
    detail: (medicationId: string) => [...queryKeys.medications.all, medicationId] as const,
  },

  // Visits
  visits: {
    all: ['visits'] as const,
    list: () => [...queryKeys.visits.all, 'list'] as const,
    byPerson: (personId: string) => [...queryKeys.visits.all, 'byPerson', personId] as const,
    detail: (visitId: string) => [...queryKeys.visits.all, visitId] as const,
  },

  // Todos
  todos: {
    all: ['todos'] as const,
    list: () => [...queryKeys.todos.all, 'list'] as const,
    byPerson: (personId: string) => [...queryKeys.todos.all, 'byPerson', personId] as const,
  },

  // Notes
  notes: {
    all: ['notes'] as const,
    byPerson: (personId: string) => [...queryKeys.notes.all, 'byPerson', personId] as const,
    byVisit: (visitId: string) => [...queryKeys.notes.all, 'byVisit', visitId] as const,
    byDoctor: (doctorId: string) => [...queryKeys.notes.all, 'byDoctor', doctorId] as const,
    byMedication: (medicationId: string) =>
      [...queryKeys.notes.all, 'byMedication', medicationId] as const,
  },

  // Medical events
  medicalEvents: {
    all: ['medicalEvents'] as const,
    byPerson: (personId: string) =>
      [...queryKeys.medicalEvents.all, 'byPerson', personId] as const,
  },

  // Documents
  documents: {
    all: ['documents'] as const,
    byPerson: (personId: string) => [...queryKeys.documents.all, 'byPerson', personId] as const,
    byVisit: (visitId: string) => [...queryKeys.documents.all, 'byVisit', visitId] as const,
  },
} as const;
