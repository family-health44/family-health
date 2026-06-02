// src/features/appointments/components/AppointmentCaptureSection.tsx
// Reusable inline capture section — text input + list of captured items.
// Used for notes, todos, and medical events during an appointment.
// No business logic — purely presentational with callbacks.

import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';

interface CaptureItem {
  id: string;
  label: string;
}

interface AppointmentCaptureSectionProps {
  title: string;
  placeholder: string;
  items: CaptureItem[];
  onAdd: (value: string) => void;
  onRemove: (id: string) => void;
  multiline?: boolean;
}

export const AppointmentCaptureSection = ({
  title, placeholder, items, onAdd, onRemove, multiline = false,
}: AppointmentCaptureSectionProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (!inputValue.trim()) return;
    onAdd(inputValue.trim());
    setInputValue('');
  };

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{
        fontSize: 13, fontWeight: '600', color: '#6B6866',
        textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10,
      }}>
        {title}
      </Text>

      {/* Input row */}
      <View style={{
        flexDirection: multiline ? 'column' : 'row',
        gap: 8,
        marginBottom: items.length > 0 ? 10 : 0,
      }}>
        <TextInput
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={placeholder}
          placeholderTextColor="#9E9B95"
          autoCapitalize="sentences"
          returnKeyType={multiline ? 'default' : 'done'}
          onSubmitEditing={multiline ? undefined : handleAdd}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          style={{
            flex: multiline ? undefined : 1,
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#C8C4BC',
            paddingHorizontal: 14,
            paddingVertical: 10,
            fontSize: 15,
            color: '#1A1A1A',
            minHeight: multiline ? 80 : undefined,
            textAlignVertical: multiline ? 'top' : 'center',
          }}
          accessibilityLabel={placeholder}
        />
        <Pressable
          onPress={handleAdd}
          accessibilityRole="button"
          accessibilityLabel={`Add ${title}`}
          style={({ pressed }) => ({
            backgroundColor: '#2A6049',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 10,
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: multiline ? 'flex-end' : undefined,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 15 }}>Add</Text>
        </Pressable>
      </View>

      {/* Captured items */}
      {items.map((item) => (
        <View key={item.id} style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          backgroundColor: '#FFFFFF',
          borderRadius: 10,
          borderWidth: 1,
          borderColor: '#E8E4DC',
          padding: 12,
          marginBottom: 6,
          gap: 10,
        }}>
          <Text style={{ flex: 1, fontSize: 14, color: '#1A1A1A', lineHeight: 20 }}>
            {item.label}
          </Text>
          <Pressable
            onPress={() => onRemove(item.id)}
            accessibilityRole="button"
            accessibilityLabel="Remove item"
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <Text style={{ fontSize: 18, color: '#9B3A4A' }}>×</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
};
