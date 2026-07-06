// src/features/snapshot/screens/SnapshotScreen.tsx
import { useMemo, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableBase } from '@/design-system/components/PressableBase';
import { LoadingState, ErrorState } from '@/design-system/components/EmptyState';
import { usePersonDetail } from '@/features/family/hooks/usePersonDetail';
import { useTodos } from '@/features/todos/hooks/useTodos';
import { useVisits } from '@/features/visits/hooks/useVisits';
import { usePersonMedicationsQuery } from '@/features/medications/queries/medications.queries';
import { buildSnapshot, type SnapshotWindow } from '../domain/snapshot.domain';

const RED = '#A63D2F';
const GREEN = '#1F5C41';
const MUTED = 'rgba(23,33,28,0.55)';
const BORDER = '#E3E2DB';

function fmtDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}
function fmtTime(t: string | null): string {
  if (!t) return '';
  const [h = '0', m = '00'] = t.split(':');
  const hr = parseInt(h, 10);
  const ampm = hr >= 12 ? 'pm' : 'am';
  const h12 = hr % 12 === 0 ? 12 : hr % 12;
  return `${h12}:${m} ${ampm}`;
}

export const SnapshotScreen = () => {
  const { personId } = useLocalSearchParams<{ personId: string }>();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [window, setWindow] = useState<SnapshotWindow>('week');

  const { person, isLoading, error } = usePersonDetail(personId ?? '');
  const { listGroups } = useVisits();
  const { groups: todoGroups = [] } = useTodos();
  const { data: medicationGroups = [] } = usePersonMedicationsQuery(personId ?? '');

  const snapshot = useMemo(() => {
    const visits = (listGroups ?? []).flatMap((g) => g.visits).filter((v) => v.personId === personId);
    const todos = todoGroups.flatMap((g) => g.todos).filter((t) => t.personId === personId);
    const meds = medicationGroups.flatMap((g) => g.medications);
    return buildSnapshot(todos, visits, meds, window);
  }, [listGroups, todoGroups, medicationGroups, personId, window]);

  if (isLoading) return <LoadingState />;
  if (error || !person) return <ErrorState />;

  const dot = person.colourSet.dot;
  const summary = snapshot.overdueCount > 0
    ? `${snapshot.overdueCount} overdue · ${snapshot.totalCount} ${window === 'week' ? 'this week' : 'this month'}`
    : `${snapshot.totalCount} ${window === 'week' ? 'this week' : 'this month'}`;

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}>
      {isFocused ? <StatusBar style="light" /> : null}
      <View style={{ backgroundColor: dot, paddingTop: insets.top + 4, paddingHorizontal: 16, paddingBottom: 18, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 }}>
        <PressableBase onPress={() => router.back()} accessibilityRole="button" style={(p) => ({ opacity: p ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 4 })}>
          <Text style={{ fontSize: 15, color: '#FFFFFF' }}>‹</Text>
          <Text style={{ fontSize: 14, color: '#FFFFFF', fontWeight: '500' }}>Back</Text>
        </PressableBase>
        <Text style={{ fontSize: 28, fontWeight: '300', color: '#FFFFFF', marginTop: 6 }}>{person.name} — Snapshot</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', backgroundColor: 'white', borderWidth: 1, borderColor: BORDER, borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
          {(['week', 'month'] as SnapshotWindow[]).map((w) => (
            <PressableBase key={w} onPress={() => setWindow(w)} accessibilityRole="button" style={() => ({ flex: 1, paddingVertical: 9, alignItems: 'center', backgroundColor: window === w ? GREEN : 'transparent' })}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: window === w ? '#fff' : MUTED }}>{w === 'week' ? 'This week' : 'Next 30 days'}</Text>
            </PressableBase>
          ))}
        </View>

        <View style={{ backgroundColor: '#FBF3EC', borderWidth: 1, borderColor: '#EAD9C6', borderRadius: 12, padding: 12, marginBottom: 4 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: snapshot.overdueCount > 0 ? '#B4690E' : '#17211C' }}>{summary}</Text>
          <Text style={{ fontSize: 12, color: MUTED, marginTop: 1 }}>Tap anything to open it</Text>
        </View>

        {snapshot.totalCount === 0 && (
          <Text style={{ fontSize: 14, color: MUTED, textAlign: 'center', marginTop: 30 }}>Nothing coming up. All clear ✓</Text>
        )}

        {snapshot.needsAction.length > 0 && <SectionLabel text="Needs action" />}
        {snapshot.needsAction.length > 0 && (
          <Card>
            {snapshot.needsAction.map((t, i) => (
              <Row key={t.id} last={i === snapshot.needsAction.length - 1}
                onPress={() => router.push(`/(app)/family/${person.id}/notes` as never)}
                title={t.title}
                sub={t.overdue ? `${t.daysLate} day${t.daysLate === 1 ? '' : 's'} overdue` : `Due ${fmtDate(t.dueDate!)}`}
                subColor={t.overdue ? RED : MUTED} />
            ))}
          </Card>
        )}

        {snapshot.appointments.length > 0 && <SectionLabel text="Appointments" />}
        {snapshot.appointments.length > 0 && (
          <Card>
            {snapshot.appointments.map((v, i) => (
              <Row key={v.id} last={i === snapshot.appointments.length - 1}
                onPress={() => router.push(`/(app)/family/${person.id}/index` as never)}
                title={`${v.title}${v.doctorName ? ' — ' + v.doctorName : ''}`}
                sub={`${fmtDate(v.visitDate)}${v.visitTime ? ' · ' + fmtTime(v.visitTime) : ''}`}
                subColor={MUTED} />
            ))}
          </Card>
        )}

        {snapshot.refills.length > 0 && <SectionLabel text="Medications" />}
        {snapshot.refills.length > 0 && (
          <Card>
            {snapshot.refills.map((m, i) => (
              <Row key={m.id} last={i === snapshot.refills.length - 1}
                onPress={() => router.push(`/(app)/family/${person.id}/medications` as never)}
                title={`${m.name} — refill ${fmtDate(m.nextRefill)}`}
                sub={`${m.repeatsLeft ?? 0} repeat${m.repeatsLeft === 1 ? '' : 's'} left${m.pharmacy ? ' · ' + m.pharmacy : ''}`}
                subColor={MUTED} />
            ))}
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const SectionLabel = ({ text }: { text: string }) => (
  <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: MUTED, marginTop: 16, marginBottom: 8 }}>{text}</Text>
);
const Card = ({ children }: { children: React.ReactNode }) => (
  <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: BORDER, borderRadius: 12, overflow: 'hidden' }}>{children}</View>
);
const Row = ({ title, sub, subColor, last, onPress }: { title: string; sub: string; subColor: string; last: boolean; onPress: () => void }) => (
  <PressableBase onPress={onPress} accessibilityRole="button" style={(p) => ({ padding: 13, borderBottomWidth: last ? 0 : 1, borderBottomColor: BORDER, backgroundColor: p ? '#F7F7F4' : 'white' })}>
    <Text style={{ fontSize: 14, fontWeight: '500', color: '#17211C' }}>{title}</Text>
    <Text style={{ fontSize: 12, color: subColor, marginTop: 2 }}>{sub}</Text>
  </PressableBase>
);
