// src/features/visits/components/AddVisitModal.tsx
// Modal for adding a new visit. React Hook Form + Zod. No business logic.

import { View, Text, Modal, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';

import type { InsertVisitParams } from '../repository/visits.repository';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  visitDate: z.string().min(1, 'Date is required').regex(
    /^\d{4}-\d{2}-\d{2}$/,
    'Date must be in YYYY-MM-DD format',
  ),
  visitTime: z.string().optional(),
  personId: z.string().min(1, 'Person is required'),
  preNotes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type AddVisitInput = Omit<InsertVisitParams, 'familyGroupId'>;

interface AddVisitModalProps {
  visible: boolean;
  isLoading: boolean;
  defaultPersonId?: string;
  onAdd: (input: AddVisitInput) => Promise<void>;
  onDismiss: () => void;
}

export const AddVisitModal = ({
  visible, isLoading, defaultPersonId = '', onAdd, onDismiss,
}: AddVisitModalProps) => {
  const today = new Date().toISOString().split('T')[0] ?? '';

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      visitDate: today,
      visitTime: '',
      personId: defaultPersonId,
      preNotes: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    await onAdd({
      title: values.title,
      visitDate: values.visitDate,
      visitTime: values.visitTime ?? null,
      doctorId: null,
      personId: values.personId,
      preNotes: values.preNotes ?? null,
      postNotes: null,
    });
    reset();
    onDismiss();
  };

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
              maxHeight: '90%',
            }}>
              <View style={{
                width: 40, height: 4, backgroundColor: '#D0CCC4',
                borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 20,
              }} />

              <ScrollView contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 }}>
                  Add visit
                </Text>

                <Controller control={control} name="title" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Title" isRequired placeholder="e.g. Annual checkup"
                    autoCapitalize="sentences" value={value} onChangeText={onChange}
                    onBlur={onBlur} error={errors.title?.message} />
                )} />

                <Controller control={control} name="visitDate" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Date" isRequired placeholder="YYYY-MM-DD"
                    keyboardType="numbers-and-punctuation" value={value}
                    onChangeText={onChange} onBlur={onBlur} error={errors.visitDate?.message} />
                )} />

                <Controller control={control} name="visitTime" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Time" placeholder="HH:MM (optional)"
                    keyboardType="numbers-and-punctuation" value={value}
                    onChangeText={onChange} onBlur={onBlur} />
                )} />

                <Controller control={control} name="personId" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Person ID" isRequired placeholder="Person ID"
                    value={value} onChangeText={onChange} onBlur={onBlur}
                    error={errors.personId?.message}
                    helperText="Person picker coming in Phase 3" />
                )} />

                <Controller control={control} name="preNotes" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Pre-visit notes" placeholder="What to discuss..."
                    autoCapitalize="sentences" multiline numberOfLines={3}
                    value={value} onChangeText={onChange} onBlur={onBlur} />
                )} />

                <View style={{ gap: 12, marginTop: 8 }}>
                  <Button label="Add visit" variant="primary" size="lg" isFullWidth
                    isLoading={isLoading} onPress={handleSubmit(onSubmit)} />
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
