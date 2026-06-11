// src/features/todos/components/AddTodoModal.tsx
import { useState } from 'react';
import { View, Text, Modal, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';
import type { InsertTodoParams } from '../repository/todos.repository';
import type { Doctor } from '@/features/doctors/types/doctors.types';
import type { Visit } from '@/features/visits/types/visits.types';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  notes: z.string().max(500).optional(),
  dueDate: z.string().optional(),
  doctorId: z.string().nullable().optional(),
  visitId: z.string().nullable().optional(),
});
type FormValues = z.infer<typeof schema>;
type AddTodoInput = Omit<InsertTodoParams, 'familyGroupId'>;

interface AddTodoModalProps {
  visible: boolean;
  isLoading: boolean;
  defaultPersonId?: string | null;
  doctors?: Doctor[];
  visits?: Visit[];
  onAdd: (input: AddTodoInput) => Promise<void>;
  onDismiss: () => void;
}

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

export const AddTodoModal = ({ visible, isLoading, defaultPersonId, doctors = [], visits = [], onAdd, onDismiss }: AddTodoModalProps) => {
  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', notes: '', dueDate: '', doctorId: null, visitId: null },
  });
  const doctorId = watch('doctorId');
  const visitId = watch('visitId');

  const onSubmit = async (values: FormValues) => {
    await onAdd({ title: values.title, notes: values.notes ?? null, dueDate: values.dueDate ?? null, personId: defaultPersonId ?? null, doctorId: values.doctorId ?? null, visitId: values.visitId ?? null });
    reset();
    onDismiss();
  };

  const doctorOptions = [{ id: null, label: 'None' }, ...doctors.map((d) => ({ id: d.id, label: d.name + (d.type ? ` — ${d.type}` : '') }))];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ?? '';
  const recentVisits = visits.filter((v) => v.visitDate >= sevenDaysAgo);
  const visitOptions = [
    { id: null, label: 'None' },
    ...recentVisits.map((v) => ({
      id: v.id,
      label: `${v.title} · ${new Date(v.visitDate + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}`,
    })),
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={onDismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable>
            <View style={{ backgroundColor: '#F7F5F0', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '90%' }}>
              <View style={{ width: 40, height: 4, backgroundColor: '#D0CCC4', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 20 }} />
              <ScrollView contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 }}>Add to-do</Text>
                <Controller control={control} name="title" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Title" isRequired placeholder="e.g. Book follow-up appointment" autoCapitalize="sentences" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.title?.message} />
                )} />
                <Controller control={control} name="notes" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Notes" placeholder="Additional details (optional)" autoCapitalize="sentences" multiline numberOfLines={2} value={value} onChangeText={onChange} onBlur={onBlur} />
                )} />
                <Controller control={control} name="dueDate" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Due date" placeholder="YYYY-MM-DD (optional)" keyboardType="numbers-and-punctuation" value={value} onChangeText={onChange} onBlur={onBlur} />
                )} />
                {doctors.length > 0 && (
                  <InlinePicker label="Link to doctor (optional)" options={doctorOptions} value={doctorId} onChange={(id) => setValue('doctorId', id)} />
                )}
                {visits.length > 0 && (
                  <InlinePicker label="Link to visit (optional)" options={visitOptions} value={visitId} onChange={(id) => setValue('visitId', id)} />
                )}
                <View style={{ gap: 12, marginTop: 8 }}>
                  <Button label="Add to-do" variant="primary" size="lg" isFullWidth isLoading={isLoading} onPress={handleSubmit(onSubmit)} />
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
