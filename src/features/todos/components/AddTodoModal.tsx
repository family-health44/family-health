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
import type { Person } from '@/features/family/types/family.types';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  personId: z.string().min(1, 'Please choose a person'),
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
  people?: Person[];
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

function formatVisitDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    // Parse as local date to avoid timezone shifts
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return dateStr;
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export const AddTodoModal = ({ visible, isLoading, people = [], defaultPersonId, doctors = [], visits = [], onAdd, onDismiss }: AddTodoModalProps) => {
  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', notes: '', dueDate: '', personId: defaultPersonId ?? '', doctorId: null, visitId: null },
  });
  const personId = watch('personId');
  const doctorId = watch('doctorId');
  const visitId = watch('visitId');

  const onSubmit = async (values: FormValues) => {
    await onAdd({ title: values.title, notes: values.notes ?? null, dueDate: values.dueDate ?? null, personId: values.personId, doctorId: values.doctorId ?? null, visitId: values.visitId ?? null });
    reset();
    onDismiss();
  };

  const personOptions = people.map((pp) => ({ id: pp.id, label: pp.name }));
  const doctorOptions = [{ id: null, label: 'None' }, ...doctors.map((d) => ({ id: d.id, label: d.name + (d.type ? ` — ${d.type}` : '') }))];

  // All visits sorted newest first
  const sortedVisits = [...visits].sort((a, b) => b.visitDate.localeCompare(a.visitDate));
  const visitOptions = [
    { id: null, label: 'None' },
    ...sortedVisits.map((v) => ({
      id: v.id,
      label: `${v.title} · ${formatVisitDate(v.visitDate)}`,
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
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 }}>Add To Do</Text>
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
                  <Button label="Save" variant="primary" size="lg" isFullWidth isLoading={isLoading} onPress={handleSubmit(onSubmit)} />
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
