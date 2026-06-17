// src/features/medical-events/components/EditMedicalEventModal.tsx
// Modal for editing an existing medical event — prefilled from the event.
import { useEffect } from 'react';
import { View, Text, Modal, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';
import { MEDICAL_EVENT_CONFIG, MEDICAL_EVENT_TYPES } from '../types/medical-events.types';
import type { MedicalEvent, MedicalEventType } from '../types/medical-events.types';
import type { UpdateEventInput } from '../hooks/usePersonMedicalEvents';

const schema = z.object({
  eventDate: z.string().min(1, 'Date is required').regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  eventType: z.enum(MEDICAL_EVENT_TYPES as [MedicalEventType, ...MedicalEventType[]]),
  description: z.string().min(1, 'Description is required').max(500),
});
type FormValues = z.infer<typeof schema>;

interface EditMedicalEventModalProps {
  visible: boolean;
  isLoading: boolean;
  event: MedicalEvent | null;
  onSave: (input: UpdateEventInput) => Promise<void>;
  onDismiss: () => void;
}

export const EditMedicalEventModal = ({
  visible, isLoading, event, onSave, onDismiss,
}: EditMedicalEventModalProps) => {
  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: { eventDate: '', eventType: 'diagnosis', description: '' },
    });

  useEffect(() => {
    if (event) {
      reset({ eventDate: event.eventDate, eventType: event.eventType, description: event.description });
    }
  }, [event, reset]);

  const selectedType = watch('eventType');

  const onSubmit = async (values: FormValues) => {
    if (!event) return;
    await onSave({
      noteId: event.id,
      eventDate: values.eventDate,
      eventType: values.eventType,
      description: values.description,
      doctorId: event.doctorId,
    });
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
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 }}>Edit medical event</Text>
                <Controller control={control} name="eventDate"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input label="Date" isRequired placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation"
                      value={value} onChangeText={onChange} onBlur={onBlur} error={errors.eventDate?.message} />
                  )}
                />
                <View style={{ gap: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#3D3D3D' }}>
                    Event type <Text style={{ color: '#9B3A4A' }}>*</Text>
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {MEDICAL_EVENT_TYPES.map((type) => {
                      const isSelected = selectedType === type;
                      return (
                        <Pressable key={type} onPress={() => setValue('eventType', type)}
                          accessibilityRole="radio" accessibilityState={{ selected: isSelected }}
                          style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1,
                            borderColor: isSelected ? '#2A6049' : '#C8C4BC', backgroundColor: isSelected ? '#E6F0EC' : 'transparent' }}>
                          <Text style={{ fontSize: 13, color: isSelected ? '#1A4D35' : '#4A4744', fontWeight: isSelected ? '600' : '400' }}>
                            {MEDICAL_EVENT_CONFIG[type].label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
                <Controller control={control} name="description"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input label="Description" isRequired placeholder="e.g. Type 2 diabetes diagnosed"
                      autoCapitalize="sentences" multiline numberOfLines={3}
                      style={{ textAlignVertical: 'top', minHeight: 80 }}
                      value={value} onChangeText={onChange} onBlur={onBlur} error={errors.description?.message} />
                  )}
                />
                <View style={{ gap: 12, marginTop: 8 }}>
                  <Button label="Save changes" variant="primary" size="lg" isFullWidth isLoading={isLoading} onPress={handleSubmit(onSubmit)} />
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
