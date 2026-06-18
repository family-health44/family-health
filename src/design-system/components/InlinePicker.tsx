// src/design-system/components/InlinePicker.tsx
// Shared in-modal select: collapsed row with ▼ chevron, expands to a checkable list.
// Superset of the prior 5 local copies — `isRequired` and `error` are optional,
// so it drops in for callers that never passed them with no behaviour change.

import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';

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
      <Pressable onPress={() => setOpen(!open)} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: error ? '#B91C1C' : open ? '#2A6049' : '#E3DDD5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 }}>
        <Text style={{ flex: 1, fontSize: 14, color: selected?.id ? '#1C1917' : '#A8A09A' }}>{selected?.label ?? 'Select...'}</Text>
        <Text style={{ color: '#A8A09A', fontSize: 12 }}>{open ? '▲' : '▼'}</Text>
      </Pressable>
      {open && (
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#2A6049', borderRadius: 10, overflow: 'hidden' }}>
          {options.map((opt, i) => (
            <Pressable key={opt.id ?? 'none'} onPress={() => { onChange(opt.id); setOpen(false); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 14, borderBottomWidth: i < options.length - 1 ? 1 : 0, borderBottomColor: '#F0EDE8', backgroundColor: (value ?? null) === opt.id ? '#E6F0EC' : 'white' }}>
              <Text style={{ flex: 1, fontSize: 14, color: (value ?? null) === opt.id ? '#1A4D35' : '#1C1917', fontWeight: (value ?? null) === opt.id ? '600' : '400' }}>{opt.label}</Text>
              {(value ?? null) === opt.id && <Text style={{ color: '#2A6049', fontSize: 14 }}>✓</Text>}
            </Pressable>
          ))}
        </View>
      )}
      {error ? <Text style={{ fontSize: 12, color: '#B91C1C' }}>{error}</Text> : null}
    </View>
  );
};
