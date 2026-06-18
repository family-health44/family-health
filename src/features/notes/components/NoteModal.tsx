// src/features/notes/components/NoteModal.tsx
import { InlinePicker } from '@/design-system/components/InlinePicker';
import { useEffect, useState } from 'react';
import { View, Text, Modal, Pressable, KeyboardAvoidingView, Platform, ScrollView, Switch } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';
import { toISODateString } from '@/shared/utils/dates';
import type { Note, NoteFormValues } from '../types/notes.types';
import type { Doctor } from '@/features/doctors/types/doctors.types';
import type { Medication } from '@/features/medications/types/medications.types';

const schema = z.object({
  content: z.string().min(1, 'Note content is required').max(5000),
  doctorId: z.string().nullable(),
  medicationId: z.string().nullable(),
  noteDate: z.string().nullable(),
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
    defaultValues: { content: '', doctorId: null, medicationId: null, hidden: false, noteDate: toISODateString(new Date()) },
  });
  const doctorId = watch('doctorId');
  const medicationId = watch('medicationId');

  useEffect(() => {
    if (editingNote) {
      reset({ content: editingNote.content, doctorId: editingNote.doctorId, medicationId: editingNote.medicationId, hidden: editingNote.hidden, noteDate: editingNote.noteDate ?? '' });
    } else {
      reset({ content: '', doctorId: null, medicationId: null, hidden: false, noteDate: toISODateString(new Date()) });
    }
  }, [editingNote, reset, visible]);

  const onSubmit = async (values: FormValues) => { await onSave({ ...values, noteDate: values.noteDate?.trim() || null }); reset(); };

  const doctorOptions = [
    { id: null, label: 'None' },
    ...doctors.map((d) => ({ id: d.id, label: d.name + (d.type ? ` — ${d.type}` : '') })),
  ];
  const medOptions = [
    { id: null, label: 'None' },
    ...medications.map((m) => ({ id: m.id, label: m.name + (m.dosage ? ` ${m.dosage}` : '') })),
  ];

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
                  <Input label="Note" isRequired placeholder="Write your note here..." autoCapitalize="sentences" multiline numberOfLines={6} style={{ minHeight: 120, textAlignVertical: 'top' }} value={value} onChangeText={onChange} onBlur={onBlur} error={errors.content?.message} />
                )} />
                <Controller control={control} name="noteDate" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Date (optional)" placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" value={value ?? ''} onChangeText={onChange} onBlur={onBlur} error={errors.noteDate?.message} />
                )} />
                {doctors.length > 0 && (
                  <InlinePicker label="Link to doctor (optional)" options={doctorOptions} value={doctorId} onChange={(id) => setValue('doctorId', id)} />
                )}
                {medications.length > 0 && (
                  <InlinePicker label="Link to medication (optional)" options={medOptions} value={medicationId} onChange={(id) => setValue('medicationId', id)} />
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
