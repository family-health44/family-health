// src/features/appointments/screens/StartAppointmentScreen.tsx
// Live appointment capture — single input, tag as Note / To do / Event.
// Entries form a time-ordered stream. Auto-linked to person + doctor + visit on save.
import { PressableBase } from '@/design-system/components/PressableBase';
import { SubScreenHeader } from '@/design-system/components/SubScreenHeader';
import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ErrorState } from '@/design-system/components/EmptyState';
import { formatTime, isoToDisplayDate, toISODateString } from '@/shared/utils/dates';
import { AiTeaser } from '@/design-system/components/AiTeaser';
import { MEDICAL_EVENT_CONFIG, MEDICAL_EVENT_TYPES } from '@/features/medical-events/types/medical-events.types';
import { useActiveAppointment } from '../hooks/useActiveAppointment';
import type { MedicalEventType } from '@/features/medical-events/types/medical-events.types';

type CaptureKind = 'note' | 'todo' | 'event';

// epoch ms -> "2:30 PM" via the safe time formatter
function msToClock(ms: number): string {
  const d = new Date(ms);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return formatTime(`${hh}:${mm}:00`);
}

interface StreamRow {
  id: string;
  kind: CaptureKind;
  primary: string;
  meta: string;
  capturedAt: number;
  onRemove: () => void;
}

