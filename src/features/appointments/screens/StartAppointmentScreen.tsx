// src/features/appointments/screens/StartAppointmentScreen.tsx
// Start Appointment screen — capture notes, todos, and medical events
// during an active visit. All items saved to Supabase on completion.
// Accessed from a visit detail — visitId and personId passed via route params.

import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/design-system/components/Button';
import { ErrorState } from '@/design-system/components/EmptyState';
import { MEDICAL_EVENT_CONFIG, MEDICAL_EVENT_TYPES } from '@/features/medical-events/types/medical-events.types';
import { useActiveAppointment } from '../hooks/useActiveAppointment';
import { AppointmentCaptureSection } from '../components/AppointmentCaptureSection';

import type { MedicalEventType } from '@/features/medical-events/types/medical-events.types';

export const StartAppointmentScreen = () => {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    visitId: string;
    personId: string;
    personName: string;
    doctorId?: string;
    doctorName?: string;
    visitDate: string;
  }>();

  const {
    appointment, isSaving, error,
    startAppointment, addNote, removeNote,
    addTodo, removeTodo, addEvent, removeEvent,
    setPostNotes, saveAppointment, cancelAppointment,
  } = useActiveAppointment();

  // Start appointment on first render if not already started
  if (!appointment && params.visitId) {
    startAppointment({
      visitId: params.visitId,
      personId: params.personId ?? '',
      personName: params.personName ?? '',
      doctorId: params.doctorId ?? null,
      doctorName: params.doctorName ?? null,
      visitDate: params.visitDate ?? '',
    });
  }

  // Event capture state
  const [eventDate, setEventDate] = useState('');
  const [eventType, setEventType] = useState<MedicalEventType>('diagnosis');
  const [eventDescription, setEventDescription] = useState('');

  const handleAddEvent = () => {
    if (!eventDescription.trim() || !eventDate.trim()) return;
    addEvent(eventDate.trim(), eventType, eventDescription.trim());
    setEventDate('');
    setEventDescription('');
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel appointment',
      'Any captured notes, todos, and events will be lost.',
      [
        { text: 'Keep going', style: 'cancel' },
        { text: 'Cancel appointment', style: 'destructive', onPress: cancelAppointment },
      ],
    );
  };

  if (!appointment) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}>
        <ErrorState message="Could not start appointment. Missing visit details." onRetry={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#2A6049',
        paddingTop: insets.top + 8,
        paddingBottom: 16,
        paddingHorizontal: 16,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: '#A8C4B8', fontWeight: '500' }}>
              In progress
            </Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginTop: 2 }}>
              {appointment.personName}
            </Text>
            {appointment.doctorName ? (
              <Text style={{ fontSize: 14, color: '#A8C4B8', marginTop: 2 }}>
                {appointment.doctorName}
              </Text>
            ) : null}
          </View>
          <Pressable
            onPress={handleCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancel appointment"
            style={({ pressed }) => ({
              paddingHorizontal: 12, paddingVertical: 6,
              borderRadius: 8, borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.3)',
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '500' }}>Cancel</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View style={{
            backgroundColor: '#F5E8EB', borderColor: '#E0BDC4',
            borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16,
          }}>
            <Text style={{ color: '#7A2030', fontSize: 14 }}>{error.message}</Text>
          </View>
        ) : null}

        {/* Notes section */}
        <AppointmentCaptureSection
          title="Notes"
          placeholder="Capture a note..."
          items={appointment.notes.map((n) => ({ id: n.id, label: n.content }))}
          onAdd={addNote}
          onRemove={removeNote}
          multiline
        />

        {/* To-dos section */}
        <AppointmentCaptureSection
          title="To-dos"
          placeholder="Add a follow-up task..."
          items={appointment.todos.map((t) => ({ id: t.id, label: t.title }))}
          onAdd={addTodo}
          onRemove={removeTodo}
        />

        {/* Medical events section */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{
            fontSize: 13, fontWeight: '600', color: '#6B6866',
            textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10,
          }}>
            Medical events
          </Text>

          {/* Event type chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {MEDICAL_EVENT_TYPES.map((type) => (
                <Pressable
                  key={type}
                  onPress={() => setEventType(type)}
                  style={{
                    paddingHorizontal: 10, paddingVertical: 5,
                    borderRadius: 16, borderWidth: 1,
                    borderColor: eventType === type ? '#2A6049' : '#C8C4BC',
                    backgroundColor: eventType === type ? '#E6F0EC' : 'transparent',
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    color: eventType === type ? '#1A4D35' : '#4A4744',
                    fontWeight: eventType === type ? '600' : '400',
                  }}>
                    {MEDICAL_EVENT_CONFIG[type].label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Date + description + add button */}
          <View style={{ gap: 8 }}>
            <TextInput
              value={eventDate}
              onChangeText={setEventDate}
              placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor="#9E9B95"
              keyboardType="numbers-and-punctuation"
              style={{
                backgroundColor: '#FFFFFF', borderRadius: 12,
                borderWidth: 1, borderColor: '#C8C4BC',
                paddingHorizontal: 14, paddingVertical: 10,
                fontSize: 15, color: '#1A1A1A',
              }}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                value={eventDescription}
                onChangeText={setEventDescription}
                placeholder="Description..."
                placeholderTextColor="#9E9B95"
                autoCapitalize="sentences"
                style={{
                  flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12,
                  borderWidth: 1, borderColor: '#C8C4BC',
                  paddingHorizontal: 14, paddingVertical: 10,
                  fontSize: 15, color: '#1A1A1A',
                }}
              />
              <Pressable
                onPress={handleAddEvent}
                style={({ pressed }) => ({
                  backgroundColor: '#2A6049', borderRadius: 12,
                  paddingHorizontal: 16, paddingVertical: 10,
                  alignItems: 'center', justifyContent: 'center',
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 15 }}>Add</Text>
              </Pressable>
            </View>
          </View>

          {/* Captured events */}
          {appointment.events.map((e) => (
            <View key={e.id} style={{
              flexDirection: 'row', alignItems: 'flex-start',
              backgroundColor: '#FFFFFF', borderRadius: 10,
              borderWidth: 1, borderColor: '#E8E4DC',
              padding: 12, marginTop: 6, gap: 10,
            }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: '#6B6866', marginBottom: 2 }}>
                  {MEDICAL_EVENT_CONFIG[e.eventType].label} · {e.eventDate}
                </Text>
                <Text style={{ fontSize: 14, color: '#1A1A1A' }}>{e.description}</Text>
              </View>
              <Pressable
                onPress={() => removeEvent(e.id)}
                hitSlop={8}
                style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
              >
                <Text style={{ fontSize: 18, color: '#9B3A4A' }}>×</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Post-visit notes */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{
            fontSize: 13, fontWeight: '600', color: '#6B6866',
            textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10,
          }}>
            Post-visit summary
          </Text>
          <TextInput
            value={appointment.postNotes}
            onChangeText={setPostNotes}
            placeholder="Overall summary, outcomes, next steps..."
            placeholderTextColor="#9E9B95"
            autoCapitalize="sentences"
            multiline
            numberOfLines={4}
            style={{
              backgroundColor: '#FFFFFF', borderRadius: 12,
              borderWidth: 1, borderColor: '#C8C4BC',
              paddingHorizontal: 14, paddingVertical: 12,
              fontSize: 15, color: '#1A1A1A',
              minHeight: 100, textAlignVertical: 'top',
            }}
          />
        </View>

        {/* Save button */}
        <Button
          label="Save appointment"
          variant="primary"
          size="lg"
          isFullWidth
          isLoading={isSaving}
          onPress={saveAppointment}
        />
      </ScrollView>
    </View>
  );
};
