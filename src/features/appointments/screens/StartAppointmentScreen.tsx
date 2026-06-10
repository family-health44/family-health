// src/features/appointments/screens/StartAppointmentScreen.tsx
// Live appointment screen — matches PWA design exactly.
import { PressableBase } from '@/design-system/components/PressableBase';
import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorState } from '@/design-system/components/EmptyState';
import { Fonts } from '@/design-system/tokens/fonts';
import { MEDICAL_EVENT_CONFIG, MEDICAL_EVENT_TYPES } from '@/features/medical-events/types/medical-events.types';
import { useActiveAppointment } from '../hooks/useActiveAppointment';
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
    preNotes?: string;
  }>();

  const {
    appointment, isSaving, error,
    startAppointment, addNote, removeNote,
    addTodo, removeTodo, addEvent, removeEvent,
    setPostNotes, saveAppointment, cancelAppointment,
  } = useActiveAppointment();

  if (!appointment && params.visitId) {
    startAppointment({
      visitId: params.visitId,
      personId: params.personId ?? '',
      personName: params.personName ?? '',
      doctorId: params.doctorId ?? null,
      doctorName: params.doctorName ?? null,
      visitDate: params.visitDate ?? '',
      preNotes: params.preNotes ? decodeURIComponent(params.preNotes) : null,
    });
  }

  const [eventType, setEventType] = useState<MedicalEventType>('procedure');
  const [eventDescription, setEventDescription] = useState('');
  const [saveToEvents, setSaveToEvents] = useState(false);
  const [captureNote, setCaptureNote] = useState('');
  const [todoText, setTodoText] = useState('');

  const handleAddEvent = () => {
    if (!eventDescription.trim()) return;
    const today = new Date().toISOString().split('T')[0] ?? '';
    addEvent(today, eventType, eventDescription.trim());
    setEventDescription('');
  };

  const handleAddTodo = () => {
    if (!todoText.trim()) return;
    addTodo(todoText.trim());
    setTodoText('');
  };

  const handleFinish = () => {
    if (captureNote.trim()) addNote(captureNote.trim());
    saveAppointment();
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
        <ErrorState message="Could not start appointment." onRetry={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}>
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 4,
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E3DDD5',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
      }}>
        <View style={{ flex: 1 }}>
          <PressableBase
            onPress={handleCancel}
            style={(pressed) => ({ opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 })}
          >
            <Text style={{ fontSize: 15, color: '#2A6049' }}>‹</Text>
            <Text style={{ fontSize: 14, color: '#2A6049', fontWeight: '500' }}>Back</Text>
          </PressableBase>
          <Text style={{ fontSize: 22, fontWeight: '300', fontFamily: Fonts.serif, color: '#1C1917', lineHeight: 26 }}>
            {appointment.doctorName ?? 'Appointment'}
          </Text>
          <Text style={{ fontSize: 12, color: '#6B6460', marginTop: 2 }}>
            {appointment.personName} · {appointment.visitDate}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 20 }}>
          <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#2A6049' }} />
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#2A6049' }}>Live</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View style={{ backgroundColor: '#F5E8EB', borderColor: '#E0BDC4', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16 }}>
            <Text style={{ color: '#7A2030', fontSize: 14 }}>{error.message}</Text>
          </View>
        ) : null}

        {/* BRIEFING */}
        <Text style={{ fontSize: 10, fontWeight: '700', color: '#A8A09A', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
          Briefing
        </Text>
        <View style={{ backgroundColor: '#E8F4F8', borderWidth: 1, borderColor: '#B8D8EE', borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#1C1917', marginBottom: 4 }}>Pre-notes</Text>
          <Text style={{ fontSize: 13, color: '#1C1917', lineHeight: 19 }}>
            {appointment.preNotes?.trim() ? appointment.preNotes : 'No pre-notes for this appointment.'}
          </Text>
        </View>

        {/* FULL HISTORY */}
        <PressableBase style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E3DDD5', marginBottom: 16 }}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: '#A8A09A', textTransform: 'uppercase', letterSpacing: 0.8, flex: 1 }}>Full History</Text>
          <Text style={{ fontSize: 12, color: '#A8A09A' }}>0 items ›</Text>
        </PressableBase>

        {/* CAPTURE NOW */}
        <Text style={{ fontSize: 10, fontWeight: '700', color: '#A8A09A', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
          Capture Now
        </Text>
        <Text style={{ fontSize: 12, color: '#A8A09A', marginBottom: 8 }}>
          Saved as post-visit notes for this appointment.
        </Text>
        <TextInput
          value={captureNote}
          onChangeText={setCaptureNote}
          placeholder="Start typing your notes..."
          placeholderTextColor="#A8A09A"
          multiline
          numberOfLines={4}
          style={{
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: '#E3DDD5',
            borderRadius: 12,
            padding: 12,
            fontSize: 14,
            color: '#1C1917',
            minHeight: 80,
            textAlignVertical: 'top',
            marginBottom: 16,
          }}
        />

        {/* MEDICAL EVENT */}
        <Text style={{ fontSize: 10, fontWeight: '700', color: '#A8A09A', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
          Medical Event
        </Text>
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 12, padding: 12, marginBottom: 16 }}>
          {/* Type pills */}
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
            {MEDICAL_EVENT_TYPES.map((type) => (
              <PressableBase
                key={type}
                onPress={() => setEventType(type)}
                style={{
                  flex: 1,
                  paddingVertical: 6,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor: eventType === type ? '#B0C8E8' : '#E3DDD5',
                  backgroundColor: eventType === type ? '#EAF0F8' : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: eventType === type ? '#1A3254' : '#A8A09A' }}>
                  {MEDICAL_EVENT_CONFIG[type].label}
                </Text>
              </PressableBase>
            ))}
          </View>
          {/* Description input */}
          <TextInput
            value={eventDescription}
            onChangeText={setEventDescription}
            placeholder="e.g. Tonsillectomy, Ear infection..."
            placeholderTextColor="#A8A09A"
            style={{ backgroundColor: '#F7F5F0', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 8, padding: 10, fontSize: 13, color: '#1C1917', marginBottom: 8 }}
          />
          {/* Save to events checkbox */}
          <PressableBase
            onPress={() => setSaveToEvents(!saveToEvents)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
          >
            <View style={{ width: 16, height: 16, borderWidth: 1.5, borderColor: saveToEvents ? '#2A6049' : '#E3DDD5', borderRadius: 3, backgroundColor: saveToEvents ? '#2A6049' : 'white', alignItems: 'center', justifyContent: 'center' }}>
              {saveToEvents && <Text style={{ color: 'white', fontSize: 9 }}>✓</Text>}
            </View>
            <Text style={{ fontSize: 12, color: '#1C1917' }}>
              Save to Medical Events for {appointment.personName}
            </Text>
          </PressableBase>
        </View>

        {/* TO DO */}
        <Text style={{ fontSize: 10, fontWeight: '700', color: '#A8A09A', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
          To Do
        </Text>
        {appointment.todos.map((t) => (
          <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 10, padding: 10, marginBottom: 4 }}>
            <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: '#2A6049', flexShrink: 0 }} />
            <Text style={{ flex: 1, fontSize: 13, color: '#1C1917' }}>{t.title}</Text>
            <PressableBase onPress={() => removeTodo(t.id)} hitSlop={8}>
              <Text style={{ fontSize: 16, color: '#9B3A4A' }}>×</Text>
            </PressableBase>
          </View>
        ))}
        <View style={{ flexDirection: 'row', gap: 8, borderWidth: 1.5, borderColor: '#E3DDD5', borderStyle: 'dashed', borderRadius: 10, padding: 10, alignItems: 'center', marginBottom: 16 }}>
          <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: '#2A6049', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Text style={{ color: '#2A6049', fontSize: 10 }}>+</Text>
          </View>
          <TextInput
            value={todoText}
            onChangeText={setTodoText}
            onSubmitEditing={handleAddTodo}
            placeholder="Add To Do..."
            placeholderTextColor="#A8A09A"
            returnKeyType="done"
            style={{ flex: 1, fontSize: 13, color: '#1C1917' }}
          />
        </View>
      </ScrollView>

      {/* Finish & Save */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#F7F5F0', borderTopWidth: 1, borderTopColor: '#E3DDD5' }}>
        <PressableBase
          onPress={handleFinish}
          style={(pressed) => ({ backgroundColor: pressed ? '#1A4D35' : '#2A6049', borderRadius: 10, padding: 14, alignItems: 'center' })}
        >
          <Text style={{ color: 'white', fontSize: 15, fontWeight: '600' }}>
            {isSaving ? 'Saving...' : 'Finish & Save'}
          </Text>
        </PressableBase>
      </View>
    </View>
  );
};
