// src/features/appointments/screens/AppointmentHistoryScreen.tsx
// Read-only summary for the Start Appointment flow.
// Concise dot-point overview for THIS person, doctor-scoped where it helps.
// Pure composition of existing queries. No new repo calls, no AI.
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SubScreenHeader } from '@/design-system/components/SubScreenHeader';
import { useLocalSearchParams } from 'expo-router';
import { isoToDisplayDate } from '@/shared/utils/dates';
import { useVisitsForCalendarQuery } from '@/features/visits/queries/visits.queries';
import { usePersonNotes } from '@/features/notes/hooks/usePersonNotes';
import { parseNoteContent } from '@/features/notes/domain/notes.domain';
import { usePersonMedicalEvents } from '@/features/medical-events/hooks/usePersonMedicalEvents';
import { MEDICAL_EVENT_CONFIG } from '@/features/medical-events/types/medical-events.types';
import { usePersonMedications } from '@/features/medications/hooks/usePersonMedications';
import { useTodos } from '@/features/todos/hooks/useTodos';

const Section = ({ label, count, children }: { label: string; count?: number; children: React.ReactNode }) => (
  <View style={{ marginBottom: 18 }}>
    <Text style={{ fontSize: 10, fontWeight: '700', color: 'rgba(23,33,28,0.55)', letterSpacing: 0.8, marginBottom: 8 }}>
      {label}{count ? ` · ${count}` : ''}
    </Text>
    {children}
  </View>
);

// One compact dot-point row: bullet + primary text + optional right-aligned meta.
const Bullet = ({ text, meta, tone = 'default' }: { text: string; meta?: string; tone?: 'default' | 'blue' | 'amber' }) => {
  const dot = tone === 'blue' ? '#185FA5' : tone === 'amber' ? '#B4690E' : '#8B928E';
  const metaColour = tone === 'blue' ? '#185FA5' : tone === 'amber' ? '#B4690E' : 'rgba(23,33,28,0.55)';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
      <Text style={{ fontSize: 13, color: dot, lineHeight: 19, marginTop: 0.5 }}>•</Text>
      <Text style={{ fontSize: 13, color: '#17211C', lineHeight: 19, flex: 1 }}>{text}</Text>
      {meta ? <Text style={{ fontSize: 11, color: metaColour, marginLeft: 8, marginTop: 1 }}>{meta}</Text> : null}
    </View>
  );
};

const Empty = ({ text }: { text: string }) => (
  <Text style={{ fontSize: 13, color: 'rgba(23,33,28,0.45)' }}>{text}</Text>
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
  const { groups: eventGroups, isLoading: eventsLoading } = usePersonMedicalEvents(personId);
  const { groups: medGroups, isLoading: medsLoading } = usePersonMedications(personId);
  const { groups: todoGroups, isLoading: todosLoading } = useTodos();

  const isLoading = visitsQuery.isLoading || notesLoading || eventsLoading || medsLoading || todosLoading;

  const today = new Date().toISOString().slice(0, 10);

  // Active meds for this person (active + as_needed). All doctors — a full current med list matters at any visit.
  const activeMeds = medGroups
    .filter((g) => g.status === 'active' || g.status === 'as_needed')
    .flatMap((g) => g.medications);

  // Open to-dos for this person, overdue first.
  const openTodos = todoGroups
    .filter((g) => g.personId === personId)
    .flatMap((g) => g.todos)
    .filter((t) => !t.completed)
    .sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'));

  // Past visits: this person + (if set) this doctor, newest first, cap 5.
  const pastVisits = (visitsQuery.data ?? [])
    .filter((v) => v.personId === personId && (!doctorId || v.doctorId === doctorId))
    .sort((a, b) => b.visitDate.localeCompare(a.visitDate))
    .slice(0, 5);

  // Medical events: flatten, doctor-scoped if set, newest first, cap 5.
  const events = eventGroups
    .flatMap((g) => g.events)
    .filter((e) => !doctorId || e.doctorId === doctorId)
    .sort((a, b) => b.eventDate.localeCompare(a.eventDate))
    .slice(0, 5);

  // Plain notes: exclude hidden + event-marker segments, doctor-scoped if set, newest first, cap 5.
  const noteText = (content: string) =>
    parseNoteContent(content)
      .filter((seg) => seg.type === 'text')
      .map((seg) => seg.content)
      .join(' ')
      .trim();
  const plainNotes = notes
    .filter((n) => !n.hidden && (!doctorId || n.doctorId === doctorId) && noteText(n.content).length > 0)
    .sort((a, b) => (b.noteDate ?? '').localeCompare(a.noteDate ?? ''))
    .slice(0, 5);

  const medMeta = (m: typeof activeMeds[number]) =>
    [m.dosage, m.frequency].filter(Boolean).join(' · ') || undefined;

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
            <View style={{ backgroundColor: '#EAF3F7', borderWidth: 1, borderColor: '#DCE8EE', borderRadius: 12, padding: 12, marginBottom: 18 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#185FA5', letterSpacing: 0.8, marginBottom: 4 }}>PRE-NOTES FOR THIS VISIT</Text>
              <Text style={{ fontSize: 13, color: '#0C447C', lineHeight: 19 }}>{preNotes}</Text>
            </View>
          ) : null}

          <Section label="ACTIVE MEDICATIONS" count={activeMeds.length}>
            {activeMeds.length === 0
              ? <Empty text="No active medications." />
              : activeMeds.map((m) => (
                  <Bullet
                    key={m.id}
                    text={m.name + (m.status === 'as_needed' ? ' (as needed)' : '')}
                    meta={medMeta(m)}
                  />
                ))}
          </Section>

          <Section label="OPEN TO-DOS" count={openTodos.length}>
            {openTodos.length === 0
              ? <Empty text="Nothing outstanding." />
              : openTodos.map((t) => {
                  const overdue = !!t.dueDate && t.dueDate < today;
                  return (
                    <Bullet
                      key={t.id}
                      text={t.title}
                      tone={overdue ? 'amber' : 'default'}
                      meta={t.dueDate ? (overdue ? `overdue · ${isoToDisplayDate(t.dueDate)}` : isoToDisplayDate(t.dueDate)) : undefined}
                    />
                  );
                })}
          </Section>

          <Section label={doctorId ? 'PAST VISITS (THIS DOCTOR)' : 'PAST VISITS'} count={pastVisits.length}>
            {pastVisits.length === 0
              ? <Empty text={`No past visits${doctorId ? ' with this doctor' : ''}.`} />
              : pastVisits.map((v) => (
                  <Bullet key={v.id} text={v.title || 'Visit'} meta={isoToDisplayDate(v.visitDate)} />
                ))}
          </Section>

          <Section label="MEDICAL EVENTS" count={events.length}>
            {events.length === 0
              ? <Empty text={`No medical events${doctorId ? ' with this doctor' : ''}.`} />
              : events.map((e) => (
                  <Bullet
                    key={e.id}
                    text={e.description}
                    tone="blue"
                    meta={`${MEDICAL_EVENT_CONFIG[e.eventType].label} · ${isoToDisplayDate(e.eventDate)}`}
                  />
                ))}
          </Section>

          <Section label="NOTES" count={plainNotes.length}>
            {plainNotes.length === 0
              ? <Empty text={`No notes${doctorId ? ' for this doctor' : ''}.`} />
              : plainNotes.map((n) => (
                  <Bullet key={n.id} text={noteText(n.content)} meta={n.noteDate ? isoToDisplayDate(n.noteDate) : undefined} />
                ))}
          </Section>

        </ScrollView>
      )}
    </View>
  );
};
