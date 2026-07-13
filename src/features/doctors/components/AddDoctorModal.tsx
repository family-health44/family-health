// src/features/doctors/components/AddDoctorModal.tsx
// Modal for adding a new doctor — name, type, phone, address.
// React Hook Form + Zod. No business logic.

import { useState, useEffect } from 'react';
import { Fonts } from '@/design-system/tokens/fonts';
import { View, Text, Modal, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';
import { InlinePicker } from '@/design-system/components/InlinePicker';
import { SPECIALTY_OPTIONS, OTHER_SPECIALTY } from '../domain/specialties';
import { toAppError } from '@/shared/types/errors';

const addDoctorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.string().max(50).optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(200).optional(),
});

type AddDoctorFormValues = z.infer<typeof addDoctorSchema>;

interface AddDoctorModalProps {
  visible: boolean;
  isLoading: boolean;
  onAdd: (params: { name: string; type: string | null; phone: string | null; address: string | null }) => Promise<void>;
  onDismiss: () => void;
}

export const AddDoctorModal = ({ visible, isLoading, onAdd, onDismiss }: AddDoctorModalProps) => {
  const [typeChoice, setTypeChoice] = useState<string | null>(null);
  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<AddDoctorFormValues>({
    resolver: zodResolver(addDoctorSchema),
    defaultValues: { name: '', type: '', phone: '', address: '' },
  });

  // Reset the picker whenever the modal closes so a reopened form starts clean.
  useEffect(() => {
    if (!visible) { setTypeChoice(null); reset(); }
  }, [visible, reset]);

  const onSubmit = async (values: AddDoctorFormValues) => {
    try {
      await onAdd({
        name: values.name,
        type: values.type ?? null,
        phone: values.phone ?? null,
        address: values.address ?? null,
      });
    } catch (e) {
      Alert.alert('Could not save', toAppError(e).message);
      return;
    }
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
          <Pressable style={{ maxHeight: '90%' }}>
            <View
              style={{
                backgroundColor: '#F7F7F4',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingBottom: Platform.OS === 'ios' ? 40 : 24,
                maxHeight: '90%',
              }}
            >
              {/* Handle */}
              <View style={{
                width: 40, height: 4, backgroundColor: '#D0CCC4',
                borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 20,
              }} />

              <ScrollView contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
                <Text style={{ fontSize: 22, fontWeight: '700', color: '#17211C', fontFamily: Fonts.serif, marginBottom: 4 }}>
                  Add doctor
                </Text>

                <Controller control={control} name="name" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Full name" isRequired placeholder="Dr. Jane Smith"
                    autoCapitalize="words" value={value} onChangeText={onChange}
                    onBlur={onBlur} error={errors.name?.message} />
                )} />

                <InlinePicker label="Specialty / type" options={SPECIALTY_OPTIONS} value={typeChoice}
                  onChange={(id) => { setTypeChoice(id); setValue('type', id && id !== OTHER_SPECIALTY ? id : ''); }} />
                {typeChoice === OTHER_SPECIALTY ? (
                  <Controller control={control} name="type" render={({ field: { onChange, onBlur, value } }) => (
                    <Input label="Specialty (other)" placeholder="e.g. Vascular surgeon"
                      autoCapitalize="words" value={value} onChangeText={onChange} onBlur={onBlur} />
                  )} />
                ) : null}

                <Controller control={control} name="phone" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Phone number" placeholder="02 1234 5678"
                    keyboardType="phone-pad" value={value} onChangeText={onChange} onBlur={onBlur} />
                )} />

                <Controller control={control} name="address" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Address" placeholder="123 Main St, Sydney NSW 2000"
                    autoCapitalize="words" value={value} onChangeText={onChange} onBlur={onBlur} />
                )} />

                <View style={{ gap: 12, marginTop: 8 }}>
                  <Button label="Add doctor" variant="primary" size="lg" isFullWidth
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
