// src/features/family/components/AddPersonModal.tsx
// AddPersonModal — modal for adding a new family member.
// Uses React Hook Form + Zod. Calls onAdd with the name, no direct mutations.
// No business logic — parent hook handles the mutation.

import { useEffect, useRef } from 'react';
import { Fonts } from '@/design-system/tokens/fonts';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';

// ─── Schema ───────────────────────────────────────────────────────────────────

const addPersonSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be under 50 characters'),
});

type AddPersonFormValues = z.infer<typeof addPersonSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface AddPersonModalProps {
  visible: boolean;
  isLoading: boolean;
  onAdd: (name: string) => Promise<void>;
  onDismiss: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const AddPersonModal = ({
  visible,
  isLoading,
  onAdd,
  onDismiss,
}: AddPersonModalProps) => {
  const inputRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddPersonFormValues>({
    resolver: zodResolver(addPersonSchema),
    defaultValues: { name: '' },
  });

  // Focus input when modal opens
  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      reset();
    }
  }, [visible, reset]);

  const onSubmit = async (values: AddPersonFormValues) => {
    await onAdd(values.name);
    reset();
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
      accessibilityViewIsModal
    >
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
        onPress={onDismiss}
        accessibilityLabel="Close modal"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <Pressable>
            <View
              style={{
                backgroundColor: '#F7F7F4',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                padding: 24,
                paddingBottom: Platform.OS === 'ios' ? 40 : 24,
              }}
            >
              {/* Handle */}
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: '#D0CCC4',
                  borderRadius: 2,
                  alignSelf: 'center',
                  marginBottom: 20,
                }}
              />

              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '700',
                  color: '#17211C',
                  fontFamily: Fonts.serif,
                  marginBottom: 20,
                }}
              >
                Add family member
              </Text>

              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    ref={inputRef}
                    label="Full name"
                    isRequired
                    placeholder="e.g. Jane Smith"
                    autoCapitalize="words"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit(onSubmit)}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.name?.message}
                  />
                )}
              />

              <View style={{ marginTop: 20, gap: 12 }}>
                <Button
                  label="Add person"
                  variant="primary"
                  size="lg"
                  isFullWidth
                  isLoading={isLoading}
                  onPress={handleSubmit(onSubmit)}
                />
                <Button
                  label="Cancel"
                  variant="ghost"
                  size="lg"
                  isFullWidth
                  onPress={onDismiss}
                />
              </View>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};
