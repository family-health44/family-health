// src/features/doctors/screens/DoctorDetailScreen.tsx
import { PressableBase } from '@/design-system/components/PressableBase';
import { SubScreenHeader } from '@/design-system/components/SubScreenHeader';
import { SectionCard, SectionEmpty, type SectionCardTone } from '@/design-system/components/SectionCard';
import { useState } from 'react';
import { View, Text, ScrollView, Linking, Alert, Modal, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LoadingState, ErrorState } from '@/design-system/components/EmptyState';
import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';
import { InlinePicker } from '@/design-system/components/InlinePicker';
import { Type, TextColour, Shadow } from '@/design-system/tokens/typography';
import { SPECIALTY_LIST, SPECIALTY_OPTIONS, OTHER_SPECIALTY } from '../domain/specialties';
import { isoToDisplayDate } from '@/shared/utils/dates';
import { toAppError } from '@/shared/types/errors';
import { usePersonDoctors } from '../hooks/usePersonDoctors';
import { updateDoctor } from '../repository/doctors.repository';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { useVisitsForCalendarQuery } from '@/features/visits/queries/visits.queries';
import { usePersonNotesQuery } from '@/features/notes/queries/notes.queries';
import { parseNoteContent } from '@/features/notes/domain/notes.domain';
import { usePersonMedicationsQuery } from '@/features/medications/queries/medications.queries';
import { Icon } from '@/design-system/components/Icon';

interface DoctorDetailScreenProps { doctorId: string; personId: string; }

const PAGE = '#F4F2EC';
const DIVIDER = 'rgba(23,33,28,0.07)';
const GREEN = '#1F5C41';

// Accent-pill tones per doctor section (decorative grouping).
const VISITS_TONE: SectionCardTone = { pillBg: '#E6F1FB', pillText: '#0C447C' };   // blue
const NOTES_TONE: SectionCardTone = { pillBg: '#EAF3DE', pillText: '#27500A' };    // green
const MEDS_TONE: SectionCardTone = { pillBg: '#F5EBE0', pillText: '#7A3A10' };     // orange/brown

const RowDivider = () => <View style={{ height: 1, backgroundColor: DIVIDER, marginHorizontal: 14 }} />;

