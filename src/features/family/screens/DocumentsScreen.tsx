// src/features/family/screens/DocumentsScreen.tsx
// Documents — list, upload (Files/Photos), view/share, delete for a person.

import { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, Linking } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableBase } from '@/design-system/components/PressableBase';
import { SubScreenHeader } from '@/design-system/components/SubScreenHeader';
import { EmptyState, ErrorState } from '@/design-system/components/EmptyState';

import { usePersonDocumentsQuery } from '@/features/documents/queries/documents.queries';
import {
  useAddDocumentMutation,
  useDeleteDocumentMutation,
  isStorageCapError,
} from '@/features/documents/mutations/documents.mutations';
import { pickFromFiles, pickFromPhotos } from '@/features/documents/hooks/useFilePicker';
import { createSignedUrl } from '@/features/documents/repository/documents.repository';
import {
  formatFileSize,
  totalBytes,
  kindLabel,
} from '@/features/documents/domain/documents.domain';
import { FAMILY_STORAGE_CAP_BYTES, FAMILY_STORAGE_CAP_LABEL, STORAGE_FULL_MESSAGE } from '@/features/documents/types/documents.types';
import type { Document, DocumentKind } from '@/features/documents/types/documents.types';
import { isoToDisplayDate } from '@/shared/utils/dates';
import { LinkDocumentModal } from '@/features/documents/components/LinkDocumentModal';
import type { DocumentLink } from '@/features/documents/components/LinkDocumentModal';
import { useVisitsForCalendarQuery } from '@/features/visits/queries/visits.queries';
import { usePersonDoctorsQuery } from '@/features/doctors/queries/doctors.queries';
import type { PickedFile } from '@/features/documents/types/documents.types';

interface DocumentsScreenProps {
  personId: string;
  personName: string;
}

const KIND_ICON: Record<DocumentKind, string> = {
  pdf: '📕',
  image: '🖼️',
  doc: '📄',
  other: '📎',
};

