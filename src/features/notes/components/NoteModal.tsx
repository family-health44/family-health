// src/features/notes/components/NoteModal.tsx
// Add/edit modal for notes — large text area with doctor and medication linking.
// Doctors and medications passed in as props — fetched by parent hook.

import { useEffect } from 'react';
import {
  View, Text, Modal, Pressable,
  KeyboardAvoidingView, Platform, ScrollView, Switch,
} from 'react-native';
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

export const NoteModal = ({
  visible, isLoading, editingNote,
  doctors, medications,
  onSave, onDismiss,
}: NoteModalProps) => {
  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: { content: '', doctorId: null, medicationId: null, hidden: false },
    });

  const selectedDoctorId = watch('doctorId');
  const selectedMedicationId = watch('medicationId');

  // Populate form when editing an existing note
  useEffect(() => {
    if (editingNote) {
      reset({
        content: editingNote.content,
        doctorId: editingNote.doctorId,
        medicationId: editingNote.medicationId,
        hidden: editingNote.hidden,
      });
    } else {
      reset({ content: '', doctorId: null, medicationId: null, hidden: false });
    }
  }, [editingNote, reset, visible]);

  const onSubmit = async (values: FormValues) => {
    await onSave(values);
    reset();
  };

  const title = editingNote ? 'Edit note' : 'Add note';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
        onPress={onDismiss}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <Pressable>
            <View style={{
              backgroundColor: '#F7F5F0',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: Platform.OS === 'ios' ? 40 : 24,
              maxHeight: '92%',
            }}>
              <View style={{
                width: 40, height: 4, backgroundColor: '#D0CCC4',
                borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 20,
              }} />

              <ScrollView
                contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 }}>
                  {title}
                </Text>

                {/* Note content */}
                <Controller control={control} name="content" render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Note"
                    isRequired
                    placeholder="Write your note here..."
                    autoCapitalize="sentences"
                    multiline
                    numberOfLines={6}
                    style={{ minHeight: 120, textAlignVertical: 'top' }}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.content?.message}
                  />
                )} />

                {/* Doctor linking */}
                {doctors.length > 0 && (
                  <View style={{ gap: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#3D3D3D' }}>
                      Link to doctor (optional)
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
                      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 4 }}>
                        <Pressable
                          onPress={() => setValue('doctorId', null)}
                          style={{
                            paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
                            borderWidth: 1,
                            borderColor: !selectedDoctorId ? '#2A6049' : '#C8C4BC',
                            backgroundColor: !selectedDoctorId ? '#E6F0EC' : 'transparent',
                          }}
                        >
                          <Text style={{ fontSize: 13, color: !selectedDoctorId ? '#1A4D35' : '#6B6866' }}>
                            None
                          </Text>
                        </Pressable>
                        {doctors.map((doc) => (
                          <Pressable
                            key={doc.id}
                            onPress={() => setValue('doctorId', doc.id)}
                            style={{
                              paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
                              borderWidth: 1,
                              borderColor: selectedDoctorId === doc.id ? '#2A6049' : '#C8C4BC',
                              backgroundColor: selectedDoctorId === doc.id ? '#E6F0EC' : 'transparent',
                            }}
                          >
                            <Text style={{ fontSize: 13, color: selectedDoctorId === doc.id ? '#1A4D35' : '#4A4744' }}>
                              {doc.name}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}

                {/* Medication linking */}
                {medications.length > 0 && (
                  <View style={{ gap: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#3D3D3D' }}>
                      Link to medication (optional)
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
                      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 4 }}>
                        <Pressable
                          onPress={() => setValue('medicationId', null)}
                          style={{
                            paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
                            borderWidth: 1,
                            borderColor: !selectedMedicationId ? '#2A6049' : '#C8C4BC',
                            backgroundColor: !selectedMedicationId ? '#E6F0EC' : 'transparent',
                          }}
                        >
                          <Text style={{ fontSize: 13, color: !selectedMedicationId ? '#1A4D35' : '#6B6866' }}>
                            None
                          </Text>
                        </Pressable>
                        {medications.map((med) => (
                          <Pressable
                            key={med.id}
                            onPress={() => setValue('medicationId', med.id)}
                            style={{
                              paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
                              borderWidth: 1,
                              borderColor: selectedMedicationId === med.id ? '#2A6049' : '#C8C4BC',
                              backgroundColor: selectedMedicationId === med.id ? '#E6F0EC' : 'transparent',
                            }}
                          >
                            <Text style={{ fontSize: 13, color: selectedMedicationId === med.id ? '#1A4D35' : '#4A4744' }}>
                              {med.name}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}

                {/* Hidden toggle */}
                <Controller control={control} name="hidden" render={({ field: { onChange, value } }) => (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#3D3D3D' }}>
                        Hide note
                      </Text>
                      <Text style={{ fontSize: 12, color: '#6B6866', marginTop: 2 }}>
                        Hidden notes are not shown by default
                      </Text>
                    </View>
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      trackColor={{ false: '#D0CCC4', true: '#2A6049' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                )} />

                <View style={{ gap: 12, marginTop: 8 }}>
                  <Button
                    label={editingNote ? 'Save changes' : 'Add note'}
                    variant="primary" size="lg" isFullWidth
                    isLoading={isLoading}
                    onPress={handleSubmit(onSubmit)}
                  />
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
