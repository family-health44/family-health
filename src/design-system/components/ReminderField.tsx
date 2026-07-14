// src/design-system/components/ReminderField.tsx
// One control, two modes.
//   mode='offset'   -> pick how long before a timed event (returns minutes)
//   mode='absolute' -> pick an exact date + time (returns ISO timestamp)
// The caller decides the mode based on whether the record has a time anchor.

import { useState } from 'react';
import { View, Text, Platform } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { PressableBase } from './PressableBase';
import { InlinePicker } from './InlinePicker';
import { OFFSET_OPTIONS } from '@/core/notifications/reminders.domain';

interface ReminderFieldProps {
  mode: 'offset' | 'absolute';
  offsetMinutes: number | null;
  reminderAt: string | null;               // ISO timestamp
  onChangeOffset: (minutes: number | null) => void;
  onChangeAt: (iso: string | null) => void;
}

function formatAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

export function ReminderField({
  mode, offsetMinutes, reminderAt, onChangeOffset, onChangeAt,
}: ReminderFieldProps) {
  const [open, setOpen] = useState(false);

  if (mode === 'offset') {
    const options = [
      { id: null as string | null, label: 'No reminder' },
      ...OFFSET_OPTIONS.map((o) => ({ id: String(o.minutes), label: o.label })),
    ];
    return (
      <InlinePicker
        label="Reminder"
        options={options}
        value={offsetMinutes == null ? null : String(offsetMinutes)}
        onChange={(id) => onChangeOffset(id == null ? null : Number(id))}
      />
    );
  }

  const display = reminderAt ? formatAt(reminderAt) : '';

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setOpen(false);
    if (event.type === 'dismissed' || !selected) return;
    onChangeAt(selected.toISOString());
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: '500', color: '#3D3D3D', marginBottom: 6 }}>
        Reminder
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <PressableBase
          onPress={() => setOpen((o) => !o)}
          accessibilityRole="button"
          accessibilityLabel={`Reminder: ${display || 'none set'}`}
          style={(pressed) => ({
            flex: 1,
            opacity: pressed ? 0.7 : 1,
            borderWidth: 1,
            borderColor: open ? '#3E7D62' : '#D8D4CC',
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 12,
            backgroundColor: '#fff',
          })}
        >
          <Text style={{ fontSize: 16, color: display ? '#17211C' : 'rgba(23,33,28,0.55)' }}>
            {display || 'No reminder'}
          </Text>
        </PressableBase>
        {display ? (
          <PressableBase
            onPress={() => { setOpen(false); onChangeAt(null); }}
            accessibilityRole="button"
            accessibilityLabel="Clear reminder"
            style={(pressed) => ({
              marginLeft: 8, width: 32, height: 32, borderRadius: 16,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: '#F0EFEA', opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text style={{ fontSize: 15, color: 'rgba(23,33,28,0.55)' }}>✕</Text>
          </PressableBase>
        ) : null}
      </View>
      {open ? (
        <View style={{ marginTop: 8 }}>
          <DateTimePicker
            value={reminderAt && !Number.isNaN(new Date(reminderAt).getTime())
              ? new Date(reminderAt)
              : new Date(Date.now() + 60 * 60 * 1000)}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleChange}
          />
        </View>
      ) : null}
    </View>
  );
}