export const DocumentsScreen = ({ personId, personName }: DocumentsScreenProps) => {
  const insets = useSafeAreaInsets();
  const { data: documents, isLoading, isError, refetch } = usePersonDocumentsQuery(personId);
  const addDoc = useAddDocumentMutation(personId);
  const deleteDoc = useDeleteDocumentMutation(personId);

  const { data: allVisits } = useVisitsForCalendarQuery();
  const { data: personDoctors } = usePersonDoctorsQuery(personId);

  // Pending file — picked, but not uploaded until the link step is confirmed.
  const [pending, setPending] = useState<PickedFile | null>(null);

  const used = totalBytes(documents ?? []);
  const pct = Math.min(100, Math.round((used / FAMILY_STORAGE_CAP_BYTES) * 100));

  // This person's visits, newest first.
  const personVisits = useMemo(
    () =>
      (allVisits ?? [])
        .filter((v) => v.personId === personId)
        .sort((a, b) => b.visitDate.localeCompare(a.visitDate)),
    [allVisits, personId],
  );

  const runPick = useCallback(async (source: 'files' | 'photos') => {
    try {
      const file = source === 'files' ? await pickFromFiles() : await pickFromPhotos();
      if (!file) return;
      setPending(file);
    } catch {
      Alert.alert('Could not add file', 'Please try again.');
    }
  }, []);

  // Upload happens here, after the user has chosen a link (or chosen not to).
  const onConfirmLink = useCallback(
    async (link: DocumentLink) => {
      if (!pending) return;
      try {
        await addDoc.mutateAsync({
          file: pending,
          personId,
          visitId: link.visitId,
          doctorId: link.doctorId,
        });
        setPending(null);
      } catch (error) {
        setPending(null);
        if (isStorageCapError(error)) {
          Alert.alert('Storage full', STORAGE_FULL_MESSAGE);
        } else {
          Alert.alert('Upload failed', 'Could not add the document. Please try again.');
        }
      }
    },
    [addDoc, personId, pending],
  );

  const onAdd = useCallback(() => {
    Alert.alert('Add document', 'Choose a source', [
      { text: 'Files', onPress: () => void runPick('files') },
      { text: 'Photos', onPress: () => void runPick('photos') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [runPick]);

  const onOpen = useCallback(async (doc: Document) => {
    try {
      const url = await createSignedUrl(doc.filePath);
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('Cannot open', 'No app is available to open this file.');
    } catch {
      Alert.alert('Cannot open', 'Could not open the document. Please try again.');
    }
  }, []);

  const onRowMenu = useCallback(
    (doc: Document) => {
      Alert.alert(doc.name, undefined, [
        { text: 'View / share', onPress: () => void onOpen(doc) },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            Alert.alert('Delete document?', `"${doc.name}" will be permanently removed.`, [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                  deleteDoc.mutate(
                    { id: doc.id, file_path: doc.filePath },
                    { onError: () => Alert.alert('Delete failed', 'Could not delete. Please try again.') },
                  );
                },
              },
            ]),
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    },
    [deleteDoc, onOpen],
  );

  const isBusy = addDoc.isPending;

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}>
      <SubScreenHeader title="Documents" subtitle={personName}>
        <View style={{ marginTop: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>
              {(documents?.length ?? 0)} file{(documents?.length ?? 0) === 1 ? '' : 's'} · {formatFileSize(used)} used
            </Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>{FAMILY_STORAGE_CAP_LABEL} limit</Text>
          </View>
          <View style={{ height: 5, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 3, marginTop: 5, overflow: 'hidden' }}>
            <View style={{ width: `${pct}%`, height: '100%', backgroundColor: pct >= 90 ? '#E58080' : '#FFFFFF' }} />
          </View>
        </View>
      </SubScreenHeader>

      {isError ? (
        <ErrorState message="Couldn't load documents." onRetry={() => void refetch()} />
      ) : isLoading ? (
        <ScrollView contentContainerStyle={{ padding: 16, flexGrow: 1, justifyContent: 'center' }}>
          <ActivityIndicator color="#3E7D62" />
        </ScrollView>
      ) : (documents?.length ?? 0) === 0 ? (
        <ScrollView contentContainerStyle={{ padding: 16, flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState title="No documents yet" message="Add a PDF, photo, or file to keep it with this person's records." />
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 100 }}>
          {documents!.map((doc) => (
            <PressableBase
              key={doc.id}
              onPress={() => onRowMenu(doc)}
              accessibilityRole="button"
              accessibilityLabel={doc.name}
              style={(pressed) => ({
                opacity: pressed ? 0.7 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                backgroundColor: '#fff',
                borderWidth: 0.5,
                borderColor: '#E6E2DA',
                borderRadius: 10,
                paddingVertical: 10,
                paddingHorizontal: 12,
                marginBottom: 8,
              })}
            >
              <Text style={{ fontSize: 22 }}>{KIND_ICON[doc.kind]}</Text>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} style={{ fontSize: 14, color: '#17211C' }}>{doc.name}</Text>
                <Text style={{ fontSize: 11, color: 'rgba(23,33,28,0.55)', marginTop: 2 }}>
                  {kindLabel(doc.kind)} · {formatFileSize(doc.fileSize)}
                  {doc.uploadedAt ? ` · ${isoToDisplayDate(doc.uploadedAt.slice(0, 10))}` : ''}
                </Text>
              </View>
              <Text style={{ fontSize: 18, color: 'rgba(23,33,28,0.55)' }}>⋯</Text>
            </PressableBase>
          ))}
        </ScrollView>
      )}

      <View style={{ position: 'absolute', left: 16, right: 16, bottom: insets.bottom + 12 }}>
        <PressableBase
          onPress={onAdd}
          disabled={isBusy}
          accessibilityRole="button"
          accessibilityLabel="Add document"
          style={(pressed) => ({
            opacity: pressed || isBusy ? 0.7 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: '#3E7D62',
            borderRadius: 10,
            paddingVertical: 14,
          })}
        >
          {isBusy ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '500' }}>＋  Add document</Text>
          )}
        </PressableBase>
      </View>

      <LinkDocumentModal
        visible={pending !== null}
        fileName={pending?.name ?? ''}
        visits={personVisits}
        doctors={personDoctors ?? []}
        isSaving={addDoc.isPending}
        onConfirm={(link) => void onConfirmLink(link)}
        onDismiss={() => setPending(null)}
      />
    </View>
  );
};
