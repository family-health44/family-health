// src/design-system/components/DateField.tsx
// Native date / time picker fields that preserve the existing string contracts
// used by the forms, so call-sites swap in with a one-line change.
//
//   <DateField>  value/onChange are ISO 'YYYY-MM-DD'
//   <TimeField>  value/onChange are 'HH:MM' (24h)
//
// Tap the field to reveal the native iOS picker inline; tap again to collapse.

import { useState } from 'react';
import { View, Text, Platform } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { PressableBase } from './PressableBase';
import { isoToDisplayDate } from '@/shared/utils/dates';

// ─── Local (non-UTC) ISO parsing/formatting — never use toISOString() (AEST drift) ──

function isoToLocalDate(iso: string | null | undefined): Date {
  if (iso) {
    const [y, m, d] = iso.split('-').map(Number);
    if (y && m && d) return new Date(y, m - 1, d, 12, 0, 0); // noon avoids DST edge shifts
  }
  return new Date();
}

function dateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function timeStrToDate(value: string | null | undefined): Date {
  const now = new Date();
  if (value) {
    const [h, min] = value.split(':').map(Number);
    if (h !== undefined && !Number.isNaN(h)) now.setHours(h, min === undefined || Number.isNaN(min) ? 0 : min, 0, 0);
  }
  return now;
}

function dateToTimeStr(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// ─── Shared shell ─────────────────────────────────────────────────────────────

interface FieldShellProps {
  label: string;
  isRequired?: boolean;
  displayText: string;
  placeholder: string;
  error?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FieldShell({
  label,
  isRequired,
  displayText,
  placeholder,
  error,
  open,
  onToggle,
  children,
}: FieldShellProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', marginBottom: 6 }}>
        <Text style={{ fontSize: 14, fontWeight: '500', color: '#3D3D3D' }}>{label}</Text>
        {isRequired ? <Text style={{ color: '#A32D2D' }}> *</Text> : null}
      </View>
      <PressableBase
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${displayText || placeholder}`}
        style={(pressed) => ({
          opacity: pressed ? 0.7 : 1,
          borderWidth: 1,
          borderColor: error ? '#A32D2D' : open ? '#3E7D62' : '#D8D4CC',
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 12,
          backgroundColor: '#fff',
        })}
      >
        <Text style={{ fontSize: 16, color: displayText ? '#1C1917' : '#A8A09A' }}>
          {displayText || placeholder}
        </Text>
      </PressableBase>
      {open ? <View style={{ marginTop: 8 }}>{children}</View> : null}
      {error ? <Text style={{ fontSize: 12, color: '#A32D2D', marginTop: 4 }}>{error}</Text> : null}
    </View>
  );
}

// ─── DateField (ISO YYYY-MM-DD) ───────────────────────────────────────────────

interface DateFieldProps {
  label: string;
  value: string | null | undefined;
  onChange: (iso: string) => void;
  isRequired?: boolean;
  placeholder?: string;
  error?: string;
}

export function DateField({
  label,
  value,
  onChange,
  isRequired,
  placeholder = 'Select a date',
  error,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setOpen(false);
    if (event.type === 'dismissed' || !selected) return;
    onChange(dateToIso(selected));
  };

  return (
    <FieldShell
      label={label}
      isRequired={isRequired}
      displayText={value ? isoToDisplayDate(value) : ''}
      placeholder={placeholder}
      error={error}
      open={open}
      onToggle={() => setOpen((o) => !o)}
    >
      <DateTimePicker
        value={isoToLocalDate(value)}
        mode="date"
        display={Platform.OS === 'ios' ? 'inline' : 'default'}
        onChange={handleChange}
      />
    </FieldShell>
  );
}

// ─── TimeField (HH:MM 24h) ────────────────────────────────────────────────────

interface TimeFieldProps {
  label: string;
  value: string | null | undefined;
  onChange: (time: string) => void;
  isRequired?: boolean;
  placeholder?: string;
  error?: string;
}

export function TimeField({
  label,
  value,
  onChange,
  isRequired,
  placeholder = 'Select a time',
  error,
}: TimeFieldProps) {
  const [open, setOpen] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setOpen(false);
    if (event.type === 'dismissed' || !selected) return;
    onChange(dateToTimeStr(selected));
  };

  return (
    <FieldShell
      label={label}
      isRequired={isRequired}
      displayText={value ?? ''}
      placeholder={placeholder}
      error={error}
      open={open}
      onToggle={() => setOpen((o) => !o)}
    >
      <DateTimePicker
        value={timeStrToDate(value)}
        mode="time"
        is24Hour
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={handleChange}
      />
    </FieldShell>
  );
}
