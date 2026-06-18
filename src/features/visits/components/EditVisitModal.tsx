// src/features/visits/components/EditVisitModal.tsx
import { InlinePicker } from '@/design-system/components/InlinePicker';
import { useEffect, useState } from 'react';
import { View, Text, Modal, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';
import type { UpdateVisitParams } from '../repository/visits.repository';
import type { Visit } from '../types/visits.types';
import type { Doctor } from '@/features/doctors/types/doctors.types';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  visitDate: z.string().min(1, 'Date is required').regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  visitTime: z.string().optional(),
  doctorId: z.string().nullable().optional(),
  preNotes: z.string().optional(),
  postNotes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;
type EditVisitInput = Omit<UpdateVisitParams, 'visitId'>;

interface EditVisitModalProps {
  visible: boolean;
  isLoading: boolean;
  visit: Visit;
  doctors?: Doctor[];
  onSave: (input: EditVisitInput) => Promise<void>;
  onDismiss: () => void;
}


export const EditVisitModal = ({ visible, isLoading, visit, doctors = [], onSave, onDismiss }: EditVisitModalProps) => {
  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: visit.title,
      visitDate: visit.visitDate,
      visitTime: visit.visitTime ?? '',
      doctorId: visit.doctorId,
      preNotes: visit.preNotes ?? '',
      postNotes: visit.postNotes ?? '',
    },
  });
  const doctorId = watch('doctorId');

  // Re-seed the form whenever a different visit is opened or the modal re-opens.
  useEffect(() => {
    if (visible) {
      reset({
        title: visit.title,
        visitDate: visit.visitDate,
        visitTime: visit.visitTime ?? '',
        doctorId: visit.doctorId,
        preNotes: visit.preNotes ?? '',
        postNotes: visit.postNotes ?? '',
      });
    }
  }, [visible, visit, reset]);

  const onSubmit = async (values: FormValues) => {
    await onSave({
      title: values.title,
      visitDate: values.visitDate,
      visitTime: values.visitTime?.trim() || null,
      doctorId: values.doctorId ?? null,
      preNotes: values.preNotes?.trim() || null,
      postNotes: values.postNotes?.trim() || null,
    });
    onDismiss();
  };

  const doctorOptions = [{ id: null, label: 'None' }, ...doctors.map((d) => ({ id: d.id, label: d.name + (d.type ? ` — ${d.type}` : '') }))];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={onDismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable>
            <View style={{ backgroundColor: '#F7F5F0', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '92%' }}>
              <View style={{ width: 40, height: 4, backgroundColor: '#D0CCC4', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 20 }} />
              <ScrollView contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 }}>Edit visit</Text>
                <View style={{ gap: 4 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#6B6460' }}>Person</Text>
                  <View style={{ backgroundColor: '#EEEAE3', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11 }}>
                    <Text style={{ fontSize: 14, color: '#1C1917', fontWeight: '500' }}>{visit.personName}</Text>
                  </View>
                </View>
                <Controller control={control} name="title" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Title" isRequired placeholder="e.g. Annual checkup" autoCapitalize="sentences" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.title?.message} />
                )} />
                <Controller control={control} name="visitDate" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Date" isRequired placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.visitDate?.message} />
                )} />
                <Controller control={control} name="visitTime" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Time" placeholder="HH:MM (optional)" keyboardType="numbers-and-punctuation" value={value} onChangeText={onChange} onBlur={onBlur} />
                )} />
                {doctors.length > 0 && (
                  <InlinePicker label="Doctor (optional)" options={doctorOptions} value={doctorId} onChange={(id) => setValue('doctorId', id)} />
                )}
                <Controller control={control} name="preNotes" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Pre-visit notes" placeholder="What to discuss, questions to ask..." autoCapitalize="sentences" multiline numberOfLines={5} style={{ minHeight: 100, textAlignVertical: 'top' }} value={value} onChangeText={onChange} onBlur={onBlur} />
                )} />
                <Controller control={control} name="postNotes" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Post-visit notes" placeholder="Outcomes, follow-ups, results..." autoCapitalize="sentences" multiline numberOfLines={5} style={{ minHeight: 100, textAlignVertical: 'top' }} value={value} onChangeText={onChange} onBlur={onBlur} />
                )} />
                <View style={{ gap: 12, marginTop: 8 }}>
                  <Button label="Save changes" variant="primary" size="lg" isFullWidth isLoading={isLoading} onPress={handleSubmit(onSubmit)} />
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
