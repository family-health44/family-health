// src/features/visits/screens/VisitDetailScreen.tsx
// Visit detail. Pre/post notes + costs are inline-editable (save on blur).
// Title/date/time/doctor are edited via the ✎ modal.
import { PressableBase } from '@/design-system/components/PressableBase';
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Linking, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LoadingState, ErrorState } from '@/design-system/components/EmptyState';
import { SubScreenHeader } from '@/design-system/components/SubScreenHeader';
import { Type, TextColour, Shadow } from '@/design-system/tokens/typography';
import { usePlus } from '@/core/entitlements/useEntitlement';
import { useVisitsListQuery } from '../queries/visits.queries';
import { useUpdateVisitMutation, useDeleteVisitMutation } from '../mutations/visits.mutations';
import { useDoctorsQuery } from '@/features/doctors/queries/doctors.queries';
import { useVisitDocumentsQuery } from '@/features/documents/queries/documents.queries';
import { useAddDocumentMutation, isStorageCapError } from '@/features/documents/mutations/documents.mutations';
import { pickFromFiles, pickFromPhotos } from '@/features/documents/hooks/useFilePicker';
import { createSignedUrl } from '@/features/documents/repository/documents.repository';
import { formatFileSize } from '@/features/documents/domain/documents.domain';
import type { Document } from '@/features/documents/types/documents.types';
import { EditVisitModal } from '../components/EditVisitModal';
import { formatDate, formatTime, todayISO } from '@/shared/utils/dates';
import { toAppError } from '@/shared/types/errors';
import type { Visit } from '../types/visits.types';

interface VisitDetailScreenProps {
  visitId: string;
}

const PAGE = '#F4F2EC';
const DIVIDER = 'rgba(23,33,28,0.07)';
const GREEN = '#1F5C41';

