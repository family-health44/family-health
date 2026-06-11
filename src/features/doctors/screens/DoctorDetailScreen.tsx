// src/features/doctors/components/DoctorDetailScreen.tsx
import { PressableBase } from '@/design-system/components/PressableBase';
import { useState } from 'react';
import { View, Text, ScrollView, Linking, Alert, Modal, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoadingState, ErrorState } from '@/design-system/components/EmptyState';
import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';
import { usePersonDoctors } from '../hooks/usePersonDoctors';
import { updateDoctor } from '../repository/doctors.repository';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';

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

export const DoctorDetailScreen = ({ doctorId, personId }: DoctorDetailScreenProps) => {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { doctors, isLoading, error } = usePersonDoctors(personId);

  if (isLoading) return <LoadingState message="Loading doctor..." />;
  if (error) return <ErrorState message={error.message} />;

  const doctor = doctors.find((d) => d.id === doctorId);
  if (!doctor) return <ErrorState message="Doctor not found." />;

  const handleOpenEdit = () => {
    setEditName(doctor.name);
    setEditType(doctor.type ?? '');
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
    <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}>
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <PressableBase onPress={() => router.back()} accessibilityRole="button" style={(pressed) => ({ opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 4 })}>
          <Text style={{ fontSize: 15, color: '#2A6049' }}>‹</Text>
          <Text style={{ fontSize: 14, color: '#2A6049', fontWeight: '500' }}>Back</Text>
        </PressableBase>
        <PressableBase onPress={handleOpenEdit} accessibilityRole="button" style={(pressed) => ({ width: 32, height: 32, borderRadius: 16, backgroundColor: '#EEEAE3', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
          <Text style={{ fontSize: 14, color: '#6B6460' }}>✎</Text>
        </PressableBase>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4 }}>
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 14, padding: 14, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: showMoreInfo ? 12 : 0 }}>
            <View style={{ width: 46, height: 46, borderRadius: 11, backgroundColor: '#E8EFF8', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Text style={{ fontSize: 20 }}>🩺</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1C1917' }}>{doctor.name}</Text>
              {doctor.type ? <Text style={{ fontSize: 12, color: '#A8A09A', marginTop: 2 }}>{doctor.type}</Text> : null}
            </View>
            <PressableBase onPress={() => setShowMoreInfo(!showMoreInfo)} style={(pressed) => ({ backgroundColor: '#EEEAE3', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, opacity: pressed ? 0.7 : 1 })}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#2A6049' }}>{showMoreInfo ? 'Less Info ↑' : 'More Info ↓'}</Text>
            </PressableBase>
          </View>
          {showMoreInfo && (
            <View style={{ borderTopWidth: 1, borderTopColor: '#F0EDE8', paddingTop: 10, gap: 8 }}>
              {doctor.address ? (
                <View style={{ flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#F0EDE8' }}>
                  <Text style={{ fontSize: 12, color: '#A8A09A', width: 60 }}>Address</Text>
                  <Text style={{ fontSize: 12, color: '#1C1917', flex: 1, textAlign: 'right' }}>{doctor.address}</Text>
                </View>
              ) : null}
              {doctor.phone ? (
                <PressableBase onPress={handlePhone} style={{ flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#F0EDE8' }}>
                  <Text style={{ fontSize: 12, color: '#A8A09A', width: 60 }}>Phone</Text>
                  <Text style={{ fontSize: 12, color: '#2A6049', flex: 1, textAlign: 'right' }}>{doctor.phone}</Text>
                </PressableBase>
              ) : null}
            </View>
          )}
        </View>
        <CollapsibleSection title="Visits" bg="#E8EFF8" border="#C0CFDF" text="#1A3A6B">
          <View style={{ padding: 14 }}><Text style={{ fontSize: 12, color: '#A8A09A', fontStyle: 'italic' }}>No visits with this doctor yet</Text></View>
        </CollapsibleSection>
        <CollapsibleSection title="Notes" bg="#E6F0EC" border="#C0D8CA" text="#1A4D35">
          <View style={{ padding: 14 }}><Text style={{ fontSize: 12, color: '#A8A09A', fontStyle: 'italic' }}>No notes for this doctor yet</Text></View>
        </CollapsibleSection>
        <CollapsibleSection title="Medications Prescribed" bg="#F5EBE0" border="#DEBFAA" text="#7A3A10">
          <View style={{ padding: 14 }}><Text style={{ fontSize: 12, color: '#A8A09A', fontStyle: 'italic' }}>No medications prescribed yet</Text></View>
        </CollapsibleSection>
      </ScrollView>
      <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={() => setShowEditModal(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={() => setShowEditModal(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
            <Pressable>
              <View style={{ backgroundColor: '#F7F5F0', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '85%' }}>
                <View style={{ width: 40, height: 4, backgroundColor: '#D0CCC4', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 20 }} />
                <ScrollView contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
                  <Text style={{ fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 }}>Edit doctor</Text>
                  <Input label="Name" isRequired value={editName} onChangeText={setEditName} autoCapitalize="words" />
                  <Input label="Specialty / Type" placeholder="e.g. GP, Dentist" value={editType} onChangeText={setEditType} autoCapitalize="words" />
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
