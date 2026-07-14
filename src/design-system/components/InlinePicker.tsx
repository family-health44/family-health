// src/design-system/components/InlinePicker.tsx
// Shared in-modal select: collapsed row with ▼ chevron, expands to a checkable list.
// Superset of the prior 5 local copies — `isRequired` and `error` are optional,
// so it drops in for callers that never passed them with no behaviour change.

import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Icon } from '@/design-system/components/Icon';

export interface InlinePickerOption {
  id: string | null;
  label: string;
}

interface InlinePickerProps {
  label: string;
  options: InlinePickerOption[];
  value: string | null | undefined;
  onChange: (id: string | null) => void;
  isRequired?: boolean;
  error?: string;
}

export const InlinePicker = ({ label, options, value, onChange, isRequired, error }: InlinePickerProps) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === (value ?? null));
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#3D3D3D' }}>
        {label}{isRequired ? <Text style={{ color: '#B91C1C' }}> *</Text> : null}
      </Text>
      <Pressable onPress={() => setOpen(!open)} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: error ? '#B91C1C' : open ? '#1F5C41' : '#E3E2DB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 }}>
        <Text style={{ flex: 1, fontSize: 14, color: selected?.id ? '#17211C' : 'rgba(23,33,28,0.55)' }}>{selected?.label ?? 'Select...'}</Text>
        <Text style={{ color: 'rgba(23,33,28,0.55)', fontSize: 12 }}>{open ? '▲' : '▼'}</Text>
      </Pressable>
      {open && (
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#1F5C41', borderRadius: 10, overflow: 'hidden' }}>
          {options.map((opt, i) => (
            <Pressable key={opt.id ?? 'none'} onPress={() => { onChange(opt.id); setOpen(false); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 14, borderBottomWidth: i < options.length - 1 ? 1 : 0, borderBottomColor: '#F0EFEA', backgroundColor: (value ?? null) === opt.id ? '#E4EFE9' : 'white' }}>
              <Text style={{ flex: 1, fontSize: 14, color: (value ?? null) === opt.id ? '#17452F' : '#17211C', fontWeight: (value ?? null) === opt.id ? '600' : '400' }}>{opt.label}</Text>
              {(value ?? null) === opt.id && <Icon name="checkmark" size={13} color="#1F5C41" weight="semibold" />}
            </Pressable>
          ))}
        </View>
      )}
      {error ? <Text style={{ fontSize: 12, color: '#B91C1C' }}>{error}</Text> : null}
    </View>
  );
};