const parseCost = (raw: string): number | null => {
  const t = raw.trim();
  if (!t) return null;
  const n = Number(t.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : null;
};

const costToText = (n: number | null): string => (n == null ? '' : String(n));

const SectionLabel = ({ text }: { text: string }) => (
  <Text style={{ ...Type.micro, textTransform: 'uppercase', color: TextColour.faint, marginBottom: 8 }}>{text}</Text>
);
const DividerLine = () => <View style={{ height: 1, backgroundColor: DIVIDER, marginHorizontal: 14 }} />;

export const VisitDetailScreen = ({ visitId }: VisitDetailScreenProps) => {
  const { from, personId: fromPersonId } = useLocalSearchParams<{ from?: string; personId?: string }>();
  const handleBack = () => {
    if (from === 'snapshot' && fromPersonId) router.navigate(`/(app)/family/${fromPersonId}/snapshot` as never);
    else router.navigate('/(app)/visits');
  };
  const { data: groups, isLoading, error } = useVisitsListQuery();
  const { data: doctorGroups } = useDoctorsQuery();
  const updateVisit = useUpdateVisitMutation();
  const deleteVisit = useDeleteVisitMutation();
  const { data: visitDocuments } = useVisitDocumentsQuery(visitId);
  const addDoc = useAddDocumentMutation(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const doctors = (doctorGroups ?? []).flatMap((g) => g.doctors);
  const isPlus = usePlus();

  const visit = groups?.flatMap((g) => g.visits).find((v) => v.id === visitId);

  const [preNotes, setPreNotes] = useState('');
  const [postNotes, setPostNotes] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [outOfPocket, setOutOfPocket] = useState('');

  useEffect(() => {
    if (visit) {
      setPreNotes(visit.preNotes ?? '');
      setPostNotes(visit.postNotes ?? '');
      setTotalCost(costToText(visit.totalCost));
      setOutOfPocket(costToText(visit.outOfPocket));
    }
  }, [visit?.id]);

  if (isLoading) return <View style={{ flex: 1, backgroundColor: PAGE }}><LoadingState message="Loading visit..." /></View>;
  if (error) return <View style={{ flex: 1, backgroundColor: PAGE }}><ErrorState message={error.message} /></View>;
  if (!visit) return <View style={{ flex: 1, backgroundColor: PAGE }}><ErrorState message="Visit not found." /></View>;

  const v = visit;

  const today = todayISO();
  const isUpcoming = v.visitDate >= today;

  const persist = async (patch: Partial<Pick<Visit, 'preNotes' | 'postNotes' | 'totalCost' | 'outOfPocket'>>) => {
    try {
      await updateVisit.mutateAsync({
        visitId: v.id,
        title: v.title,
        visitDate: v.visitDate,
        visitTime: v.visitTime,
        doctorId: v.doctorId,
        preNotes: patch.preNotes !== undefined ? patch.preNotes : v.preNotes,
        postNotes: patch.postNotes !== undefined ? patch.postNotes : v.postNotes,
        totalCost: patch.totalCost !== undefined ? patch.totalCost : v.totalCost,
        outOfPocket: patch.outOfPocket !== undefined ? patch.outOfPocket : v.outOfPocket,
      });
    } catch {
      Alert.alert('Error', 'Could not save changes.');
    }
  };

  const handleSaveEdit = async (input: {
    title: string;
    visitDate: string;
    visitTime: string | null;
    doctorId: string | null;
    preNotes: string | null;
    postNotes: string | null;
    totalCost: number | null;
    outOfPocket: number | null;
  }) => {
    try {
      await updateVisit.mutateAsync({ visitId: v.id, ...input });
      setShowEditModal(false);
    } catch {
      Alert.alert('Error', 'Could not save changes.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteVisit.mutateAsync(v.id);
      setShowEditModal(false);
      router.navigate('/(app)/visits');
    } catch (e) {
      Alert.alert('Could not delete', toAppError(e).message);
    }
  };

  const runUpload = async (source: 'files' | 'photos') => {
    try {
      const file = source === 'files' ? await pickFromFiles() : await pickFromPhotos();
      if (!file) return;
      await addDoc.mutateAsync({ file, personId: v.personId ?? null, visitId: v.id });
    } catch (e) {
      if (isStorageCapError(e)) Alert.alert('Storage full', 'This family has reached the 50 MB limit. Delete a file to add more.');
      else Alert.alert('Upload failed', 'Could not add the document. Please try again.');
    }
  };

  const handleAddDocument = () => {
    Alert.alert('Add document', 'Choose a source', [
      { text: 'Files', onPress: () => void runUpload('files') },
      { text: 'Photos', onPress: () => void runUpload('photos') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openDocument = async (doc: Document) => {
    try {
      const url = await createSignedUrl(doc.filePath);
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('Cannot open', 'No app is available to open this file.');
    } catch {
      Alert.alert('Cannot open', 'Could not open the document. Please try again.');
    }
  };

  const detailRow = { flexDirection: 'row' as const, paddingVertical: 13, paddingHorizontal: 14, alignItems: 'center' as const };
  const inlineInputStyle = { ...Type.body, fontSize: 14, color: TextColour.ink, padding: 0, margin: 0 } as const;
  const costInputStyle = { ...Type.label, color: TextColour.ink, fontWeight: '500' as const, textAlign: 'right' as const, minWidth: 80, padding: 0 };

  return (
    <View style={{ flex: 1, backgroundColor: PAGE }}>
      <SubScreenHeader
        title={v.title}
        subtitle={`${formatDate(v.visitDate)}${v.visitTime ? ` at ${formatTime(v.visitTime)}` : ''} · ${isUpcoming ? 'Upcoming' : 'Past'}`}
        onBack={handleBack}
        right={
          <PressableBase onPress={() => setShowEditModal(true)} accessibilityRole="button" accessibilityLabel="Edit visit" style={(pressed) => ({ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
            <Text style={{ fontSize: 14, color: '#FFFFFF' }}>✎</Text>
          </PressableBase>
        }
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 16, paddingBottom: 170 }} keyboardShouldPersistTaps="handled">
        <SectionLabel text="Details" />
        <View style={{ backgroundColor: 'white', borderRadius: 14, overflow: 'hidden', marginBottom: 18, ...Shadow.resting }}>
          <View style={detailRow}>
            <Text style={{ ...Type.label, fontWeight: '400', color: TextColour.muted, flex: 1 }}>Date</Text>
            <Text style={{ ...Type.label, color: TextColour.ink }}>{formatDate(v.visitDate)}{v.visitTime ? ` at ${formatTime(v.visitTime)}` : ''}</Text>
          </View>
          <DividerLine />
          <View style={detailRow}>
            <Text style={{ ...Type.label, fontWeight: '400', color: TextColour.muted, flex: 1 }}>Person</Text>
            <Text style={{ ...Type.label, color: TextColour.ink }}>{v.personName}</Text>
          </View>
          {v.doctorName ? (
            <>
              <DividerLine />
              <View style={detailRow}>
                <Text style={{ ...Type.label, fontWeight: '400', color: TextColour.muted, flex: 1 }}>Doctor</Text>
                <Text style={{ ...Type.label, color: TextColour.ink }}>{v.doctorName}</Text>
              </View>
            </>
          ) : null}
          <DividerLine />
          <View style={detailRow}>
            <Text style={{ ...Type.label, fontWeight: '400', color: TextColour.muted, flex: 1 }}>Total cost</Text>
            <Text style={{ ...Type.label, fontWeight: '400', color: TextColour.muted }}>$</Text>
            <TextInput value={totalCost} onChangeText={setTotalCost} onBlur={() => persist({ totalCost: parseCost(totalCost) })} placeholder="0.00" placeholderTextColor="#C8C4BC" keyboardType="decimal-pad" style={costInputStyle} />
          </View>
          <DividerLine />
          <View style={detailRow}>
            <Text style={{ ...Type.label, fontWeight: '400', color: TextColour.muted, flex: 1 }}>Out of pocket</Text>
            <Text style={{ ...Type.label, fontWeight: '400', color: TextColour.muted }}>$</Text>
            <TextInput value={outOfPocket} onChangeText={setOutOfPocket} onBlur={() => persist({ outOfPocket: parseCost(outOfPocket) })} placeholder="0.00" placeholderTextColor="#C8C4BC" keyboardType="decimal-pad" style={costInputStyle} />
          </View>
        </View>

        <SectionLabel text="Pre-Appointment Notes" />
        <View style={{ backgroundColor: 'white', borderRadius: 14, padding: 15, marginBottom: 18, ...Shadow.resting }}>
          <TextInput value={preNotes} onChangeText={setPreNotes} onBlur={() => persist({ preNotes: preNotes.trim() || null })} placeholder="What to discuss, questions to ask..." placeholderTextColor="#8B928E" multiline style={{ ...inlineInputStyle, lineHeight: 20, minHeight: 40, textAlignVertical: 'top' }} />
        </View>

        <SectionLabel text="Post-Appointment Notes" />
        <View style={{ backgroundColor: 'white', borderRadius: 14, padding: 15, marginBottom: 18, ...Shadow.resting }}>
          <TextInput value={postNotes} onChangeText={setPostNotes} onBlur={() => persist({ postNotes: postNotes.trim() || null })} placeholder="Outcomes, follow-ups, results..." placeholderTextColor="#8B928E" multiline style={{ ...inlineInputStyle, lineHeight: 20, minHeight: 40, textAlignVertical: 'top' }} />
        </View>

        {(visitDocuments && visitDocuments.length > 0) ? (
          <View style={{ backgroundColor: 'white', borderRadius: 14, overflow: 'hidden', marginBottom: 12, ...Shadow.resting }}>
            {visitDocuments.map((doc, i) => (
              <View key={doc.id}>
                {i > 0 && <DividerLine />}
                <PressableBase onPress={() => void openDocument(doc)} accessibilityRole="button" accessibilityLabel={doc.name} style={(pressed) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: pressed ? '#F7F7F4' : 'white' })}>
                  <Text style={{ fontSize: 20 }}>📄</Text>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text numberOfLines={1} style={{ ...Type.body, fontSize: 14, color: TextColour.ink }}>{doc.name}</Text>
                    <Text style={{ ...Type.caption, fontWeight: '400', color: TextColour.muted, marginTop: 2 }}>{formatFileSize(doc.fileSize)}</Text>
                  </View>
                  <Text style={{ fontSize: 16, color: TextColour.faint }}>↗</Text>
                </PressableBase>
              </View>
            ))}
          </View>
        ) : null}
        <PressableBase onPress={handleAddDocument} disabled={addDoc.isPending} accessibilityRole="button" style={(pressed) => ({ opacity: addDoc.isPending ? 0.6 : 1, backgroundColor: pressed ? '#DDE8F5' : '#E8EFF8', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 })}>
          <Text style={{ fontSize: 18 }}>📄</Text>
          <Text style={{ ...Type.body, fontSize: 14, fontWeight: '500', color: '#2C5282' }}>{addDoc.isPending ? 'Adding…' : 'Add Document'}</Text>
        </PressableBase>
      </ScrollView>

      <View style={{ position: 'absolute', bottom: 24, left: 16, right: 16, gap: 10 }}>
        {isPlus && (
          <PressableBase
            onPress={() => router.push(`/(app)/appointment-pack?visitId=${v.id}` as never)}
            accessibilityRole="button"
            accessibilityLabel="Create appointment pack"
            style={(pressed) => ({ backgroundColor: pressed ? '#F0EEE7' : '#FFFFFF', borderRadius: 24, padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, ...Shadow.resting })}
          >
            <Text style={{ fontSize: 15 }}>📄</Text>
            <Text style={{ ...Type.heading, color: GREEN }}>Appointment Pack</Text>
          </PressableBase>
        )}

        {isUpcoming && (
          <PressableBase
            onPress={() => router.push(`/(app)/appointments?visitId=${v.id}&personId=${v.personId ?? ''}&personName=${encodeURIComponent(v.personName ?? '')}&doctorName=${encodeURIComponent(v.doctorName ?? '')}&visitDate=${v.visitDate}&preNotes=${encodeURIComponent(v.preNotes ?? '')}` as never)}
            accessibilityRole="button"
            style={(pressed) => ({ backgroundColor: pressed ? '#17452F' : GREEN, borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, ...Shadow.raised })}
          >
            <Text style={{ fontSize: 16, color: 'white' }}>▶</Text>
            <Text style={{ ...Type.heading, color: 'white' }}>Start Appointment</Text>
          </PressableBase>
        )}
      </View>

      <EditVisitModal visible={showEditModal} isLoading={updateVisit.isPending} visit={v} doctors={doctors} onSave={handleSaveEdit} onDismiss={() => setShowEditModal(false)} onDelete={handleDelete} isDeleting={deleteVisit.isPending} />
    </View>
  );
};
