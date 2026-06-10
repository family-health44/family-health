// src/features/visits/components/AddVisitModal.tsx
import { View, Text, Modal, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';
import type { InsertVisitParams } from '../repository/visits.repository';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  visitDate: z.string().min(1, 'Date is required').regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  visitTime: z.string().optional(),
  preNotes: z.string().optional(),
  totalCost: z.string().optional(),
  outOfPocketCost: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;
type AddVisitInput = Omit<InsertVisitParams, 'familyGroupId'>;

interface AddVisitModalProps {
  visible: boolean;
  isLoading: boolean;
  defaultPersonId?: string;
  personName?: string;
  onAdd: (input: AddVisitInput) => Promise<void>;
  onDismiss: () => void;
}

export const AddVisitModal = ({ visible, isLoading, defaultPersonId = '', personName, onAdd, onDismiss }: AddVisitModalProps) => {
  const today = new Date().toISOString().split('T')[0] ?? '';
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', visitDate: today, visitTime: '', preNotes: '', totalCost: '', outOfPocketCost: '' },
  });

  const onSubmit = async (values: FormValues) => {
    let preNotes = values.preNotes?.trim() || null;
    const costLines: string[] = [];
    if (values.totalCost?.trim()) costLines.push(`Total cost: $${values.totalCost.trim()}`);
    if (values.outOfPocketCost?.trim()) costLines.push(`Out of pocket: $${values.outOfPocketCost.trim()}`);
    if (costLines.length > 0) preNotes = [preNotes, ...costLines].filter(Boolean).join('\n');
    await onAdd({ title: values.title, visitDate: values.visitDate, visitTime: values.visitTime?.trim() || null, doctorId: null, personId: defaultPersonId, preNotes: preNotes || null, postNotes: null });
    reset();
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={onDismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable>
            <View style={{ backgroundColor: '#F7F5F0', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '92%' }}>
              <View style={{ width: 40, height: 4, backgroundColor: '#D0CCC4', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 20 }} />
              <ScrollView contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 }}>Add visit</Text>
                {personName ? (
                  <View style={{ gap: 4 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#6B6460' }}>Person</Text>
                    <View style={{ backgroundColor: '#EEEAE3', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11 }}>
                      <Text style={{ fontSize: 14, color: '#1C1917', fontWeight: '500' }}>{personName}</Text>
                    </View>
                  </View>
                ) : null}
                <Controller control={control} name="title" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Title" isRequired placeholder="e.g. Annual checkup" autoCapitalize="sentences" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.title?.message} />
                )} />
                <Controller control={control} name="visitDate" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Date" isRequired placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.visitDate?.message} />
                )} />
                <Controller control={control} name="visitTime" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Time" placeholder="HH:MM (optional)" keyboardType="numbers-and-punctuation" value={value} onChangeText={onChange} onBlur={onBlur} />
                )} />
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
