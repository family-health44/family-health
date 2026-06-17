// src/features/family/components/EditInfoCardModal.tsx
// EditInfoCardModal — edits a person's Info Card (Important Info) fields.
// Deliberately separate from AddPersonModal (which only captures name).
// Local InlinePicker copy matches the established modal pattern (A3 will consolidate).

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { Input } from '@/design-system/components/Input';
import { Button } from '@/design-system/components/Button';
import type { PersonInfoCard } from '../types/family.types';
import type { UpdatePersonInfoParams } from '../repository/family.repository';
import { isoToInputDate, displayToIsoDate } from '@/shared/utils/dates';

const BLOOD_TYPES = ['Unknown', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const InlinePicker = ({ label, options, value, onChange }: {
  label: string;
  options: { id: string | null; label: string }[];
  value: string | null | undefined;
  onChange: (id: string | null) => void;
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === (value ?? null));
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#3D3D3D' }}>{label}</Text>
      <Pressable onPress={() => setOpen(!open)} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: open ? '#2A6049' : '#E3DDD5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 }}>
        <Text style={{ flex: 1, fontSize: 14, color: selected?.id ? '#1C1917' : '#A8A09A' }}>{selected?.label ?? 'Select...'}</Text>
        <Text style={{ color: '#A8A09A', fontSize: 12 }}>{open ? '▲' : '▼'}</Text>
      </Pressable>
      {open && (
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#2A6049', borderRadius: 10, overflow: 'hidden' }}>
          {options.map((opt, i) => (
            <Pressable key={opt.id ?? 'none'} onPress={() => { onChange(opt.id); setOpen(false); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 14, borderBottomWidth: i < options.length - 1 ? 1 : 0, borderBottomColor: '#F0EDE8', backgroundColor: (value ?? null) === opt.id ? '#E6F0EC' : 'white' }}>
              <Text style={{ flex: 1, fontSize: 14, color: (value ?? null) === opt.id ? '#1A4D35' : '#1C1917', fontWeight: (value ?? null) === opt.id ? '600' : '400' }}>{opt.label}</Text>
              {(value ?? null) === opt.id && <Text style={{ color: '#2A6049', fontSize: 14 }}>✓</Text>}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

interface EditInfoCardModalProps {
  visible: boolean;
  isLoading: boolean;
  personName: string;
  initial: PersonInfoCard;
  onSave: (fields: UpdatePersonInfoParams) => Promise<void>;
  onDismiss: () => void;
}

// Empty string in a text field → store null (keeps "Not set" display consistent).
const orNull = (v: string) => (v.trim() === '' ? null : v.trim());

export const EditInfoCardModal = ({
  visible,
  isLoading,
  personName,
  initial,
  onSave,
  onDismiss,
}: EditInfoCardModalProps) => {
  const [dob, setDob] = useState('');
  const [medicare, setMedicare] = useState('');
  const [bloodType, setBloodType] = useState<string | null>(null);
  const [immun, setImmun] = useState<boolean | null>(null);
  const [allergies, setAllergies] = useState('');
  const [diagnoses, setDiagnoses] = useState('');
  const [healthFund, setHealthFund] = useState('');
  const [healthFundNo, setHealthFundNo] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (visible) {
      setDob(isoToInputDate(initial.dob));
      setMedicare(initial.medicareNumber ?? '');
      setBloodType(initial.bloodType ?? null);
      setImmun(initial.immunisationsCurrent);
      setAllergies(initial.allergies ?? '');
      setDiagnoses(initial.diagnoses ?? '');
      setHealthFund(initial.healthFund ?? '');
      setHealthFundNo(initial.healthFundNumber ?? '');
      setEmergencyName(initial.emergencyContact ?? '');
      setEmergencyPhone(initial.emergencyPhone ?? '');
      setNotes(initial.notes ?? '');
    }
  }, [visible, initial]);

  const handleSave = async () => {
    await onSave({
      dob: displayToIsoDate(dob),
      medicare_number: orNull(medicare),
      blood_type: bloodType === 'Unknown' ? null : bloodType,
      immunisations_current: immun,
      allergies: orNull(allergies),
      diagnoses: orNull(diagnoses),
      health_fund: orNull(healthFund),
      health_fund_number: orNull(healthFundNo),
      emergency_contact: orNull(emergencyName),
      emergency_phone: orNull(emergencyPhone),
      notes: orNull(notes),
    });
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss} accessibilityViewIsModal>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={onDismiss} accessibilityLabel="Close modal">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable>
            <View style={{ backgroundColor: '#F7F5F0', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '90%' }}>
              <View style={{ width: 40, height: 4, backgroundColor: '#D0CCC4', borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 }}>Edit info card</Text>
              <Text style={{ fontSize: 12, color: '#A8A09A', marginBottom: 16 }}>{personName}</Text>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingBottom: 8 }}>
                <Input label="Date of birth" placeholder="DD-MM-YYYY" value={dob} onChangeText={setDob} />
                <Input label="Medicare number" placeholder="0000 00000 0" value={medicare} onChangeText={setMedicare} keyboardType="numbers-and-punctuation" />
                <InlinePicker label="Blood type" options={BLOOD_TYPES.map((b) => ({ id: b, label: b }))} value={bloodType ?? 'Unknown'} onChange={setBloodType} />
                <InlinePicker label="Immunisations" options={[{ id: 'yes', label: 'Up to date' }, { id: 'no', label: 'Outstanding' }]} value={immun === null ? null : immun ? 'yes' : 'no'} onChange={(id) => setImmun(id === null ? null : id === 'yes')} />
                <Input label="Allergies" placeholder="e.g. Penicillin, peanuts" value={allergies} onChangeText={setAllergies} multiline />
                <Input label="Diagnoses / conditions" placeholder="e.g. Asthma" value={diagnoses} onChangeText={setDiagnoses} multiline />
                <Input label="Health fund" placeholder="e.g. Bupa" value={healthFund} onChangeText={setHealthFund} />
                <Input label="Health fund number" placeholder="" value={healthFundNo} onChangeText={setHealthFundNo} keyboardType="numbers-and-punctuation" />
                <Input label="Emergency contact" placeholder="e.g. Sarah Mitchell" value={emergencyName} onChangeText={setEmergencyName} />
                <Input label="Emergency phone" placeholder="e.g. 0400 000 000" value={emergencyPhone} onChangeText={setEmergencyPhone} keyboardType="phone-pad" />
                <Input label="Notes" placeholder="Anything else" value={notes} onChangeText={setNotes} multiline />

                <View style={{ marginTop: 8, gap: 12 }}>
                  <Button label="Save changes" variant="primary" size="lg" isFullWidth isLoading={isLoading} onPress={handleSave} />
                  <Button label="Cancel" variant="ghost" size="lg" isFullWidth onPress={onDismiss} />
                </View>
              </ScrollView>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};
