// src/features/doctors/screens/DoctorDetailScreen.tsx
import { PressableBase } from '@/design-system/components/PressableBase';
import { SubScreenHeader } from '@/design-system/components/SubScreenHeader';
import { useState } from 'react';
import { View, Text, ScrollView, Linking, Alert, Modal, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LoadingState, ErrorState } from '@/design-system/components/EmptyState';
import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';
import { InlinePicker } from '@/design-system/components/InlinePicker';
import { SPECIALTY_LIST, SPECIALTY_OPTIONS, OTHER_SPECIALTY } from '../domain/specialties';
import { isoToDisplayDate } from '@/shared/utils/dates';
import { usePersonDoctors } from '../hooks/usePersonDoctors';
import { updateDoctor } from '../repository/doctors.repository';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { useVisitsForCalendarQuery } from '@/features/visits/queries/visits.queries';
import { usePersonNotesQuery } from '@/features/notes/queries/notes.queries';
import { parseNoteContent } from '@/features/notes/domain/notes.domain';
import { usePersonMedicationsQuery } from '@/features/medications/queries/medications.queries';

interface DoctorDetailScreenProps { doctorId: string; personId: string; }

const CollapsibleSection = ({ title, bg, border, text, children }: { title: string; bg: string; border: string; text: string; children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <View style={{ marginBottom: 10 }}>
      <PressableBase onPress={() => setCollapsed(!collapsed)} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: bg, borderWidth: 1.5, borderColor: border, borderTopLeftRadius: 12, borderTopRightRadius: 12, borderBottomLeftRadius: collapsed ? 12 : 0, borderBottomRightRadius: collapsed ? 12 : 0, paddingHorizontal: 14, paddingVertical: 11 }}>
        <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: text }}>{title}</Text>
        <Text style={{ color: border, fontSize: 13 }}>{collapsed ? '∨' : '∧'}</Text>
      </PressableBase>
      {!collapsed && (
        <View style={{ backgroundColor: 'white', borderLeftWidth: 1.5, borderRightWidth: 1.5, borderBottomWidth: 1.5, borderColor: border, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, overflow: 'hidden' }}>
          {children}
        </View>
      )}
    </View>
  );
};

