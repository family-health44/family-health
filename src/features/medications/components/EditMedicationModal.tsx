// src/features/medications/components/EditMedicationModal.tsx
// Modal for editing an existing medication. Opens when a card is tapped.
// React Hook Form + Zod. Same status picker pattern as AddMedicationModal.

import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';

import type { Medication, MedicationStatus } from '../types/medications.types';
import type { UpdateMedicationParams } from '../repository/medications.repository';

// ── Status picker config ────────────────────────────────────────────────────
type PickerStatus = Exclude<MedicationStatus, 'completed'>;

const PICKER_OPTIONS: { value: PickerStatus; label: string }[] = [
  { value: 'active',    label: 'Active' },
  { value: 'as_needed', label: 'As Needed' },
  { value: 'inactive',  label: 'Inactive' },
];

// Legacy 'completed' rows default to 'inactive' in the picker; all other
// values pass through. The picker never writes 'completed' back.
function toPickerStatus(s: MedicationStatus): PickerStatus {
  return s === 'completed' ? 'inactive' : s;
}

// ── Zod schema ──────────────────────────────────────────────────────────────
const schema = z.object({
  name:      z.string().min(1, 'Name is required').max(100),
  dosage:    z.string().max(100).optional(),
  frequency: z.string().max(100).optional(),
  reason:    z.string().max(200).optional(),
  startDate: z.string().optional(),
  status:    z.enum(['active', 'as_needed', 'inactive']),
});

type FormValues = z.infer<typeof schema>;

interface EditMedicationModalProps {
  visible: boolean;
  isLoading: boolean;
  medication: Medication | null;
  onSave: (params: UpdateMedicationParams) => Promise<void>;
  onDismiss: () => void;
}

export const EditMedicationModal = ({
  visible, isLoading, medication, onSave, onDismiss,
}: EditMedicationModalProps) => {
  const [statusOpen, setStatusOpen] = useState(false);

  const {
    control, handleSubmit, reset, formState: { errors }, watch, setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', dosage: '', frequency: '', reason: '', startDate: '', status: 'active',
    },
  });

  // Populate form whenever the target medication changes (modal opens for a card).
  useEffect(() => {
    if (medication) {
      reset({
        name:      medication.name,
        dosage:    medication.dosage     ?? '',
        frequency: medication.frequency  ?? '',
        reason:    medication.reason     ?? '',
        startDate: medication.startDate  ?? '',
        status:    toPickerStatus(medication.status),
      });
      setStatusOpen(false);
    }
  }, [medication, reset]);

  const selectedStatus = watch('status') as PickerStatus;
  const selectedLabel  = PICKER_OPTIONS.find((o) => o.value === selectedStatus)?.label ?? 'Active';

  const onSubmit = async (values: FormValues) => {
    if (!medication) return;
    await onSave({
      medicationId: medication.id,
      name:         values.name,
      dosage:       values.dosage      ?? null,
      frequency:    values.frequency   ?? null,
      reason:       values.reason      ?? null,
      status:       values.status      as MedicationStatus,
      startDate:    values.startDate   ?? null,
      endDate:      medication.endDate,
      prescribedBy: medication.prescribedBy,
    });
    onDismiss();
  };

  const handleDismiss = () => {
    setStatusOpen(false);
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleDismiss}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
        onPress={handleDismiss}
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
              {/* Handle */}
              <View style={{
                width: 40, height: 4, backgroundColor: '#D0CCC4',
                borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 20,
              }} />

              <ScrollView contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 }}>
                  Edit medication
                </Text>

                {/* ── Text fields ─────────────────────────────────────────── */}
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

                {/* ── Status picker (styled to match the To Do doctor selector) ── */}
                <View style={{ gap: 6 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#3D3D3D' }}>
                    Status
                  </Text>

                  {/* Trigger */}
                  <Pressable
                    onPress={() => setStatusOpen(!statusOpen)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'white',
                      borderWidth: 1,
                      borderColor: statusOpen ? '#2A6049' : '#E3DDD5',
                      borderRadius: 10,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Select medication status"
                  >
                    <Text style={{ flex: 1, fontSize: 14, color: '#1C1917' }}>{selectedLabel}</Text>
                    <Text style={{ color: '#A8A09A', fontSize: 12 }}>{statusOpen ? '▲' : '▼'}</Text>
                  </Pressable>

                  {/* Options list */}
                  {statusOpen && (
                    <View style={{
                      backgroundColor: 'white',
                      borderWidth: 1,
                      borderColor: '#2A6049',
                      borderRadius: 10,
                      overflow: 'hidden',
                    }}>
                      {PICKER_OPTIONS.map((opt, i) => (
                        <Pressable
                          key={opt.value}
                          onPress={() => {
                            setValue('status', opt.value, { shouldValidate: true });
                            setStatusOpen(false);
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 11,
                            paddingHorizontal: 14,
                            borderBottomWidth: i < PICKER_OPTIONS.length - 1 ? 1 : 0,
                            borderBottomColor: '#F0EDE8',
                            backgroundColor: selectedStatus === opt.value ? '#E6F0EC' : 'white',
                          }}
                          accessibilityRole="menuitem"
                          accessibilityLabel={opt.label}
                          accessibilityState={{ selected: selectedStatus === opt.value }}
                        >
                          <Text style={{
                            flex: 1,
                            fontSize: 14,
                            color: selectedStatus === opt.value ? '#1A4D35' : '#1C1917',
                            fontWeight: selectedStatus === opt.value ? '600' : '400',
                          }}>
                            {opt.label}
                          </Text>
                          {selectedStatus === opt.value && (
                            <Text style={{ color: '#2A6049', fontSize: 14 }}>✓</Text>
                          )}
                        </Pressable>
                      ))}
                    </View>
                  )}

                  {errors.status?.message ? (
                    <Text style={{ fontSize: 12, color: '#C0392B', marginTop: 4 }}>
                      {errors.status.message}
                    </Text>
                  ) : null}
                </View>

                {/* ── Actions ──────────────────────────────────────────────── */}
                <View style={{ gap: 12, marginTop: 8 }}>
                  <Button label="Save changes" variant="primary" size="lg" isFullWidth
                    isLoading={isLoading} onPress={handleSubmit(onSubmit)} />
                  <Button label="Cancel" variant="ghost" size="lg" isFullWidth onPress={handleDismiss} />
                </View>
              </ScrollView>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};
