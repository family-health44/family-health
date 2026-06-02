// src/features/medications/components/AddMedicationModal.tsx
// Modal for adding a new medication. React Hook Form + Zod. No business logic.

import { View, Text, Modal, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';

import type { MedicationStatus } from '../types/medications.types';
import type { InsertMedicationParams } from '../repository/medications.repository';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  dosage: z.string().max(100).optional(),
  frequency: z.string().max(100).optional(),
  reason: z.string().max(200).optional(),
  startDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type AddMedicationInput = Omit<InsertMedicationParams, 'familyGroupId'>;

interface AddMedicationModalProps {
  visible: boolean;
  isLoading: boolean;
  personId: string;
  onAdd: (input: AddMedicationInput) => Promise<void>;
  onDismiss: () => void;
}

export const AddMedicationModal = ({
  visible, isLoading, personId, onAdd, onDismiss,
}: AddMedicationModalProps) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', dosage: '', frequency: '', reason: '', startDate: '' },
  });

  const onSubmit = async (values: FormValues) => {
    await onAdd({
      name: values.name,
      dosage: values.dosage ?? null,
      frequency: values.frequency ?? null,
      reason: values.reason ?? null,
      status: 'active' as MedicationStatus,
      startDate: values.startDate ?? null,
      endDate: null,
      personId,
      prescribedBy: null,
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
                  Add medication
                </Text>

                <Controller control={control} name="name" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Medication name" isRequired placeholder="e.g. Amoxicillin"
                    value={value} onChangeText={onChange} onBlur={onBlur} error={errors.name?.message} />
                )} />

                <Controller control={control} name="dosage" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Dosage" placeholder="e.g. 500mg"
                    value={value} onChangeText={onChange} onBlur={onBlur} />
                )} />

                <Controller control={control} name="frequency" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Frequency" placeholder="e.g. Twice daily"
                    value={value} onChangeText={onChange} onBlur={onBlur} />
                )} />

                <Controller control={control} name="reason" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Reason" placeholder="e.g. Ear infection"
                    autoCapitalize="sentences" value={value} onChangeText={onChange} onBlur={onBlur} />
                )} />

                <Controller control={control} name="startDate" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Start date" placeholder="YYYY-MM-DD"
                    keyboardType="numbers-and-punctuation"
                    value={value} onChangeText={onChange} onBlur={onBlur} />
                )} />

                <View style={{ gap: 12, marginTop: 8 }}>
                  <Button label="Add medication" variant="primary" size="lg" isFullWidth
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