const EmptyRow = ({ text }: { text: string }) => (
  <View style={{ padding: 14 }}><Text style={{ fontSize: 12, color: 'rgba(23,33,28,0.55)', fontStyle: 'italic' }}>{text}</Text></View>
);

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

  if (isLoading) return <LoadingState message="Loading doctor..." />;
  if (error) return <ErrorState message={error.message} />;

  const doctor = doctors.find((d) => d.id === doctorId);
  if (!doctor) return <ErrorState message="Doctor not found." />;

  // Visits with this doctor (this person), newest first
  const doctorVisits = (visitsQuery.data ?? [])
    .filter((v) => v.personId === personId && v.doctorId === doctorId)
    .sort((a, b) => b.visitDate.localeCompare(a.visitDate));

  // Notes linked to this doctor, excluding event-marker notes + hidden, newest first
  const noteText = (content: string) =>
    parseNoteContent(content)
      .filter((seg) => seg.type === 'text')
      .map((seg) => seg.content)
      .join(' ')
      .trim();
  const doctorNotes = notes
    .filter((n) => n.doctorId === doctorId && !n.hidden && noteText(n.content).length > 0)
    .sort((a, b) => (b.noteDate ?? '').localeCompare(a.noteDate ?? ''));

  // Medications prescribed by this doctor (across all status groups)
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
    } catch { Alert.alert('Error', 'Could not save changes.'); }
    finally { setIsSaving(false); }
  };

  const handlePhone = async () => {
    if (!doctor.phone) return;
    const url = `tel:${doctor.phone}`;
    if (await Linking.canOpenURL(url)) await Linking.openURL(url);
    else Alert.alert('Cannot make call', 'Phone calls are not supported on this device.');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}>
      <SubScreenHeader
        title={doctor.name}
        subtitle={doctor.type || undefined}
        right={
          <PressableBase onPress={handleOpenEdit} accessibilityRole="button" style={(pressed) => ({ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
            <Text style={{ fontSize: 14, color: '#FFFFFF' }}>✎</Text>
          </PressableBase>
        }
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 16 }}>
        {(doctor.address || doctor.phone) ? (
        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 14, marginBottom: 12, shadowColor: '#17211C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
          <PressableBase onPress={() => setShowMoreInfo(!showMoreInfo)} style={(pressed) => ({ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: pressed ? 0.7 : 1 })}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#17211C' }}>Contact details</Text>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#1F5C41' }}>{showMoreInfo ? 'Less ↑' : 'More ↓'}</Text>
          </PressableBase>
          {showMoreInfo && (
            <View style={{ borderTopWidth: 0.5, borderTopColor: 'rgba(23,33,28,0.08)', paddingTop: 10, marginTop: 10, gap: 8 }}>
              {doctor.address ? (
                <View style={{ flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: 'rgba(23,33,28,0.08)' }}>
                  <Text style={{ fontSize: 12, color: 'rgba(23,33,28,0.55)', width: 60 }}>Address</Text>
                  <Text style={{ fontSize: 12, color: '#17211C', flex: 1, textAlign: 'right' }}>{doctor.address}</Text>
                </View>
              ) : null}
              {doctor.phone ? (
                <PressableBase onPress={handlePhone} style={{ flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: 'rgba(23,33,28,0.08)' }}>
                  <Text style={{ fontSize: 12, color: 'rgba(23,33,28,0.55)', width: 60 }}>Phone</Text>
                  <Text style={{ fontSize: 12, color: '#1F5C41', flex: 1, textAlign: 'right' }}>{doctor.phone}</Text>
                </PressableBase>
              ) : null}
            </View>
          )}
        </View>
        ) : null}

        <CollapsibleSection title="Visits" bg="#E8EFF8" border="#C0CFDF" text="#1A3A6B">
          {doctorVisits.length === 0 ? (
            <EmptyRow text="No visits with this doctor yet" />
          ) : (
            doctorVisits.map((v, i) => (
              <PressableBase key={v.id} onPress={() => router.push(`/(app)/visits/${v.id}` as never)} style={(pressed) => ({ paddingHorizontal: 14, paddingVertical: 11, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: '#F0EFEA', opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center' })}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, color: '#17211C' }}>{v.title || 'Visit'}</Text>
                  <Text style={{ fontSize: 11, color: 'rgba(23,33,28,0.55)', marginTop: 2 }}>{isoToDisplayDate(v.visitDate)}</Text>
                </View>
                <Text style={{ fontSize: 14, color: '#C8C4BC' }}>›</Text>
              </PressableBase>
            ))
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Notes" bg="#E4EFE9" border="#BFD4C8" text="#17452F">
          {doctorNotes.length === 0 ? (
            <EmptyRow text="No notes for this doctor yet" />
          ) : (
            doctorNotes.map((n, i) => (
              <View key={n.id} style={{ paddingHorizontal: 14, paddingVertical: 11, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: '#F0EFEA' }}>
                <Text style={{ fontSize: 13, color: '#17211C', lineHeight: 18 }}>{noteText(n.content)}</Text>
                {n.noteDate ? <Text style={{ fontSize: 11, color: 'rgba(23,33,28,0.55)', marginTop: 2 }}>{isoToDisplayDate(n.noteDate)}</Text> : null}
              </View>
            ))
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Medications Prescribed" bg="#F5EBE0" border="#DEBFAA" text="#7A3A10">
          {doctorMeds.length === 0 ? (
            <EmptyRow text="No medications prescribed yet" />
          ) : (
            doctorMeds.map((m, i) => (
              <View key={m.id} style={{ paddingHorizontal: 14, paddingVertical: 11, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: '#F0EFEA' }}>
                <Text style={{ fontSize: 13, color: '#17211C' }}>{m.name}</Text>
                {(m.dosage || m.frequency) ? (
                  <Text style={{ fontSize: 11, color: 'rgba(23,33,28,0.55)', marginTop: 2 }}>
                    {[m.dosage, m.frequency].filter(Boolean).join(' · ')}
                  </Text>
                ) : null}
              </View>
            ))
          )}
        </CollapsibleSection>
      </ScrollView>
      <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={() => setShowEditModal(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={() => setShowEditModal(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
            <Pressable>
              <View style={{ backgroundColor: '#F7F7F4', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '85%' }}>
                <View style={{ width: 40, height: 4, backgroundColor: '#D0CCC4', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 20 }} />
                <ScrollView contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
                  <Text style={{ fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 }}>Edit doctor</Text>
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
