// src/features/documents/queries/documents.queries.ts
// TanStack Query wrappers for document reads.

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import { fetchDocumentsByPerson } from '../repository/documents.repository';
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
