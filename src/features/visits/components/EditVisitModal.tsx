// src/features/visits/components/EditVisitModal.tsx
import { InlinePicker } from '@/design-system/components/InlinePicker';
import { Fonts } from '@/design-system/tokens/fonts';
import { useEffect, useState } from 'react';
import { View, Text, Modal, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { toAppError } from '@/shared/types/errors';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';
import { DateField, TimeField } from '@/design-system/components/DateField';
import { ReminderField } from '@/design-system/components/ReminderField';
import { requestNotificationPermission } from '@/core/notifications/notifications';
import type { UpdateVisitParams } from '../repository/visits.repository';
import type { Visit } from '../types/visits.types';
import type { Doctor } from '@/features/doctors/types/doctors.types';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  visitDate: z.string().min(1, 'Date is required').regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  visitTime: z.string().optional(),
  doctorId: z.string().nullable().optional(),
  reminderOffsetMinutes: z.number().nullable().optional(),
  reminderAt: z.string().nullable().optional(),
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
  onDelete?: () => void;
  isDeleting?: boolean;
}


export const EditVisitModal = ({ visible, isLoading, visit, doctors = [], onSave, onDismiss, onDelete, isDeleting }: EditVisitModalProps) => {
  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: visit.title,
      visitDate: visit.visitDate,
      visitTime: visit.visitTime ?? '',
      doctorId: visit.doctorId,
      reminderOffsetMinutes: visit.reminderOffsetMinutes,
      reminderAt: visit.reminderAt,
    },
  });
  const doctorId = watch('doctorId');
  const visitTime = watch('visitTime');
  const reminderOffsetMinutes = watch('reminderOffsetMinutes');
  const reminderAt = watch('reminderAt');
  const hasTime = !!visitTime?.trim();

  const askPermission = async (): Promise<boolean> => {
    const granted = await requestNotificationPermission();
    if (!granted) {
      Alert.alert('Notifications are off', 'Turn on notifications for FamFiles in iOS Settings to receive reminders.');
    }
    return granted;
  };

  const setOffset = async (minutes: number | null) => {
    if (minutes != null && !(await askPermission())) return;
    setValue('reminderOffsetMinutes', minutes);
    setValue('reminderAt', null);
  };

  const setAt = async (iso: string | null) => {
    if (iso && !(await askPermission())) return;
    setValue('reminderAt', iso);
    setValue('reminderOffsetMinutes', null);
  };

  const handleTimeChange = (next: string, onChange: (v: string) => void) => {
    onChange(next);
    if (next.trim() && reminderAt) setValue('reminderAt', null);
    if (!next.trim() && reminderOffsetMinutes != null) setValue('reminderOffsetMinutes', null);
  };

  // An absolute reminder does not follow a date change — offer to review it. (c)
  const handleDateChange = (next: string, onChange: (v: string) => void) => {
    const prev = watch('visitDate');
    onChange(next);
    if (reminderAt && prev && next && prev !== next) {
      Alert.alert(
        'Update reminder?',
        'The visit date changed. Your reminder is still set for its original time.',
        [
          { text: 'Keep it', style: 'cancel' },
          { text: 'Clear reminder', style: 'destructive', onPress: () => setValue('reminderAt', null) },
        ],
      );
    }
  };

  // Re-seed the form whenever a different visit is opened or the modal re-opens.
  useEffect(() => {
    if (visible) {
      reset({
        title: visit.title,
        visitDate: visit.visitDate,
        visitTime: visit.visitTime ?? '',
        doctorId: visit.doctorId,
        reminderOffsetMinutes: visit.reminderOffsetMinutes,
        reminderAt: visit.reminderAt,
      });
    }
  }, [visible, visit, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
    await onSave({
      title: values.title,
      visitDate: values.visitDate,
      visitTime: values.visitTime?.trim() || null,
      doctorId: values.doctorId ?? null,
      preNotes: visit.preNotes,
      postNotes: visit.postNotes,
      totalCost: visit.totalCost,
      outOfPocket: visit.outOfPocket,
      reminderOffsetMinutes: values.visitTime?.trim() ? (values.reminderOffsetMinutes ?? null) : null,
      reminderAt: values.visitTime?.trim() ? null : (values.reminderAt ?? null),
    });
    onDismiss();
    } catch (e) {
      Alert.alert('Could not save', toAppError(e).message);
    }
  };

  const doctorOptions = [{ id: null, label: 'None' }, ...doctors.map((d) => ({ id: d.id, label: d.name + (d.type ? ` — ${d.type}` : '') }))];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={onDismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable style={{ maxHeight: '92%' }}>
            <View style={{ backgroundColor: '#F7F7F4', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, flexShrink: 1 }}>
              <View style={{ width: 40, height: 4, backgroundColor: '#D0CCC4', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 20 }} />
              <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, gap: 16 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator>
                <Text style={{ fontSize: 22, fontWeight: '700', color: '#17211C', fontFamily: Fonts.serif, marginBottom: 4 }}>Edit visit</Text>
                <View style={{ gap: 4 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(23,33,28,0.65)' }}>Person</Text>
                  <View style={{ backgroundColor: '#ECEBE5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11 }}>
                    <Text style={{ fontSize: 14, color: '#17211C', fontWeight: '500' }}>{visit.personName}</Text>
                  </View>
                </View>
                <Controller control={control} name="title" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Title" isRequired placeholder="e.g. Annual checkup" autoCapitalize="sentences" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.title?.message} />
                )} />
                <Controller control={control} name="visitDate" render={({ field: { onChange, value } }) => (
                  <DateField label="Date" isRequired value={value} onChange={(v) => handleDateChange(v, onChange)} error={errors.visitDate?.message} />
                )} />
                <Controller control={control} name="visitTime" render={({ field: { onChange, value } }) => (
                  <TimeField label="Time (optional)" value={value} onChange={(v) => handleTimeChange(v, onChange)} />
                )} />
                <ReminderField
                  mode={hasTime ? 'offset' : 'absolute'}
                  offsetMinutes={reminderOffsetMinutes ?? null}
                  reminderAt={reminderAt ?? null}
                  onChangeOffset={setOffset}
                  onChangeAt={setAt}
                />
                {doctors.length > 0 && (
                  <InlinePicker label="Doctor (optional)" options={doctorOptions} value={doctorId} onChange={(id) => setValue('doctorId', id)} />
                )}
                <View style={{ gap: 12, marginTop: 8 }}>
                  <Button label="Save changes" variant="primary" size="lg" isFullWidth isLoading={isLoading} onPress={handleSubmit(onSubmit)} />
                  <Button label="Cancel" variant="ghost" size="lg" isFullWidth onPress={onDismiss} />
                  {onDelete ? (
                    <Button
                      label="Delete visit"
                      variant="danger"
                      size="lg"
                      isFullWidth
                      isLoading={isDeleting}
                      onPress={() =>
                        Alert.alert('Delete visit', `Delete "${visit.title}"? This can't be undone.`, [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', style: 'destructive', onPress: () => onDelete() },
                        ])
                      }
                    />
                  ) : null}
                </View>
              </ScrollView>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};
