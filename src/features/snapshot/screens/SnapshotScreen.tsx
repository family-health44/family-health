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
import { useFamilyHome } from '@/features/family/hooks/useFamilyHome';
import { useDoctorsQuery } from '@/features/doctors/queries/doctors.queries';
import { usePersonMedicationsQuery } from '@/features/medications/queries/medications.queries';
import { EditTodoModal } from '@/features/todos/components/EditTodoModal';
import type { Todo } from '@/features/todos/types/todos.types';
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
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const { person, isLoading, error } = usePersonDetail(personId ?? '');
  const { listGroups } = useVisits();
  const { groups: todoGroups = [], updateTodo, toggleTodo, isUpdating } = useTodos();
  const { data: medicationGroups = [] } = usePersonMedicationsQuery(personId ?? '');
  const { data: familyData } = useFamilyHome();
  const { data: doctorGroups } = useDoctorsQuery();
  const allPeople = familyData?.people ?? [];
  const allVisits = (listGroups ?? []).flatMap((g) => g.visits);
  const allDoctors = (doctorGroups ?? []).flatMap((g) => g.doctors);

  const personTodos = useMemo(
    () => todoGroups.flatMap((g) => g.todos).filter((t) => t.personId === personId),
    [todoGroups, personId],
  );

  const snapshot = useMemo(() => {
    const visits = allVisits.filter((v) => v.personId === personId);
    const meds = medicationGroups.flatMap((g) => g.medications);
    return buildSnapshot(personTodos, visits, meds, window);
  }, [allVisits, personTodos, medicationGroups, personId, window]);

  if (isLoading) return <LoadingState />;
  if (error || !person) return <ErrorState />;

  const dot = person.colourSet.dot;
  const todoById = (id: string) => personTodos.find((t) => t.id === id) ?? null;

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

        {snapshot.totalCount === 0 && (
          <Text style={{ fontSize: 14, color: MUTED, textAlign: 'center', marginTop: 30 }}>Nothing coming up. All clear ✓</Text>
        )}

        {snapshot.needsAction.length > 0 && <SectionLabel text="To Do" />}
        {snapshot.needsAction.length > 0 && (
          <Card>
            {snapshot.needsAction.map((t, i) => (
              <TodoRow key={t.id} last={i === snapshot.needsAction.length - 1}
                title={t.title}
                sub={t.overdue ? `${t.daysLate} day${t.daysLate === 1 ? '' : 's'} overdue` : `Due ${fmtDate(t.dueDate!)}`}
                subColor={t.overdue ? RED : MUTED}
                done={personTodos.find((p) => p.id === t.id)?.completed ?? false}
                onToggle={() => { const cur = todoById(t.id); if (cur) toggleTodo(cur.id, !cur.completed); }}
                onPress={() => setEditingTodo(todoById(t.id))} />
            ))}
          </Card>
        )}

        {snapshot.appointments.length > 0 && <SectionLabel text="Visit" />}
        {snapshot.appointments.length > 0 && (
          <Card>
            {snapshot.appointments.map((v, i) => (
              <Row key={v.id} last={i === snapshot.appointments.length - 1}
                onPress={() => router.push(`/(app)/visits/${v.id}` as never)}
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
                onPress={() => router.push(`/(app)/family/${person.id}/medication/${m.id}` as never)}
                title={`${m.name} — refill ${fmtDate(m.nextRefill)}`}
                sub={`${m.repeatsLeft ?? 0} repeat${m.repeatsLeft === 1 ? '' : 's'} left${m.pharmacy ? ' · ' + m.pharmacy : ''}`}
                subColor={MUTED} />
            ))}
          </Card>
        )}
      </ScrollView>

      <EditTodoModal
        visible={editingTodo !== null}
        isLoading={isUpdating}
        todo={editingTodo}
        people={allPeople}
        doctors={allDoctors}
        visits={allVisits}
        onSave={updateTodo}
        onDismiss={() => setEditingTodo(null)}
      />
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
const TodoRow = ({ title, sub, subColor, last, done, onToggle, onPress }: { title: string; sub: string; subColor: string; last: boolean; done: boolean; onToggle: () => void; onPress: () => void }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', padding: 13, borderBottomWidth: last ? 0 : 1, borderBottomColor: BORDER, gap: 11 }}>
    <PressableBase onPress={onToggle} accessibilityRole="checkbox" accessibilityState={{ checked: done }} hitSlop={8}
      style={() => ({ width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: done ? GREEN : '#C9C8C0', backgroundColor: done ? GREEN : 'transparent', alignItems: 'center', justifyContent: 'center' })}>
      {done ? <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>✓</Text> : null}
    </PressableBase>
    <PressableBase onPress={onPress} accessibilityRole="button" style={() => ({ flex: 1 })}>
      <Text style={{ fontSize: 14, fontWeight: '500', color: '#17211C', textDecorationLine: done ? 'line-through' : 'none', opacity: done ? 0.55 : 1 }}>{title}</Text>
      <Text style={{ fontSize: 12, color: subColor, marginTop: 2 }}>{sub}</Text>
    </PressableBase>
  </View>
);
