// src/features/notes/components/NoteModal.tsx
import { useEffect } from 'react';
import { View, Text, Modal, Pressable, KeyboardAvoidingView, Platform, ScrollView, Switch } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';
import type { Note, NoteFormValues } from '../types/notes.types';
import type { Doctor } from '@/features/doctors/types/doctors.types';
import type { Medication } from '@/features/medications/types/medications.types';

const schema = z.object({
  content: z.string().min(1, 'Note content is required').max(5000),
  doctorId: z.string().nullable(),
  medicationId: z.string().nullable(),
  hidden: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

interface NoteModalProps {
  visible: boolean;
  isLoading: boolean;
  editingNote: Note | null;
  doctors: Doctor[];
  medications: Medication[];
  onSave: (values: NoteFormValues) => Promise<void>;
  onDismiss: () => void;
}

export const NoteModal = ({ visible, isLoading, editingNote, doctors, medications, onSave, onDismiss }: NoteModalProps) => {
  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { content: '', doctorId: null, medicationId: null, hidden: false },
  });
  const selectedDoctorId = watch('doctorId');
  const selectedMedicationId = watch('medicationId');

  useEffect(() => {
    if (editingNote) {
      reset({ content: editingNote.content, doctorId: editingNote.doctorId, medicationId: editingNote.medicationId, hidden: editingNote.hidden });
    } else {
      reset({ content: '', doctorId: null, medicationId: null, hidden: false });
    }
  }, [editingNote, reset, visible]);

  const onSubmit = async (values: FormValues) => { await onSave(values); reset(); };

  const DropdownRow = ({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) => (
    <Pressable onPress={onSelect} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#F0EDE8', backgroundColor: selected ? '#E6F0EC' : 'white' }}>
      <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: selected ? '#2A6049' : '#C8C4BC', backgroundColor: selected ? '#2A6049' : 'white', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
        {selected && <Text style={{ color: 'white', fontSize: 10 }}>✓</Text>}
      </View>
      <Text style={{ fontSize: 14, color: selected ? '#1A4D35' : '#1C1917', fontWeight: selected ? '600' : '400', flex: 1 }}>{label}</Text>
    </Pressable>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={onDismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable>
            <View style={{ backgroundColor: '#F7F5F0', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '92%' }}>
              <View style={{ width: 40, height: 4, backgroundColor: '#D0CCC4', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 20 }} />
              <ScrollView contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 }}>{editingNote ? 'Edit note' : 'Add note'}</Text>

                <Controller control={control} name="content" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Note" isRequired placeholder="Write your note here..." autoCapitalize="sentences"
                    multiline numberOfLines={6} style={{ minHeight: 120, textAlignVertical: 'top' }}
                    value={value} onChangeText={onChange} onBlur={onBlur} error={errors.content?.message} />
                )} />

                {doctors.length > 0 && (
                  <View style={{ gap: 6 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#3D3D3D' }}>Link to doctor (optional)</Text>
                    <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 12, overflow: 'hidden' }}>
                      <DropdownRow label="None" selected={!selectedDoctorId} onSelect={() => setValue('doctorId', null)} />
                      {doctors.map((doc) => (
                        <DropdownRow key={doc.id} label={doc.name + (doc.type ? ` — ${doc.type}` : '')} selected={selectedDoctorId === doc.id} onSelect={() => setValue('doctorId', doc.id)} />
                      ))}
                    </View>
                  </View>
                )}

                {medications.length > 0 && (
                  <View style={{ gap: 6 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#3D3D3D' }}>Link to medication (optional)</Text>
                    <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 12, overflow: 'hidden' }}>
                      <DropdownRow label="None" selected={!selectedMedicationId} onSelect={() => setValue('medicationId', null)} />
                      {medications.map((med) => (
                        <DropdownRow key={med.id} label={med.name + (med.dosage ? ` ${med.dosage}` : '')} selected={selectedMedicationId === med.id} onSelect={() => setValue('medicationId', med.id)} />
                      ))}
                    </View>
                  </View>
                )}

                <Controller control={control} name="hidden" render={({ field: { onChange, value } }) => (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#3D3D3D' }}>Hide note</Text>
                      <Text style={{ fontSize: 12, color: '#6B6866', marginTop: 2 }}>Hidden notes are not shown by default</Text>
                    </View>
                    <Switch value={value} onValueChange={onChange} trackColor={{ false: '#D0CCC4', true: '#2A6049' }} thumbColor="#FFFFFF" />
                  </View>
                )} />

                <View style={{ gap: 12, marginTop: 8 }}>
                  <Button label={editingNote ? 'Save changes' : 'Add note'} variant="primary" size="lg" isFullWidth isLoading={isLoading} onPress={handleSubmit(onSubmit)} />
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
