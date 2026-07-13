// src/features/family/screens/PersonDetailScreen.tsx
import { PressableBase } from '@/design-system/components/PressableBase';
import { useState } from 'react';
import { ScrollView, View, Text, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoadingState, ErrorState } from '@/design-system/components/EmptyState';
import { Icon } from '@/design-system/components/Icon';
import { Type, TextColour, Shadow } from '@/design-system/tokens/typography';
import { usePersonDetail } from '../hooks/usePersonDetail';
import { usePersonMutations } from '../hooks/usePersonMutations';
import { NoteModal } from '@/features/notes/components/NoteModal';
import { AddTodoModal } from '@/features/todos/components/AddTodoModal';
import { AddVisitModal } from '@/features/visits/components/AddVisitModal';
import { usePersonNotes } from '@/features/notes/hooks/usePersonNotes';
import { useTodos } from '@/features/todos/hooks/useTodos';
import { useVisits } from '@/features/visits/hooks/useVisits';
import { usePersonDoctorsQuery } from '@/features/doctors/queries/doctors.queries';
import { useDoctorsQuery } from '@/features/doctors/queries/doctors.queries';
import { useFamilyHome } from '@/features/family/hooks/useFamilyHome';
import { usePersonMedicationsQuery } from '@/features/medications/queries/medications.queries';

const PAGE = '#F4F2EC';
const DIVIDER = 'rgba(23,33,28,0.07)';
const RED = '#A63D2F';
const GREEN = '#1F5C41';

// Per-icon accent colours (SF Symbols have no multicolour variant for these)
const C_DOCTORS = '#2A9D8F';
const C_MEDS = '#4A72C4';
const C_EVENTS = '#C9862E';
const C_NOTES = '#D4A72C';
const C_INFO = '#7A5FC0';
const C_DOCS = '#5C8FD6';
const C_NOTE_ADD = '#7A5FC0';
const C_TODO_ADD = '#C9862E';
const C_VISIT_ADD = '#2A9D8F';

function fmtPreviewDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
function fmtPreviewTime(t: string): string {
  const [h = '0', m = '00'] = t.split(':');
  const hr = parseInt(h, 10);
  const ampm = hr >= 12 ? 'pm' : 'am';
  const h12 = hr % 12 === 0 ? 12 : hr % 12;
  return `${h12}:${m} ${ampm}`;
}

