// src/features/todos/components/AddTodoModal.tsx
// Modal for adding a new todo. React Hook Form + Zod. No business logic.

import { View, Text, Modal, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';

import type { InsertTodoParams } from '../repository/todos.repository';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  notes: z.string().max(500).optional(),
  dueDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;
type AddTodoInput = Omit<InsertTodoParams, 'familyGroupId'>;

interface AddTodoModalProps {
  visible: boolean;
  isLoading: boolean;
  defaultPersonId?: string | null;
  onAdd: (input: AddTodoInput) => Promise<void>;
  onDismiss: () => void;
}

export const AddTodoModal = ({
  visible, isLoading, defaultPersonId, onAdd, onDismiss,
}: AddTodoModalProps) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', notes: '', dueDate: '' },
  });

  const onSubmit = async (values: FormValues) => {
    await onAdd({
      title: values.title,
      notes: values.notes ?? null,
      dueDate: values.dueDate ?? null,
      personId: defaultPersonId ?? null,
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
              maxHeight: '85%',
            }}>
              <View style={{
                width: 40, height: 4, backgroundColor: '#D0CCC4',
                borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 20,
              }} />

              <ScrollView contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 }}>
                  Add to-do
                </Text>

                <Controller control={control} name="title" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Title" isRequired placeholder="e.g. Book follow-up appointment"
                    autoCapitalize="sentences" value={value} onChangeText={onChange}
                    onBlur={onBlur} error={errors.title?.message} />
                )} />

                <Controller control={control} name="notes" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Notes" placeholder="Additional details (optional)"
                    autoCapitalize="sentences" multiline numberOfLines={2}
                    value={value} onChangeText={onChange} onBlur={onBlur} />
                )} />

                <Controller control={control} name="dueDate" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Due date" placeholder="YYYY-MM-DD (optional)"
                    keyboardType="numbers-and-punctuation"
                    value={value} onChangeText={onChange} onBlur={onBlur} />
                )} />

                <View style={{ gap: 12, marginTop: 8 }}>
                  <Button label="Add to-do" variant="primary" size="lg" isFullWidth
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
