// src/features/todos/components/AddTodoModal.tsx
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

export const AddTodoModal = ({ visible, isLoading, defaultPersonId, doctors = [], visits = [], onAdd, onDismiss }: AddTodoModalProps) => {
  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', notes: '', dueDate: '', doctorId: null, visitId: null },
  });
  const selectedDoctorId = watch('doctorId');
  const selectedVisitId = watch('visitId');

  const onSubmit = async (values: FormValues) => {
    await onAdd({ title: values.title, notes: values.notes ?? null, dueDate: values.dueDate ?? null, personId: defaultPersonId ?? null, doctorId: values.doctorId ?? null, visitId: values.visitId ?? null });
    reset();
    onDismiss();
  };

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
                  <View style={{ gap: 6 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#3D3D3D' }}>Link to doctor (optional)</Text>
                    <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 12, overflow: 'hidden' }}>
                      <DropdownRow label="None" selected={!selectedDoctorId} onSelect={() => setValue('doctorId', null)} />
                      {doctors.map((doc) => <DropdownRow key={doc.id} label={doc.name + (doc.type ? ` — ${doc.type}` : '')} selected={selectedDoctorId === doc.id} onSelect={() => setValue('doctorId', doc.id)} />)}
                    </View>
                  </View>
                )}
                {visits.length > 0 && (
                  <View style={{ gap: 6 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#3D3D3D' }}>Link to visit (optional)</Text>
                    <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 12, overflow: 'hidden' }}>
                      <DropdownRow label="None" selected={!selectedVisitId} onSelect={() => setValue('visitId', null)} />
                      {visits.map((v) => <DropdownRow key={v.id} label={`${v.title} — ${v.visitDate}`} selected={selectedVisitId === v.id} onSelect={() => setValue('visitId', v.id)} />)}
                    </View>
                  </View>
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
