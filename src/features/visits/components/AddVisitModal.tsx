// src/features/visits/components/AddVisitModal.tsx
import { InlinePicker } from '@/design-system/components/InlinePicker';
import { useState } from 'react';
import { View, Text, Modal, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { toAppError } from '@/shared/types/errors';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';
import { DateField, TimeField } from '@/design-system/components/DateField';
import type { InsertVisitParams } from '../repository/visits.repository';
import type { Person } from '@/features/family/types/family.types';
import type { Doctor } from '@/features/doctors/types/doctors.types';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  visitDate: z.string().min(1, 'Date is required').regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  visitTime: z.string().optional(),
  personId: z.string().min(1, 'Please choose a family member'),
  doctorId: z.string().nullable().optional(),
  preNotes: z.string().optional(),
  totalCost: z.string().optional(),
  outOfPocketCost: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;
type AddVisitInput = Omit<InsertVisitParams, 'familyGroupId'>;

interface AddVisitModalProps {
  visible: boolean;
  isLoading: boolean;
  people?: Person[];
  doctors?: Doctor[];
  defaultPersonId?: string;
  personName?: string;
  onAdd: (input: AddVisitInput) => Promise<void>;
  onDismiss: () => void;
}


export const AddVisitModal = ({ visible, isLoading, people = [], doctors = [], defaultPersonId = '', personName, onAdd, onDismiss }: AddVisitModalProps) => {
  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', visitDate: '', visitTime: '', personId: defaultPersonId, doctorId: null, preNotes: '', totalCost: '', outOfPocketCost: '' },
  });
  const personId = watch('personId');
  const doctorId = watch('doctorId');

  const parseCost = (raw?: string): number | null => {
    const t = raw?.trim();
    if (!t) return null;
    const n = Number(t.replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) ? n : null;
  };

  const onSubmit = async (values: FormValues) => {
    try {
    await onAdd({
      title: values.title,
      visitDate: values.visitDate,
      visitTime: values.visitTime?.trim() || null,
      doctorId: values.doctorId ?? null,
      personId: values.personId,
      preNotes: values.preNotes?.trim() || null,
      postNotes: null,
      totalCost: parseCost(values.totalCost),
      outOfPocket: parseCost(values.outOfPocketCost),
    });
    reset();
    onDismiss();
    } catch (e) {
      Alert.alert('Could not save', toAppError(e).message);
    }
  };

  const personOptions = people.map((p) => ({ id: p.id, label: p.name }));
  const doctorOptions = [{ id: null, label: 'None' }, ...doctors.map((d) => ({ id: d.id, label: d.name + (d.type ? ` — ${d.type}` : '') }))];
  // Show selector when a list is provided; fall back to read-only when a single person is fixed.
  const showPersonSelector = people.length > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={onDismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable>
            <View style={{ backgroundColor: '#F7F5F0', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '92%' }}>
              <View style={{ width: 40, height: 4, backgroundColor: '#D0CCC4', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 20 }} />
              <ScrollView contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 }}>Add visit</Text>
                {showPersonSelector ? (
                  <InlinePicker label="Family member" isRequired options={personOptions} value={personId} onChange={(id) => setValue('personId', id ?? '', { shouldValidate: true })} error={errors.personId?.message} />
                ) : personName ? (
                  <View style={{ gap: 4 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#6B6866' }}>Person</Text>
                    <View style={{ backgroundColor: '#EEEAE3', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11 }}>
                      <Text style={{ fontSize: 14, color: '#1C1917', fontWeight: '500' }}>{personName}</Text>
                    </View>
                  </View>
                ) : null}
                <Controller control={control} name="title" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Title" isRequired placeholder="e.g. Annual checkup" autoCapitalize="sentences" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.title?.message} />
                )} />
                <Controller control={control} name="visitDate" render={({ field: { onChange, value } }) => (
                  <DateField label="Date" isRequired value={value} onChange={onChange} error={errors.visitDate?.message} />
                )} />
                <Controller control={control} name="visitTime" render={({ field: { onChange, value } }) => (
                  <TimeField label="Time (optional)" value={value} onChange={onChange} />
                )} />
                {doctors.length > 0 && (
                  <InlinePicker label="Doctor (optional)" options={doctorOptions} value={doctorId} onChange={(id) => setValue('doctorId', id)} />
                )}
                <Controller control={control} name="preNotes" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Pre-visit notes" placeholder="What to discuss, questions to ask..." autoCapitalize="sentences" multiline numberOfLines={5} style={{ minHeight: 100, textAlignVertical: 'top' }} value={value} onChangeText={onChange} onBlur={onBlur} />
                )} />
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Controller control={control} name="totalCost" render={({ field: { onChange, onBlur, value } }) => (
                      <Input label="Total cost ($)" placeholder="0.00" keyboardType="decimal-pad" value={value} onChangeText={onChange} onBlur={onBlur} />
                    )} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Controller control={control} name="outOfPocketCost" render={({ field: { onChange, onBlur, value } }) => (
                      <Input label="Out of pocket ($)" placeholder="0.00" keyboardType="decimal-pad" value={value} onChangeText={onChange} onBlur={onBlur} />
                    )} />
                  </View>
                </View>
                <View style={{ gap: 12, marginTop: 8 }}>
                  <Button label="Add visit" variant="primary" size="lg" isFullWidth isLoading={isLoading} onPress={handleSubmit(onSubmit)} />
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
