// src/features/doctors/components/AddDoctorModal.tsx
// Modal for adding a new doctor — name, type, phone, address.
// React Hook Form + Zod. No business logic.

import { View, Text, Modal, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';

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
  const { control, handleSubmit, reset, formState: { errors } } = useForm<AddDoctorFormValues>({
    resolver: zodResolver(addDoctorSchema),
    defaultValues: { name: '', type: '', phone: '', address: '' },
  });

  const onSubmit = async (values: AddDoctorFormValues) => {
    await onAdd({
      name: values.name,
      type: values.type ?? null,
      phone: values.phone ?? null,
      address: values.address ?? null,
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
            <View
              style={{
                backgroundColor: '#F7F5F0',
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
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 }}>
                  Add doctor
                </Text>

                <Controller control={control} name="name" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Full name" isRequired placeholder="Dr. Jane Smith"
                    autoCapitalize="words" value={value} onChangeText={onChange}
                    onBlur={onBlur} error={errors.name?.message} />
                )} />

                <Controller control={control} name="type" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Specialty / type" placeholder="e.g. GP, Cardiologist"
                    autoCapitalize="words" value={value} onChangeText={onChange} onBlur={onBlur} />
                )} />

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
