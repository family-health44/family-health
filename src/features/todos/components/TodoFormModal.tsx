// src/features/todos/components/TodoFormModal.tsx
// Shared slide-up form for creating and editing a to-do. Add mode: initialTodo = null.
// Edit mode: initialTodo provided (title changes to "Edit To Do", button to "Save changes").
import { InlinePicker } from '@/design-system/components/InlinePicker';
import { Fonts } from '@/design-system/tokens/fonts';
import { useEffect } from 'react';
import { View, Text, Modal, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';
import { DateField } from '@/design-system/components/DateField';
import { ReminderField } from '@/design-system/components/ReminderField';
import { requestNotificationPermission } from '@/core/notifications/notifications';
import type { Todo } from '../types/todos.types';
import type { Doctor } from '@/features/doctors/types/doctors.types';
import type { Visit } from '@/features/visits/types/visits.types';
import { toAppError } from '@/shared/types/errors';
import type { Person } from '@/features/family/types/family.types';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  personId: z.string().min(1, 'Please choose a person'),
  notes: z.string().max(500).optional(),
  dueDate: z.string().optional(),
  doctorId: z.string().nullable().optional(),
  visitId: z.string().nullable().optional(),
  reminderAt: z.string().nullable().optional(),
});
export type TodoFormValues = z.infer<typeof schema>;

interface TodoFormModalProps {
  visible: boolean;
  isLoading: boolean;
  initialTodo?: Todo | null;
  people?: Person[];
  defaultPersonId?: string | null;
  doctors?: Doctor[];
  visits?: Visit[];
  onSubmit: (values: TodoFormValues) => Promise<void>;
  onDismiss: () => void;
}

function formatVisitDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return dateStr;
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export const TodoFormModal = ({
  visible, isLoading, initialTodo = null, people = [], defaultPersonId, doctors = [], visits = [], onSubmit, onDismiss,
}: TodoFormModalProps) => {
  const isEdit = !!initialTodo;
  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<TodoFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', notes: '', dueDate: '', personId: defaultPersonId ?? '', doctorId: null, visitId: null, reminderAt: null },
  });

  // Populate/clear whenever the modal opens or its target changes.
  useEffect(() => {
    if (!visible) return;
    if (initialTodo) {
      reset({
        title: initialTodo.title,
        notes: initialTodo.notes ?? '',
        dueDate: initialTodo.dueDate ?? '',
        personId: initialTodo.personId ?? '',
        doctorId: initialTodo.doctorId,
        visitId: initialTodo.visitId,
        reminderAt: initialTodo.reminderAt,
      });
    } else {
      reset({ title: '', notes: '', dueDate: '', personId: defaultPersonId ?? '', doctorId: null, visitId: null, reminderAt: null });
    }
  }, [visible, initialTodo, defaultPersonId, reset]);

  const personId = watch('personId');
  const doctorId = watch('doctorId');
  const visitId = watch('visitId');
  const reminderAt = watch('reminderAt');
  const dueDate = watch('dueDate');

  // Absolute reminders do not follow a due-date change — offer to review it. (c)
  const handleDueDateChange = (next: string, onChange: (v: string) => void) => {
    const prev = dueDate;
    onChange(next);
    if (reminderAt && prev && next && prev !== next) {
      Alert.alert(
        'Update reminder?',
        'The due date changed. Your reminder is still set for its original time.',
        [
          { text: 'Keep it', style: 'cancel' },
          { text: 'Clear reminder', style: 'destructive', onPress: () => setValue('reminderAt', null) },
        ],
      );
    }
  };

  const setReminder = async (iso: string | null) => {
    // Always store the reminder. Permission governs DELIVERY, not the record —
    // discarding the value on a denied prompt leaves the user with a silently
    // empty field and no way back (iOS only ever allows one permission ask).
    setValue('reminderAt', iso);
    if (iso) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          'Notifications are off',
          'Your reminder is saved, but FamFiles cannot alert you until notifications are turned on in iOS Settings.',
        );
      }
    }
  };

  const submit = async (values: TodoFormValues) => {
    try {
      await onSubmit(values);
      if (!isEdit) reset();
      onDismiss();
    } catch (e) {
      // Keep the modal open so input isn't lost; surface a clean message.
      Alert.alert('Could not save', toAppError(e).message);
    }
  };

  const personOptions = people.map((pp) => ({ id: pp.id, label: pp.name }));
  const doctorOptions = [{ id: null, label: 'None' }, ...doctors.map((d) => ({ id: d.id, label: d.name + (d.type ? ` — ${d.type}` : '') }))];
  const sortedVisits = [...visits].sort((a, b) => b.visitDate.localeCompare(a.visitDate));
  const visitOptions = [
    { id: null, label: 'None' },
    ...sortedVisits.map((v) => ({ id: v.id, label: `${v.title} · ${formatVisitDate(v.visitDate)}` })),
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={onDismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable style={{ maxHeight: '90%' }}>
            <View style={{ backgroundColor: '#F7F7F4', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, flexShrink: 1 }}>
              <View style={{ width: 40, height: 4, backgroundColor: '#D0CCC4', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 20 }} />
              <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
                <Text style={{ fontSize: 22, fontWeight: '700', color: '#17211C', fontFamily: Fonts.serif, marginBottom: 4 }}>{isEdit ? 'Edit To Do' : 'Add To Do'}</Text>
                <View style={{ gap: 6 }}>
                  <InlinePicker label="Person *" options={personOptions} value={personId} onChange={(id) => setValue('personId', id ?? '', { shouldValidate: true })} />
                  {errors.personId ? <Text style={{ fontSize: 12, color: '#B91C1C' }}>{errors.personId.message}</Text> : null}
                </View>
                <Controller control={control} name="title" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Title" isRequired placeholder="e.g. Book follow-up appointment" autoCapitalize="sentences" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.title?.message} />
                )} />
                <Controller control={control} name="notes" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Notes" placeholder="Additional details (optional)" autoCapitalize="sentences" multiline numberOfLines={2} value={value} onChangeText={onChange} onBlur={onBlur} />
                )} />
                <Controller control={control} name="dueDate" render={({ field: { onChange, value } }) => (
                  <DateField label="Due date" placeholder="Select a date (optional)" value={value || null} onChange={(v) => handleDueDateChange(v, onChange)} onClear={() => onChange('')} />
                )} />
                <ReminderField
                  reminderAt={reminderAt ?? null}
                  onChangeAt={setReminder}
                />
                {doctors.length > 0 && (
                  <InlinePicker label="Link to doctor (optional)" options={doctorOptions} value={doctorId} onChange={(id) => setValue('doctorId', id)} />
                )}
                {visits.length > 0 && (
                  <InlinePicker label="Link to visit (optional)" options={visitOptions} value={visitId} onChange={(id) => setValue('visitId', id)} />
                )}
                <View style={{ gap: 12, marginTop: 8 }}>
                  <Button label={isEdit ? 'Save changes' : 'Save'} variant="primary" size="lg" isFullWidth isLoading={isLoading} onPress={handleSubmit(submit)} />
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