export const StartAppointmentScreen = () => {
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
    saveAppointment, cancelAppointment, clearAppointment,
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

  const [draft, setDraft] = useState('');
  const [pendingKind, setPendingKind] = useState<CaptureKind | null>(null);
  const [eventType, setEventType] = useState<MedicalEventType>('illness');


  const commitNote = () => {
    const text = draft.trim();
    if (!text) return;
    addNote(text);
    setDraft('');
    setPendingKind(null);
  };

  const commitTodo = () => {
    const text = draft.trim();
    if (!text) return;
    addTodo(text);
    setDraft('');
    setPendingKind(null);
  };

  const commitEvent = () => {
    const text = draft.trim();
    if (!text) return;
    const today = toISODateString(new Date());
    addEvent(today, eventType, text);
    setDraft('');
    setPendingKind(null);
  };

  const handleTag = (kind: CaptureKind) => {
    if (!draft.trim()) return;
    if (kind === 'note') commitNote();
    else if (kind === 'todo') commitTodo();
    else setPendingKind('event'); // event needs a type choice first
  };

  const backToVisit = () => {
    const visitId = appointment?.visitId ?? params.visitId;
    clearAppointment();
    router.replace(`/(app)/visits/${visitId}` as never);
  };

  const handleCancel = () => {
    const captured =
      (appointment?.notes.length ?? 0) +
      (appointment?.todos.length ?? 0) +
      (appointment?.events.length ?? 0);
    if (captured === 0) { backToVisit(); return; }
    Alert.alert(
      'Cancel appointment',
      'Any captured notes, to dos, and events will be lost.',
      [
        { text: 'Keep going', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: backToVisit },
      ],
    );
  };

  if (!appointment) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}>
        <ErrorState message="Could not start appointment." onRetry={() => router.back()} />
      </View>
    );
  }

  // Build the unified, time-ordered stream (newest first)
  const stream: StreamRow[] = [
    ...appointment.notes.map((n): StreamRow => ({
      id: n.id, kind: 'note', primary: n.content,
      meta: `Note · ${msToClock(n.capturedAt)}`, capturedAt: n.capturedAt,
      onRemove: () => removeNote(n.id),
    })),
    ...appointment.todos.map((t): StreamRow => ({
      id: t.id, kind: 'todo', primary: t.title,
      meta: `Follow-up · ${msToClock(t.capturedAt)}`, capturedAt: t.capturedAt,
      onRemove: () => removeTodo(t.id),
    })),
    ...appointment.events.map((e): StreamRow => ({
      id: e.id, kind: 'event', primary: e.description,
      meta: `${MEDICAL_EVENT_CONFIG[e.eventType].label} · saved to ${appointment.personName} · ${msToClock(e.capturedAt)}`,
      capturedAt: e.capturedAt,
      onRemove: () => removeEvent(e.id),
    })),
  ].sort((a, b) => b.capturedAt - a.capturedAt);

  const total = stream.length;

  const ROW_STYLE: Record<CaptureKind, { border: string; icon: string; iconColour: string }> = {
    note: { border: '#E3E2DB', icon: '⊙', iconColour: '#888780' },
    todo: { border: '#1F5C41', icon: '☐', iconColour: '#1F5C41' },
    event: { border: '#185FA5', icon: '✚', iconColour: '#185FA5' },
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}>
      <SubScreenHeader
        title={appointment.doctorName ?? 'Appointment'}
        subtitle={`${appointment.personName} · ${isoToDisplayDate(appointment.visitDate)}`}
        onBack={handleCancel}
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#FFFFFF' }} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFFFFF' }}>Live</Text>
          </View>
        }
      />

      {/* Pre-notes & history bar */}
      <PressableBase
        onPress={() => router.push({
          pathname: '/appointment-history',
          params: {
            personId: appointment.personId,
            personName: appointment.personName,
            doctorId: appointment.doctorId ?? '',
            doctorName: appointment.doctorName ?? '',
            preNotes: appointment.preNotes ? encodeURIComponent(appointment.preNotes) : '',
          },
        })}
        style={(pressed) => ({ opacity: pressed ? 0.7 : 1, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#EAF3F7', borderBottomWidth: 1, borderBottomColor: '#DCE8EE', flexDirection: 'row', alignItems: 'center', gap: 8 })}
      >
        <Text style={{ fontSize: 14, color: '#185FA5' }}>ⓘ</Text>
        <Text style={{ fontSize: 12, color: '#0C447C', flex: 1 }}>Pre-notes & history</Text>
        <Text style={{ fontSize: 12, color: '#185FA5' }}>View ›</Text>
      </PressableBase>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {error ? (
          <View style={{ backgroundColor: '#F5E8EB', borderColor: '#E0BDC4', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 14 }}>
            <Text style={{ color: '#8F2E3B', fontSize: 14 }}>{error.message}</Text>
          </View>
        ) : null}

        <AiTeaser
          storageKey="ai_briefing_dismissed_at"
          title="AI briefing"
          body={`Get a summary of ${appointment.personName}'s history with ${appointment.doctorName ?? 'this doctor'} — past visits, notes, and current medications — before you walk in.`}
        />

        {/* Capture input */}
        <View style={{ backgroundColor: '#FFFFFF', borderWidth: pendingKind === 'event' ? 2 : 1, borderColor: pendingKind === 'event' ? '#B5D4F4' : '#E3E2DB', borderRadius: 12, padding: 10, marginBottom: 18 }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type what the doctor said..."
            placeholderTextColor="#8B928E"
            multiline
            style={{ fontSize: 14, color: '#17211C', paddingVertical: 6, paddingHorizontal: 4, minHeight: 24, textAlignVertical: 'top' }}
          />

          {pendingKind === 'event' ? (
            <View style={{ marginTop: 6 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: 'rgba(23,33,28,0.65)', letterSpacing: 0.8, marginBottom: 6 }}>EVENT TYPE</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
                {MEDICAL_EVENT_TYPES.map((type) => {
                  const selected = eventType === type;
                  return (
                    <PressableBase key={type} onPress={() => setEventType(type)} style={{ flex: 1, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: selected ? '#185FA5' : '#E3E2DB', backgroundColor: selected ? '#E6F1FB' : 'transparent', alignItems: 'center' }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: selected ? '#0C447C' : 'rgba(23,33,28,0.55)' }}>
                        {MEDICAL_EVENT_CONFIG[type].label}
                      </Text>
                    </PressableBase>
                  );
                })}
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <PressableBase onPress={commitEvent} style={(pressed) => ({ flex: 1, paddingVertical: 9, borderRadius: 8, backgroundColor: pressed ? '#0C447C' : '#185FA5', alignItems: 'center' })}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF' }}>Add event</Text>
                </PressableBase>
                <PressableBase onPress={() => setPendingKind(null)} style={(pressed) => ({ paddingVertical: 9, paddingHorizontal: 14, borderRadius: 8, borderWidth: 0.5, borderColor: '#E3E2DB', alignItems: 'center', opacity: pressed ? 0.6 : 1 })}>
                  <Text style={{ fontSize: 12, color: 'rgba(23,33,28,0.65)' }}>Cancel</Text>
                </PressableBase>
              </View>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
              <PressableBase onPress={() => handleTag('note')} style={{ flex: 1, paddingVertical: 7, borderRadius: 8, backgroundColor: '#F1EFE8', alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#5F5E5A' }}>⊙ Note</Text>
              </PressableBase>
              <PressableBase onPress={() => handleTag('todo')} style={{ flex: 1, paddingVertical: 7, borderRadius: 8, backgroundColor: '#EAF3DE', alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#3B6D11' }}>☐ To do</Text>
              </PressableBase>
              <PressableBase onPress={() => handleTag('event')} style={{ flex: 1, paddingVertical: 7, borderRadius: 8, backgroundColor: '#E6F1FB', alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#185FA5' }}>✚ Event</Text>
              </PressableBase>
            </View>
          )}
        </View>

        {/* Captured stream */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: 'rgba(23,33,28,0.65)', marginBottom: 8 }}>
          Captured this visit{total > 0 ? ` · ${total}` : ''}
        </Text>

        {total === 0 ? (
          <Text style={{ fontSize: 13, color: 'rgba(23,33,28,0.55)', paddingVertical: 12, textAlign: 'center' }}>
            Nothing captured yet. Type above and tag it.
          </Text>
        ) : (
          stream.map((row) => {
            const s = ROW_STYLE[row.kind];
            const accent = row.kind !== 'note';
            return (
              <View key={row.id} style={{ backgroundColor: '#FFFFFF', borderWidth: 0.5, borderColor: s.border, borderLeftWidth: accent ? 3 : 0.5, borderLeftColor: s.border, borderRadius: accent ? 0 : 10, borderTopRightRadius: 10, borderBottomRightRadius: 10, padding: 10, paddingHorizontal: 12, marginBottom: 6, flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 14, color: s.iconColour, marginTop: 1 }}>{s.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, color: '#17211C', lineHeight: 18 }}>{row.primary}</Text>
                  <Text style={{ fontSize: 10, color: row.kind === 'note' ? 'rgba(23,33,28,0.55)' : s.iconColour, marginTop: 3 }}>{row.meta}</Text>
                </View>
                <PressableBase onPress={row.onRemove} hitSlop={8} style={(pressed) => ({ opacity: pressed ? 0.5 : 1 })}>
                  <Text style={{ fontSize: 15, color: 'rgba(23,33,28,0.55)' }}>×</Text>
                </PressableBase>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Finish */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E3E2DB' }}>
        <PressableBase
          onPress={saveAppointment}
          disabled={isSaving}
          style={(pressed) => ({ backgroundColor: total === 0 ? '#C8C4BC' : pressed ? '#17452F' : '#1F5C41', borderRadius: 10, padding: 14, alignItems: 'center' })}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
            {isSaving ? 'Saving...' : total > 0 ? `Finish & save · ${total} item${total === 1 ? '' : 's'}` : 'Finish & save'}
          </Text>
        </PressableBase>
      </View>
    </View>
  );
};
