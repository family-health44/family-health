// src/features/snapshot/screens/SnapshotScreen.tsx
import { useMemo, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableBase } from '@/design-system/components/PressableBase';
import { LoadingState, ErrorState } from '@/design-system/components/EmptyState';
import { Type, TextColour, Shadow } from '@/design-system/tokens/typography';
import { usePersonDetail } from '@/features/family/hooks/usePersonDetail';
import { useTodos } from '@/features/todos/hooks/useTodos';
import { useVisits } from '@/features/visits/hooks/useVisits';
import { useFamilyHome } from '@/features/family/hooks/useFamilyHome';
import { useDoctorsQuery } from '@/features/doctors/queries/doctors.queries';
import { usePersonMedicationsQuery } from '@/features/medications/queries/medications.queries';
import { EditTodoModal } from '@/features/todos/components/EditTodoModal';
import type { Todo } from '@/features/todos/types/todos.types';
import { buildSnapshot, type SnapshotWindow } from '../domain/snapshot.domain';
import { Icon } from '@/design-system/components/Icon';

const RED = '#A63D2F';
const GREEN = '#1F5C41';
const PAGE = '#F4F2EC';
const DIVIDER = 'rgba(23,33,28,0.07)';

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
    <View style={{ flex: 1, backgroundColor: PAGE }}>
      {isFocused ? <StatusBar style="light" /> : null}
      <View style={{ backgroundColor: dot, paddingTop: insets.top + 4, paddingHorizontal: 16, paddingBottom: 18, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 }}>
        <PressableBase onPress={() => router.back()} accessibilityRole="button" style={(p) => ({ opacity: p ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 4 })}>
          <Icon name="chevron.left" size={16} color="#FFFFFF" weight="semibold" />
          <Text style={{ ...Type.caption, fontWeight: '500', color: '#FFFFFF' }}>Back</Text>
        </PressableBase>
        <Text style={{ ...Type.display, color: '#FFFFFF', marginTop: 6 }}>{person.name} — Snapshot</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', backgroundColor: '#EAE8E1', borderRadius: 10, padding: 3, marginBottom: 18 }}>
          {(['week', 'month'] as SnapshotWindow[]).map((w) => {
            const active = window === w;
            return (
              <PressableBase key={w} onPress={() => setWindow(w)} accessibilityRole="button" style={() => ({ flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: 8, backgroundColor: active ? '#FFFFFF' : 'transparent', ...(active ? Shadow.resting : null) })}>
                <Text style={{ ...Type.caption, fontWeight: '600', color: active ? TextColour.ink : TextColour.muted }}>{w === 'week' ? 'This week' : 'Next 30 days'}</Text>
              </PressableBase>
            );
          })}
        </View>

        {snapshot.totalCount === 0 && (
          <Text style={{ ...Type.body, color: TextColour.muted, textAlign: 'center', marginTop: 30 }}>Nothing coming up. All clear ✓</Text>
        )}

        {snapshot.needsAction.length > 0 && <SectionLabel text="To Do" />}
        {snapshot.needsAction.length > 0 && (
          <Card>
            {snapshot.needsAction.map((t, i) => (
              <TodoRow key={t.id} last={i === snapshot.needsAction.length - 1}
                title={t.title}
                sub={t.overdue ? `${t.daysLate} day${t.daysLate === 1 ? '' : 's'} overdue` : `Due ${fmtDate(t.dueDate!)}`}
                subColor={t.overdue ? RED : TextColour.muted}
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
                onPress={() => router.push(`/(app)/visits/${v.id}?from=snapshot&personId=${person.id}` as never)}
                title={`${v.title}${v.doctorName ? ' — ' + v.doctorName : ''}`}
                sub={`${fmtDate(v.visitDate)}${v.visitTime ? ' · ' + fmtTime(v.visitTime) : ''}`}
                subColor={TextColour.muted} />
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
                subColor={TextColour.muted} />
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
  <Text style={{ ...Type.micro, textTransform: 'uppercase', color: TextColour.faint, marginTop: 16, marginBottom: 10 }}>{text}</Text>
);
const Card = ({ children }: { children: React.ReactNode }) => (
  <View style={{ backgroundColor: 'white', borderRadius: 14, overflow: 'hidden', ...Shadow.resting }}>{children}</View>
);
const Divider = () => <View style={{ height: 1, backgroundColor: DIVIDER, marginHorizontal: 15 }} />;
const Row = ({ title, sub, subColor, last, onPress }: { title: string; sub: string; subColor: string; last: boolean; onPress: () => void }) => (
  <>
    <PressableBase onPress={onPress} accessibilityRole="button" style={(p) => ({ padding: 15, backgroundColor: p ? '#F7F7F4' : 'white' })}>
      <Text style={{ ...Type.body, fontWeight: '500', color: TextColour.ink }}>{title}</Text>
      <Text style={{ ...Type.caption, color: subColor, marginTop: 3 }}>{sub}</Text>
    </PressableBase>
    {!last && <Divider />}
  </>
);
const TodoRow = ({ title, sub, subColor, last, done, onToggle, onPress }: { title: string; sub: string; subColor: string; last: boolean; done: boolean; onToggle: () => void; onPress: () => void }) => (
  <>
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 15, gap: 11 }}>
      <PressableBase onPress={onToggle} accessibilityRole="checkbox" accessibilityState={{ checked: done }} hitSlop={8}
        style={() => ({ width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: done ? GREEN : '#C9C8C0', backgroundColor: done ? GREEN : 'transparent', alignItems: 'center', justifyContent: 'center' })}>
        {done ? <Icon name="checkmark" size={12} color="#FFFFFF" weight="bold" /> : null}
      </PressableBase>
      <PressableBase onPress={onPress} accessibilityRole="button" style={() => ({ flex: 1 })}>
        <Text style={{ ...Type.body, fontWeight: '500', color: TextColour.ink, textDecorationLine: done ? 'line-through' : 'none', opacity: done ? 0.55 : 1 }}>{title}</Text>
        <Text style={{ ...Type.caption, color: subColor, marginTop: 3 }}>{sub}</Text>
      </PressableBase>
    </View>
    {!last && <Divider />}
  </>
);