export const DoctorDetailScreen = ({ doctorId, personId }: DoctorDetailScreenProps) => {
  const queryClient = useQueryClient();
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('');
  const [editTypeChoice, setEditTypeChoice] = useState<string | null>(null);
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { doctors, isLoading, error } = usePersonDoctors(personId);

  const visitsQuery = useVisitsForCalendarQuery();
  const { data: notes = [] } = usePersonNotesQuery(personId);
  const { data: medGroups = [] } = usePersonMedicationsQuery(personId);

  if (isLoading) return <View style={{ flex: 1, backgroundColor: PAGE }}><LoadingState message="Loading doctor..." /></View>;
  if (error) return <View style={{ flex: 1, backgroundColor: PAGE }}><ErrorState message={error.message} /></View>;

  const doctor = doctors.find((d) => d.id === doctorId);
  if (!doctor) return <View style={{ flex: 1, backgroundColor: PAGE }}><ErrorState message="Doctor not found." /></View>;

  const doctorVisits = (visitsQuery.data ?? [])
    .filter((v) => v.personId === personId && v.doctorId === doctorId)
    .sort((a, b) => b.visitDate.localeCompare(a.visitDate));

  const noteText = (content: string) =>
    parseNoteContent(content)
      .filter((seg) => seg.type === 'text')
      .map((seg) => seg.content)
      .join(' ')
      .trim();
  const doctorNotes = notes
    .filter((n) => n.doctorId === doctorId && !n.hidden && noteText(n.content).length > 0)
    .sort((a, b) => (b.noteDate ?? '').localeCompare(a.noteDate ?? ''));

  const doctorMeds = medGroups
    .flatMap((g) => g.medications)
    .filter((m) => m.prescribedBy === doctorId);

  const handleOpenEdit = () => {
    setEditName(doctor.name);
    const currentType = (doctor.type ?? '').trim();
    const match = SPECIALTY_LIST.find((s) => s.toLowerCase() === currentType.toLowerCase());
    setEditType(match ?? currentType);
    setEditTypeChoice(currentType ? (match ?? OTHER_SPECIALTY) : null);
    setEditPhone(doctor.phone ?? '');
    setEditAddress(doctor.address ?? '');
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) return;
    setIsSaving(true);
    try {
      await updateDoctor({ doctorId, name: editName.trim(), type: editType.trim() || null, phone: editPhone.trim() || null, address: editAddress.trim() || null });
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.byPerson(personId) });
      setShowEditModal(false);
    } catch (e) { Alert.alert('Could not save', toAppError(e).message); }
    finally { setIsSaving(false); }
  };

  const handlePhone = async () => {
    if (!doctor.phone) return;
    const url = `tel:${doctor.phone}`;
    if (await Linking.canOpenURL(url)) await Linking.openURL(url);
    else Alert.alert('Cannot make call', 'Phone calls are not supported on this device.');
  };

  return (
    <View style={{ flex: 1, backgroundColor: PAGE }}>
      <SubScreenHeader
        title={doctor.name}
        subtitle={doctor.type || undefined}
        right={
          <PressableBase onPress={handleOpenEdit} accessibilityRole="button" accessibilityLabel="Edit doctor" style={(pressed) => ({ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
            <Text style={{ fontSize: 14, color: '#FFFFFF' }}>✎</Text>
          </PressableBase>
        }
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 16 }}>
        {(doctor.address || doctor.phone) ? (
        <View style={{ backgroundColor: 'white', borderRadius: 14, padding: 14, marginBottom: 12, ...Shadow.resting }}>
          <PressableBase onPress={() => setShowMoreInfo(!showMoreInfo)} accessibilityRole="button" style={(pressed) => ({ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: pressed ? 0.7 : 1 })}>
            <Text style={{ ...Type.label, color: TextColour.ink }}>Contact details</Text>
            <Text style={{ ...Type.micro, letterSpacing: 0, color: GREEN }}>{showMoreInfo ? 'Less ↑' : 'More ↓'}</Text>
          </PressableBase>
          {showMoreInfo && (
            <View style={{ paddingTop: 10, marginTop: 10, gap: 8 }}>
              <View style={{ height: 1, backgroundColor: DIVIDER, marginTop: -10 }} />
              {doctor.address ? (
                <View style={{ flexDirection: 'row', paddingVertical: 4 }}>
                  <Text style={{ ...Type.caption, fontWeight: '400', color: TextColour.muted, width: 60 }}>Address</Text>
                  <Text style={{ ...Type.caption, fontWeight: '400', color: TextColour.ink, flex: 1, textAlign: 'right' }}>{doctor.address}</Text>
                </View>
              ) : null}
              {doctor.phone ? (
                <PressableBase onPress={handlePhone} accessibilityRole="button" accessibilityLabel={`Call ${doctor.phone}`} style={{ flexDirection: 'row', paddingVertical: 4 }}>
                  <Text style={{ ...Type.caption, fontWeight: '400', color: TextColour.muted, width: 60 }}>Phone</Text>
                  <Text style={{ ...Type.caption, fontWeight: '400', color: GREEN, flex: 1, textAlign: 'right' }}>{doctor.phone}</Text>
                </PressableBase>
              ) : null}
            </View>
          )}
        </View>
        ) : null}

        <SectionCard title="Visits" tone={VISITS_TONE}>
          {doctorVisits.length === 0 ? (
            <SectionEmpty text="No visits with this doctor yet" />
          ) : (
            doctorVisits.map((v, i) => (
              <View key={v.id}>
                {i > 0 && <RowDivider />}
                <PressableBase onPress={() => router.push(`/(app)/visits/${v.id}` as never)} accessibilityRole="button" style={(pressed) => ({ paddingHorizontal: 14, paddingVertical: 12, opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center' })}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...Type.label, fontWeight: '400', color: TextColour.ink }}>{v.title || 'Visit'}</Text>
                    <Text style={{ ...Type.caption, fontWeight: '400', color: TextColour.muted, marginTop: 2 }}>{isoToDisplayDate(v.visitDate)}</Text>
                  </View>
                  <Icon name="chevron.right" size={13} color={TextColour.faint} weight="semibold" />
                </PressableBase>
              </View>
            ))
          )}
        </SectionCard>

        <SectionCard title="Notes" tone={NOTES_TONE}>
          {doctorNotes.length === 0 ? (
            <SectionEmpty text="No notes for this doctor yet" />
          ) : (
            doctorNotes.map((n, i) => (
              <View key={n.id}>
                {i > 0 && <RowDivider />}
                <View style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
                  <Text style={{ ...Type.label, fontWeight: '400', color: TextColour.ink, lineHeight: 18 }}>{noteText(n.content)}</Text>
                  {n.noteDate ? <Text style={{ ...Type.caption, fontWeight: '400', color: TextColour.muted, marginTop: 2 }}>{isoToDisplayDate(n.noteDate)}</Text> : null}
                </View>
              </View>
            ))
          )}
        </SectionCard>

        <SectionCard title="Medications Prescribed" tone={MEDS_TONE}>
          {doctorMeds.length === 0 ? (
            <SectionEmpty text="No medications prescribed yet" />
          ) : (
            doctorMeds.map((m, i) => (
              <View key={m.id}>
                {i > 0 && <RowDivider />}
                <View style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
                  <Text style={{ ...Type.label, fontWeight: '400', color: TextColour.ink }}>{m.name}</Text>
                  {(m.dosage || m.frequency) ? (
                    <Text style={{ ...Type.caption, fontWeight: '400', color: TextColour.muted, marginTop: 2 }}>
                      {[m.dosage, m.frequency].filter(Boolean).join(' · ')}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </SectionCard>
      </ScrollView>
      <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={() => setShowEditModal(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={() => setShowEditModal(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
            <Pressable>
              <View style={{ backgroundColor: PAGE, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '85%', ...Shadow.modal }}>
                <View style={{ width: 40, height: 4, backgroundColor: '#D0CCC4', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 20 }} />
                <ScrollView contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
                  <Text style={{ ...Type.title, color: TextColour.ink, marginBottom: 4 }}>Edit doctor</Text>
                  <Input label="Name" isRequired value={editName} onChangeText={setEditName} autoCapitalize="words" />
                  <InlinePicker label="Specialty / Type" options={SPECIALTY_OPTIONS} value={editTypeChoice}
                    onChange={(id) => { setEditTypeChoice(id); setEditType(id && id !== OTHER_SPECIALTY ? id : ''); }} />
                  {editTypeChoice === OTHER_SPECIALTY ? (
                    <Input label="Specialty (other)" placeholder="e.g. Vascular surgeon" value={editType} onChangeText={setEditType} autoCapitalize="words" />
                  ) : null}
                  <Input label="Phone" placeholder="e.g. 02 1234 5678" value={editPhone} onChangeText={setEditPhone} keyboardType="phone-pad" />
                  <Input label="Address" placeholder="Practice address" value={editAddress} onChangeText={setEditAddress} autoCapitalize="words" multiline numberOfLines={2} />
                  <View style={{ gap: 12, marginTop: 8 }}>
                    <Button label="Save changes" variant="primary" size="lg" isFullWidth isLoading={isSaving} onPress={handleSaveEdit} />
                    <Button label="Cancel" variant="ghost" size="lg" isFullWidth onPress={() => setShowEditModal(false)} />
                  </View>
                </ScrollView>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
};
