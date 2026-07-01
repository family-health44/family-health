// src/features/documents/mutations/documents.mutations.ts
// TanStack mutations for document writes.
// Documents are NOT offline-queued: binary uploads can't be serialised into the
// JSON write-queue. Direct mutations only (consistent with deferred offline Tier 2).

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import { fetchFamilyGroup } from '@/features/family/repository/family.repository';
import { uploadDocument, deleteDocument } from '../repository/documents.repository';

import type { DbDocument } from '@/shared/types/database';
import type { PickedFile } from '../types/documents.types';

export interface AddDocumentInput {
  file: PickedFile;
  personId: string | null;
  visitId?: string | null;
  doctorId?: string | null;
}

export function useAddDocumentMutation(personId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddDocumentInput) => {
      const group = await fetchFamilyGroup();
      if (!group) throw new Error('No family group found.');
      return uploadDocument({
        file: input.file,
        personId: input.personId,
        visitId: input.visitId ?? null,
        doctorId: input.doctorId ?? null,
        familyGroupId: group.id,
      });
    },
    onSuccess: (_data, input) => {
      if (input.personId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.documents.byPerson(input.personId) });
      }
      if (input.visitId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.documents.byVisit(input.visitId) });
      }
    },
  });
}

export function useDeleteDocumentMutation(personId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (doc: Pick<DbDocument, 'id' | 'file_path'>) => deleteDocument(doc),
    onSuccess: () => {
      if (personId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.documents.byPerson(personId) });
      }
    },
  });
}

// True when an error is the 50 MB per-family cap trigger firing.
export function isStorageCapError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error ?? '');
  return msg.includes('STORAGE_CAP_EXCEEDED');
}