export const PersonDetailScreen = () => {
  const { personId } = useLocalSearchParams<{ personId: string }>();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { person, isLoading, error } = usePersonDetail(personId ?? '');
  const { updateName, deletePerson } = usePersonMutations();
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);

  const { addNote, isSubmitting: isAddingNote } = usePersonNotes(personId ?? '');
  const { addTodo, isAdding: isAddingTodo, groups: todoGroups = [] } = useTodos();
  const { addVisit, isAdding: isAddingVisit, listGroups } = useVisits();
  const { data: doctors = [] } = usePersonDoctorsQuery(personId ?? '');
  const { data: familyData } = useFamilyHome();
  const { data: doctorGroups } = useDoctorsQuery();
  const allPeople = familyData?.people ?? [];
  const allDoctors = (doctorGroups ?? []).flatMap((g) => g.doctors);
  const { data: medicationGroups = [] } = usePersonMedicationsQuery(personId ?? '');
  const medications = medicationGroups.flatMap((g) => g.medications);
  const allVisits = (listGroups ?? []).flatMap((g) => g.visits);
  const personVisits = allVisits.filter((v) => v.personId === personId);
  const todayISO = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
  const personTodos = todoGroups.flatMap((g) => g.todos).filter((t) => t.personId === personId && !t.completed);
  const previewTodos = [...personTodos].sort((a, b) => {
    if (a.dueDate == null && b.dueDate == null) return 0;
    if (a.dueDate == null) return 1;
    if (b.dueDate == null) return -1;
    return a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0;
  }).slice(0, 3);
  const previewVisits = personVisits
    .filter((v) => v.visitDate >= todayISO)
    .sort((a, b) => (a.visitDate < b.visitDate ? -1 : a.visitDate > b.visitDate ? 1 : (a.visitTime ?? '').localeCompare(b.visitTime ?? '')))
    .slice(0, 2);

  const promptEditName = () => {
    if (!person) return;
    Alert.prompt('Edit name', 'Enter a new name for this person',
      async (newName) => { if (newName?.trim() && newName.trim() !== person.name) await updateName(person.id, newName.trim()); },
      'plain-text', person.name,
    );
  };

  const confirmDelete = () => {
    if (!person) return;
    Alert.alert(
      `Delete ${person.name}?`,
      'This permanently deletes this person and all their doctors, medications, visits, notes, and documents. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
            await deletePerson(person.id);
            router.replace('/(app)/family');
          } },
      ],
    );
  };

  const handleManagePerson = () => {
    if (!person) return;
    Alert.alert('Manage person', undefined, [
      { text: 'Edit name', onPress: promptEditName },
      { text: 'Delete person', style: 'destructive', onPress: confirmDelete },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  if (isLoading) return <View style={{ flex: 1, backgroundColor: PAGE }}><LoadingState message="Loading..." /></View>;
  if (error || !person) return <View style={{ flex: 1, backgroundColor: PAGE }}><ErrorState message={error?.message ?? 'Person not found.'} onRetry={() => router.back()} /></View>;

  const { colourSet } = person;

  const menuItems = [
    { key: 'doctors',        label: 'Doctors',        icon: 'stethoscope',            colour: C_DOCTORS, route: `/(app)/family/${person.id}/doctors` },
    { key: 'medications',    label: 'Medications',    icon: 'pills',                  colour: C_MEDS, route: `/(app)/family/${person.id}/medications` },
    { key: 'medical-events', label: 'Medical Events', icon: 'list.clipboard',         colour: C_EVENTS, route: `/(app)/family/${person.id}/medical-events` },
    { key: 'notes',          label: 'Notes',          icon: 'note.text',              colour: C_NOTES, route: `/(app)/family/${person.id}/notes` },
    { key: 'info-card',      label: 'Info Card',      icon: 'person.text.rectangle',  colour: C_INFO, route: `/(app)/family/${person.id}/info-card` },
    { key: 'documents',      label: 'Documents',      icon: 'doc',                    colour: C_DOCS, route: `/(app)/family/${person.id}/documents` },
  ] as const;

  const quickActions = [
    { key: 'note',  label: 'Add Note',  icon: 'square.and.pencil', colour: C_NOTE_ADD, onPress: () => setShowNoteModal(true) },
    { key: 'todo',  label: 'Add To Do', icon: 'checkmark.circle',  colour: C_TODO_ADD, onPress: () => setShowTodoModal(true) },
    { key: 'visit', label: 'Add Visit', icon: 'calendar',          colour: C_VISIT_ADD, onPress: () => setShowVisitModal(true) },
  ] as const;

  return (
    <View style={{ flex: 1, backgroundColor: PAGE }}>
      {isFocused ? <StatusBar style="light" /> : null}
      <View style={{ backgroundColor: colourSet.dot, paddingTop: insets.top + 2, paddingHorizontal: 16, paddingBottom: 14, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <PressableBase onPress={() => router.back()} accessibilityRole="button" style={(pressed) => ({ opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 4 })}>
            <Text style={{ ...Type.body, color: '#FFFFFF' }}>‹</Text>
            <Text style={{ ...Type.caption, fontWeight: '500', color: '#FFFFFF' }}>Back</Text>
          </PressableBase>
          <PressableBase onPress={handleManagePerson} accessibilityRole="button" accessibilityLabel="Edit person name" style={(pressed) => ({ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
            <Icon name="pencil" size={15} color="#FFFFFF" />
          </PressableBase>
        </View>
        <View style={{ alignItems: 'center', marginTop: -6 }}>
          <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', marginBottom: 5 }}>
            <Text style={{ color: 'white', fontSize: 17, fontWeight: '700' }}>{person.initials}</Text>
          </View>
          <Text style={{ ...Type.display, fontSize: 20, color: 'white' }}>{person.name}</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingTop: 14 }}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          {quickActions.map((action) => (
            <PressableBase key={action.key} onPress={action.onPress} accessibilityRole="button" accessibilityLabel={action.label} style={(pressed) => ({ flex: 1, backgroundColor: pressed ? '#F0EFEA' : 'white', borderRadius: 14, paddingVertical: 14, alignItems: 'center', gap: 7, ...Shadow.resting })}>
              <Icon name={action.icon} size={24} color={action.colour} />
              <Text style={{ ...Type.micro, fontWeight: '600', letterSpacing: 0, color: TextColour.ink }}>{action.label}</Text>
            </PressableBase>
          ))}
        </View>

        <PressableBase onPress={() => router.push(`/(app)/family/${person.id}/snapshot` as never)} accessibilityRole="button" accessibilityLabel="Open Snapshot" style={(pressed) => ({ backgroundColor: pressed ? '#F0EFEA' : 'white', borderRadius: 16, padding: 15, marginBottom: 14, ...Shadow.resting })}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Icon name="camera" size={20} color={GREEN} />
            <View style={{ flex: 1 }}>
              <Text style={{ ...Type.heading, color: TextColour.ink }}>Snapshot</Text>
            </View>
            <Text style={{ color: TextColour.muted, fontSize: 14 }}>›</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ ...Type.micro, color: RED, marginBottom: 6 }}>TO DO{previewTodos.length ? ` · ${previewTodos.length}` : ''}</Text>
              {previewTodos.length === 0 ? (
                <Text style={{ ...Type.caption, color: TextColour.faint }}>None</Text>
              ) : previewTodos.map((t) => (
                <View key={t.id} style={{ flexDirection: 'row', gap: 7, marginBottom: 8 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: RED, marginTop: 5 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...Type.caption, fontWeight: '500', color: TextColour.ink }} numberOfLines={2}>{t.title}</Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={{ width: 1, backgroundColor: DIVIDER }} />
            <View style={{ flex: 1 }}>
              <Text style={{ ...Type.micro, color: GREEN, marginBottom: 6 }}>UPCOMING VISITS{previewVisits.length ? ` · ${previewVisits.length}` : ''}</Text>
              {previewVisits.length === 0 ? (
                <Text style={{ ...Type.caption, color: TextColour.faint }}>None</Text>
              ) : previewVisits.map((v) => (
                <View key={v.id} style={{ flexDirection: 'row', gap: 7, marginBottom: 8 }}>
                  <Icon name="calendar" size={15} color={GREEN} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...Type.caption, fontWeight: '500', color: TextColour.ink }} numberOfLines={2}>{v.title}</Text>
                    {v.doctorName ? <Text style={{ ...Type.caption, color: TextColour.muted }} numberOfLines={1}>{v.doctorName}</Text> : null}
                    <Text style={{ ...Type.caption, color: TextColour.muted }}>{fmtPreviewDate(v.visitDate)}{v.visitTime ? ` · ${fmtPreviewTime(v.visitTime)}` : ''}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </PressableBase>

        <View style={{ backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', ...Shadow.resting }}>
          {menuItems.map((item, index) => (
            <PressableBase key={item.key} onPress={() => router.push(item.route as never)} accessibilityRole="button" accessibilityLabel={item.label} style={(pressed) => ({ flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 15, backgroundColor: pressed ? '#F7F7F4' : 'white', gap: 13 })}>
              <View style={{ width: 26, alignItems: 'center' }}>
                <Icon name={item.icon} size={22} color={item.colour} />
              </View>
              <Text style={{ flex: 1, ...Type.body, fontWeight: '500', color: TextColour.ink }}>{item.label}</Text>
              <Text style={{ color: TextColour.muted, fontSize: 14 }}>›</Text>
              {index < menuItems.length - 1 && (
                <View style={{ position: 'absolute', left: 54, right: 0, bottom: 0, height: 1, backgroundColor: DIVIDER }} />
              )}
            </PressableBase>
          ))}
        </View>
      </ScrollView>

      <NoteModal visible={showNoteModal} editingNote={null} doctors={doctors} medications={medications} visits={personVisits} isLoading={isAddingNote} onSave={async (values) => { await addNote(values); setShowNoteModal(false); }} onDismiss={() => setShowNoteModal(false)} />
      <AddTodoModal visible={showTodoModal} isLoading={isAddingTodo} people={allPeople} defaultPersonId={person.id} doctors={doctors} visits={allVisits} onAdd={async (input) => { await addTodo(input); setShowTodoModal(false); }} onDismiss={() => setShowTodoModal(false)} />
      <AddVisitModal visible={showVisitModal} isLoading={isAddingVisit} people={allPeople} doctors={allDoctors} defaultPersonId={person.id} onAdd={async (input) => { await addVisit(input); setShowVisitModal(false); }} onDismiss={() => setShowVisitModal(false)} />
    </View>
  );
};
