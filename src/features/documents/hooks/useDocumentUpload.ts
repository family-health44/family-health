// src/features/documents/hooks/useDocumentUpload.ts
// Shared document pick + upload flow. Owns file picking, the upload mutation,
// and storage-cap / failure alerting so call sites don't duplicate it.
//
// It does NOT own the link-modal step: DocumentsScreen holds a picked file and
// opens LinkDocumentModal before uploading; VisitDetail uploads straight away
// with a fixed visitId. Both share this hook's pick + upload + error handling.

import { useCallback } from 'react';
import { Alert } from 'react-native';

import { useAddDocumentMutation, isStorageCapError } from '../mutations/documents.mutations';
import { pickFromFiles, pickFromPhotos } from './useFilePicker';
import { storageFullMessage, STORAGE_FULL_MESSAGE } from '../types/documents.types';
import type { PickedFile } from '../types/documents.types';

interface UploadLink {
  visitId?: string | null;
  doctorId?: string | null;
}

interface UseDocumentUploadArgs {
  // personId scopes the add-mutation's cache invalidation. Pass null for
  // visit-scoped uploads with no person context.
  personId: string | null;
  // Cap in bytes, for a precise "storage full" message. Omit when the screen
  // doesn't have the cap loaded — a generic message is used instead.
  capBytes?: number;
}

export function useDocumentUpload({ personId, capBytes }: UseDocumentUploadArgs) {
  const addDoc = useAddDocumentMutation(personId);

  // Pick a file. Returns the picked file, or null if cancelled / errored.
  const pick = useCallback(async (source: 'files' | 'photos'): Promise<PickedFile | null> => {
    try {
      return source === 'files' ? await pickFromFiles() : await pickFromPhotos();
    } catch {
      Alert.alert('Could not add file', 'Please try again.');
      return null;
    }
  }, []);

  // Upload a picked file. Handles storage-cap and generic failure with alerts.
  // Returns true on success, false on failure.
  const upload = useCallback(
    async (file: PickedFile, link: UploadLink = {}): Promise<boolean> => {
      try {
        await addDoc.mutateAsync({
          file,
          personId,
          visitId: link.visitId ?? null,
          doctorId: link.doctorId ?? null,
        });
        return true;
      } catch (error) {
        if (isStorageCapError(error)) {
          Alert.alert(
            'Storage full',
            capBytes !== undefined ? storageFullMessage(capBytes) : STORAGE_FULL_MESSAGE,
          );
        } else {
          Alert.alert('Upload failed', 'Could not add the document. Please try again.');
        }
        return false;
      }
    },
    [addDoc, personId, capBytes],
  );

  return { pick, upload, isPending: addDoc.isPending };
}
