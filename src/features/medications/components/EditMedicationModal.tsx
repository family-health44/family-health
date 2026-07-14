// src/features/medications/components/EditMedicationModal.tsx
// Modal for editing an existing medication. Opens when a card is tapped.
// React Hook Form + Zod. Same status picker pattern as AddMedicationModal.

import React, { useState, useEffect } from 'react';
import { Fonts } from '@/design-system/tokens/fonts';
import { View, Text, Modal, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';
import { InlinePicker } from '@/design-system/components/InlinePicker';
import { DateField } from '@/design-system/components/DateField';
import { FORM_OPTIONS, TIME_OF_DAY_OPTIONS, WITH_FOOD_OPTIONS } from './medicationFieldOptions';
import { toAppError } from '@/shared/types/errors';

import type { Medication, MedicationStatus } from '../types/medications.types';
import type { UpdateMedicationParams } from '../repository/medications.repository';
import { Icon } from '@/design-system/components/Icon';

// ── Status picker config ────────────────────────────────────────────────────
type PickerStatus = MedicationStatus;

const PICKER_OPTIONS: { value: PickerStatus; label: string }[] = [
  { value: 'active',    label: 'Active' },
  { value: 'as_needed', label: 'As Needed' },
  { value: 'inactive',  label: 'Inactive' },
];

// ── Zod schema ──────────────────────────────────────────────────────────────
const schema = z.object({
  name:        z.string().min(1, 'Name is required').max(100),
  dosage:      z.string().max(100).optional(),
  frequency:   z.string().max(100).optional(),
  reason:      z.string().max(200).optional(),
  startDate:   z.string().optional(),
  endDate:     z.string().optional(),
  status:      z.enum(['active', 'as_needed', 'inactive']),
  form:        z.string().nullable(),
  timeOfDay:   z.string().nullable(),
  withFood:    z.string().nullable(),
  repeatsLeft: z.string().max(6).optional(),
  nextRefill:  z.string().optional(),
  pharmacy:    z.string().max(120).optional(),
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
      name: '', dosage: '', frequency: '', reason: '', startDate: '', endDate: '', status: 'active',
      form: null, timeOfDay: null, withFood: null, repeatsLeft: '', nextRefill: '', pharmacy: '',
    },
  });

  // Populate form whenever the target medication changes (modal opens for a card).
  useEffect(() => {
    if (medication) {
      reset({
        name:        medication.name,
        dosage:      medication.dosage     ?? '',
        frequency:   medication.frequency  ?? '',
        reason:      medication.reason     ?? '',
        startDate:   medication.startDate  ?? '',
        endDate:     medication.endDate    ?? '',
        status:      medication.status,
        form:        medication.form       ?? null,
        timeOfDay:   medication.timeOfDay  ?? null,
        withFood:    medication.withFood   ?? null,
        repeatsLeft: medication.repeatsLeft != null ? String(medication.repeatsLeft) : '',
        nextRefill:  medication.nextRefill ?? '',
        pharmacy:    medication.pharmacy   ?? '',
      });
      setStatusOpen(false);
    }
  }, [medication, reset]);

  const selectedStatus = watch('status') as PickerStatus;
  const selectedLabel  = PICKER_OPTIONS.find((o) => o.value === selectedStatus)?.label ?? 'Active';

  const onSubmit = async (values: FormValues) => {
    if (!medication) return;
    const repeatsParsed = values.repeatsLeft && values.repeatsLeft.trim() !== ''
      ? Number.parseInt(values.repeatsLeft, 10)
      : null;
    try {
      await onSave({
        medicationId: medication.id,
        name:         values.name,
        dosage:       values.dosage      ?? null,
        frequency:    values.frequency   ?? null,
        reason:       values.reason      ?? null,
        status:       values.status      as MedicationStatus,
        startDate:    values.startDate && values.startDate.trim() !== '' ? values.startDate : null,
        endDate:      values.endDate && values.endDate.trim() !== '' ? values.endDate : null,
        prescribedBy: medication.prescribedBy,
        form:         values.form        ?? null,
        timeOfDay:    values.timeOfDay   ?? null,
        withFood:     values.withFood    ?? null,
        repeatsLeft:  Number.isNaN(repeatsParsed as number) ? null : repeatsParsed,
        nextRefill:   values.nextRefill && values.nextRefill.trim() !== '' ? values.nextRefill : null,
        pharmacy:     values.pharmacy && values.pharmacy.trim() !== '' ? values.pharmacy : null,
      });
    } catch (e) {
      Alert.alert('Could not save', toAppError(e).message);
      return;
    }
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
          <Pressable style={{ maxHeight: '90%' }}>
            <View style={{
              backgroundColor: '#F7F7F4',
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

              <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
                <Text style={{ fontSize: 22, fontWeight: '700', color: '#17211C', fontFamily: Fonts.serif, marginBottom: 4 }}>
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

                <Controller control={control} name="startDate" render={({ field: { onChange, value } }) => (
                  <DateField label="Start date" value={value || null} onChange={onChange} onClear={() => onChange('')} />
                )} />

                <Controller control={control} name="endDate" render={({ field: { onChange, value } }) => (
                  <DateField label="End date" value={value || null} onChange={onChange} onClear={() => onChange('')} />
                )} />

                <Controller control={control} name="form" render={({ field: { onChange, value } }) => (
                  <InlinePicker label="Form" options={FORM_OPTIONS} value={value} onChange={onChange} />
                )} />

                <Controller control={control} name="timeOfDay" render={({ field: { onChange, value } }) => (
                  <InlinePicker label="Time of day" options={TIME_OF_DAY_OPTIONS} value={value} onChange={onChange} />
                )} />

                <Controller control={control} name="withFood" render={({ field: { onChange, value } }) => (
                  <InlinePicker label="With food" options={WITH_FOOD_OPTIONS} value={value} onChange={onChange} />
                )} />

                <Controller control={control} name="repeatsLeft" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Repeats left" placeholder="e.g. 3"
                    keyboardType="number-pad"
                    value={value} onChangeText={onChange} onBlur={onBlur} />
                )} />

                <Controller control={control} name="nextRefill" render={({ field: { onChange, value } }) => (
                  <DateField label="Next refill" value={value || null} onChange={onChange} onClear={() => onChange('')} />
                )} />

                <Controller control={control} name="pharmacy" render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Pharmacy" placeholder="e.g. Chemist Warehouse"
                    autoCapitalize="words" value={value} onChangeText={onChange} onBlur={onBlur} />
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
                      borderColor: statusOpen ? '#1F5C41' : '#E3E2DB',
                      borderRadius: 10,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Select medication status"
                  >
                    <Text style={{ flex: 1, fontSize: 14, color: '#17211C' }}>{selectedLabel}</Text>
                    <Text style={{ color: 'rgba(23,33,28,0.55)', fontSize: 12 }}>{statusOpen ? '▲' : '▼'}</Text>
                  </Pressable>

                  {/* Options list */}
                  {statusOpen && (
                    <View style={{
                      backgroundColor: 'white',
                      borderWidth: 1,
                      borderColor: '#1F5C41',
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
                            borderBottomColor: '#F0EFEA',
                            backgroundColor: selectedStatus === opt.value ? '#E4EFE9' : 'white',
                          }}
                          accessibilityRole="menuitem"
                          accessibilityLabel={opt.label}
                          accessibilityState={{ selected: selectedStatus === opt.value }}
                        >
                          <Text style={{
                            flex: 1,
                            fontSize: 14,
                            color: selectedStatus === opt.value ? '#17452F' : '#17211C',
                            fontWeight: selectedStatus === opt.value ? '600' : '400',
                          }}>
                            {opt.label}
                          </Text>
                          {selectedStatus === opt.value && (
                            <Icon name="checkmark" size={13} color="#1F5C41" weight="semibold" />
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
