// src/features/appointments/screens/AppointmentHistoryScreen.tsx
// Read-only history for the Start Appointment flow.
// Shows past visits, medical events, and plain notes — filtered to this person + doctor.
// Pure composition of existing queries. No new repo calls, no AI.
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SubScreenHeader } from '@/design-system/components/SubScreenHeader';
import { useLocalSearchParams, router } from 'expo-router';
import { PressableBase } from '@/design-system/components/PressableBase';
import { isoToDisplayDate } from '@/shared/utils/dates';
import { useVisitsForCalendarQuery } from '@/features/visits/queries/visits.queries';
import { usePersonNotes } from '@/features/notes/hooks/usePersonNotes';
import { parseNoteContent } from '@/features/notes/domain/notes.domain';
import { usePersonMedicalEvents } from '@/features/medical-events/hooks/usePersonMedicalEvents';
import { MEDICAL_EVENT_CONFIG } from '@/features/medical-events/types/medical-events.types';

const SectionLabel = ({ text }: { text: string }) => (
  <Text style={{ fontSize: 10, fontWeight: '700', color: 'rgba(23,33,28,0.55)', letterSpacing: 0.8, marginBottom: 8 }}>
    {text}
  </Text>
);

export const AppointmentHistoryScreen = () => {
  const params = useLocalSearchParams<{
    personId: string;
    personName: string;
    doctorId?: string;
    doctorName?: string;
    preNotes?: string;
  }>();

  const personId = params.personId ?? '';
  const doctorId = params.doctorId && params.doctorId.length > 0 ? params.doctorId : null;
  const preNotes = params.preNotes ? decodeURIComponent(params.preNotes) : '';

  const visitsQuery = useVisitsForCalendarQuery();
  const { notes, isLoading: notesLoading } = usePersonNotes(personId);
  const { groups, isLoading: eventsLoading } = usePersonMedicalEvents(personId);

  const isLoading = visitsQuery.isLoading || notesLoading || eventsLoading;

  // Past visits: this person + (if a doctor is set) this doctor, newest first
  const pastVisits = (visitsQuery.data ?? [])
    .filter((v) => v.personId === personId && (!doctorId || v.doctorId === doctorId))
    .sort((a, b) => b.visitDate.localeCompare(a.visitDate));

  // Medical events: flatten groups, filter to doctor if set, newest first
  const events = groups
    .flatMap((g) => g.events)
    .filter((e) => !doctorId || e.doctorId === doctorId)
    .sort((a, b) => b.eventDate.localeCompare(a.eventDate));

  // Plain notes: exclude hidden + event-marker notes; filter to doctor if set
  const noteText = (content: string) =>
    parseNoteContent(content)
      .filter((seg) => seg.type === 'text')
      .map((seg) => seg.content)
      .join(' ')
      .trim();
  const plainNotes = notes
    .filter((n) => !n.hidden && (!doctorId || n.doctorId === doctorId) && noteText(n.content).length > 0)
    .sort((a, b) => (b.noteDate ?? '').localeCompare(a.noteDate ?? ''));

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}>
      <SubScreenHeader
        title="History"
        subtitle={`${params.personName ?? ''}${params.doctorName ? ` · ${params.doctorName}` : ''}` || undefined}
      />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#1F5C41" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          {preNotes.trim() ? (
            <View style={{ backgroundColor: '#EAF3F7', borderWidth: 1, borderColor: '#DCE8EE', borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#185FA5', letterSpacing: 0.6, marginBottom: 4 }}>PRE-NOTES FOR THIS VISIT</Text>
              <Text style={{ fontSize: 13, color: '#0C447C', lineHeight: 19 }}>{preNotes}</Text>
            </View>
          ) : null}

          {/* Past visits */}
          <SectionLabel text={`PAST VISITS${pastVisits.length ? ` · ${pastVisits.length}` : ''}`} />
          {pastVisits.length === 0 ? (
            <Text style={{ fontSize: 13, color: 'rgba(23,33,28,0.55)', marginBottom: 16 }}>No past visits{doctorId ? ' with this doctor' : ''}.</Text>
          ) : (
            pastVisits.map((v) => (
              <View key={v.id} style={{ backgroundColor: '#FFFFFF', borderWidth: 0.5, borderColor: '#E3E2DB', borderRadius: 10, padding: 10, paddingHorizontal: 12, marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Text style={{ fontSize: 13, fontWeight: '500', color: '#17211C', flex: 1 }}>{v.title || 'Visit'}</Text>
                  <Text style={{ fontSize: 11, color: 'rgba(23,33,28,0.55)', marginLeft: 8 }}>{isoToDisplayDate(v.visitDate)}</Text>
                </View>
                {v.postNotes?.trim() ? (
                  <Text style={{ fontSize: 12, color: 'rgba(23,33,28,0.65)', marginTop: 3, lineHeight: 17 }}>{v.postNotes}</Text>
                ) : null}
              </View>
            ))
          )}

          {/* Medical events */}
          <View style={{ marginTop: 10 }}>
            <SectionLabel text={`MEDICAL EVENTS${events.length ? ` · ${events.length}` : ''}`} />
          </View>
          {events.length === 0 ? (
            <Text style={{ fontSize: 13, color: 'rgba(23,33,28,0.55)', marginBottom: 16 }}>No medical events{doctorId ? ' with this doctor' : ''}.</Text>
          ) : (
            events.map((e) => (
              <View key={e.id} style={{ backgroundColor: '#FFFFFF', borderWidth: 0.5, borderColor: '#C7DAF0', borderLeftWidth: 3, borderLeftColor: '#185FA5', borderTopRightRadius: 10, borderBottomRightRadius: 10, padding: 10, paddingHorizontal: 12, marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Text style={{ fontSize: 13, color: '#17211C', flex: 1 }}>{e.description}</Text>
                  <Text style={{ fontSize: 11, color: '#185FA5', marginLeft: 8 }}>{isoToDisplayDate(e.eventDate)}</Text>
                </View>
                <Text style={{ fontSize: 10, color: '#185FA5', marginTop: 3 }}>{MEDICAL_EVENT_CONFIG[e.eventType].label}</Text>
              </View>
            ))
          )}

          {/* Notes */}
          <View style={{ marginTop: 10 }}>
            <SectionLabel text={`NOTES${plainNotes.length ? ` · ${plainNotes.length}` : ''}`} />
          </View>
          {plainNotes.length === 0 ? (
            <Text style={{ fontSize: 13, color: 'rgba(23,33,28,0.55)' }}>No notes{doctorId ? ' for this doctor' : ''}.</Text>
          ) : (
            plainNotes.map((n) => (
              <View key={n.id} style={{ backgroundColor: '#FFFFFF', borderWidth: 0.5, borderColor: '#E3E2DB', borderRadius: 10, padding: 10, paddingHorizontal: 12, marginBottom: 6 }}>
                <Text style={{ fontSize: 13, color: '#17211C', lineHeight: 18 }}>{noteText(n.content)}</Text>
                {n.noteDate ? (
                  <Text style={{ fontSize: 11, color: 'rgba(23,33,28,0.55)', marginTop: 3 }}>{isoToDisplayDate(n.noteDate)}</Text>
                ) : null}
              </View>
            ))
          )}

        </ScrollView>
      )}
    </View>
  );
};
