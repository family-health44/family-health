// src/features/documents/queries/documents.queries.ts
// TanStack Query wrappers for document reads.

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import { fetchDocumentsByPerson, fetchDocumentsByVisit, fetchAllFamilyDocuments } from '../repository/documents.repository';
import { mapDbDocumentToDocument, sortDocuments } from '../domain/documents.domain';

import type { Document } from '../types/documents.types';

export function usePersonDocumentsQuery(personId: string) {
  return useQuery<Document[], Error>({
    queryKey: queryKeys.documents.byPerson(personId),
    queryFn: async () => {
      const rows = await fetchDocumentsByPerson(personId);
      return sortDocuments(rows.map(mapDbDocumentToDocument));
    },
    enabled: Boolean(personId),
  });
}

export function useVisitDocumentsQuery(visitId: string) {
  return useQuery<Document[], Error>({
    queryKey: queryKeys.documents.byVisit(visitId),
    queryFn: async () => {
      const rows = await fetchDocumentsByVisit(visitId);
      return sortDocuments(rows.map(mapDbDocumentToDocument));
    },
    enabled: Boolean(visitId),
  });
}

// Family-wide storage usage in bytes. The cap is per family group, so the meter
// must not be person-scoped.
export function useFamilyStorageUsedQuery() {
  return useQuery<number, Error>({
    queryKey: queryKeys.documents.familyUsage(),
    queryFn: async () => {
      const rows = await fetchAllFamilyDocuments();
      return rows.reduce((sum, r) => sum + (r.file_size ?? 0), 0);
    },
  });
}
