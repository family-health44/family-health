// src/features/family/screens/PersonDetailScreen.tsx
import { PressableBase } from '@/design-system/components/PressableBase';
import { useState } from 'react';
import { ScrollView, View, Text, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoadingState, ErrorState } from '@/design-system/components/EmptyState';
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

function fmtPreviewDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
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

  if (isLoading) return <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}><LoadingState message="Loading..." /></View>;
  if (error || !person) return <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}><ErrorState message={error?.message ?? 'Person not found.'} onRetry={() => router.back()} /></View>;

  const { colourSet } = person;

  const menuItems = [
    { key: 'doctors',        label: 'Doctors',        emoji: '👨‍⚕️', bg: '#E8EFF8', route: `/(app)/family/${person.id}/doctors` },
    { key: 'medications',    label: 'Medications',    emoji: '💊',   bg: '#E4EFE9', route: `/(app)/family/${person.id}/medications` },
    { key: 'medical-events', label: 'Medical Events', emoji: '📋',  bg: '#F5E8EB', route: `/(app)/family/${person.id}/medical-events` },
    { key: 'notes',          label: 'Notes',          emoji: '📝',  bg: '#FBF3DD', route: `/(app)/family/${person.id}/notes` },
    { key: 'info-card',      label: 'Info Card',      emoji: '🪪',   bg: '#F5EBE0', route: `/(app)/family/${person.id}/info-card` },
    { key: 'documents',      label: 'Documents',      emoji: '📄',  bg: '#EEE8F7', route: `/(app)/family/${person.id}/documents` },
  ];

  const quickActions = [
    { key: 'note',  label: 'Add Note',  emoji: '📝', onPress: () => setShowNoteModal(true) },
    { key: 'todo',  label: 'Add To Do', emoji: '✅', onPress: () => setShowTodoModal(true) },
    { key: 'visit', label: 'Add Visit', emoji: '📅', onPress: () => setShowVisitModal(true) },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}>
      {isFocused ? <StatusBar style="light" /> : null}
      <View style={{ backgroundColor: colourSet.dot, paddingTop: insets.top + 2, paddingHorizontal: 16, paddingBottom: 14, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <PressableBase onPress={() => router.back()} accessibilityRole="button" style={(pressed) => ({ opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 4 })}>
            <Text style={{ fontSize: 15, color: '#FFFFFF' }}>‹</Text>
            <Text style={{ fontSize: 14, color: '#FFFFFF', fontWeight: '500' }}>Back</Text>
          </PressableBase>
          <PressableBase onPress={handleManagePerson} accessibilityRole="button" accessibilityLabel="Edit person name" style={(pressed) => ({ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
            <Text style={{ fontSize: 14, color: '#FFFFFF' }}>✎</Text>
          </PressableBase>
        </View>
        <View style={{ alignItems: 'center', marginTop: -6 }}>
          <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', marginBottom: 5 }}>
            <Text style={{ color: 'white', fontSize: 17, fontWeight: '700' }}>{person.initials}</Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: '700', color: 'white' }}>{person.name}</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingTop: 14 }}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          {quickActions.map((action) => (
            <PressableBase key={action.key} onPress={action.onPress} accessibilityRole="button" accessibilityLabel={action.label} style={(pressed) => ({ flex: 1, backgroundColor: pressed ? '#F0EFEA' : 'white', borderRadius: 14, paddingVertical: 12, alignItems: 'center', gap: 5, shadowColor: '#17211C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 })}>
              <Text style={{ fontSize: 22 }}>{action.emoji}</Text>
              <Text style={{ fontSize: 10, fontWeight: '600', color: '#17211C' }}>{action.label}</Text>
            </PressableBase>
          ))}
        </View>
        <PressableBase onPress={() => router.push(`/(app)/family/${person.id}/snapshot` as never)} accessibilityRole="button" accessibilityLabel="Open Snapshot" style={(pressed) => ({ backgroundColor: pressed ? '#F0EFEA' : 'white', borderRadius: 16, padding: 14, marginBottom: 14, shadowColor: '#17211C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 })}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: '#E9EDF0', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 16 }}>📷</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#17211C' }}>Snapshot</Text>
            </View>
            <Text style={{ color: 'rgba(23,33,28,0.55)', fontSize: 14 }}>›</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#A63D2F', marginBottom: 6 }}>To Do{previewTodos.length ? ` · ${previewTodos.length}` : ''}</Text>
              {previewTodos.length === 0 ? (
                <Text style={{ fontSize: 12, color: 'rgba(23,33,28,0.45)' }}>None</Text>
              ) : previewTodos.map((t) => (
                <View key={t.id} style={{ flexDirection: 'row', gap: 7, marginBottom: 8 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#D64541', marginTop: 4 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: '500', color: '#17211C' }} numberOfLines={1}>{t.title}</Text>
                    <Text style={{ fontSize: 11, color: 'rgba(23,33,28,0.55)' }}>{t.dueDate ? `Due ${fmtPreviewDate(t.dueDate)}` : 'No due date'}</Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={{ width: 1, backgroundColor: '#E3E2DB' }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#1F5C41', marginBottom: 6 }}>Upcoming Visits{previewVisits.length ? ` · ${previewVisits.length}` : ''}</Text>
              {previewVisits.length === 0 ? (
                <Text style={{ fontSize: 12, color: 'rgba(23,33,28,0.45)' }}>None</Text>
              ) : previewVisits.map((v) => (
                <View key={v.id} style={{ flexDirection: 'row', gap: 7, marginBottom: 8 }}>
                  <View style={{ width: 18, height: 18, borderRadius: 5, backgroundColor: '#E4EFE9', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                    <Text style={{ fontSize: 11 }}>📅</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: '500', color: '#17211C' }} numberOfLines={1}>{v.title}</Text>
                    {v.doctorName ? <Text style={{ fontSize: 11, color: 'rgba(23,33,28,0.55)' }} numberOfLines={1}>{v.doctorName}</Text> : null}
                    <Text style={{ fontSize: 11, color: 'rgba(23,33,28,0.55)' }}>{fmtPreviewDate(v.visitDate)}{v.visitTime ? ` · ${fmtPreviewTime(v.visitTime)}` : ''}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </PressableBase>
        <View style={{ backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', shadowColor: '#17211C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
          {menuItems.map((item, index) => (
            <PressableBase key={item.key} onPress={() => router.push(item.route as never)} accessibilityRole="button" accessibilityLabel={item.label} style={(pressed) => ({ flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 14, borderBottomWidth: index < menuItems.length - 1 ? 1 : 0, borderBottomColor: 'rgba(23,33,28,0.08)', backgroundColor: pressed ? '#F7F7F4' : 'white', gap: 11 })}>
              <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 14 }}>{item.emoji}</Text>
              </View>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: '#17211C' }}>{item.label}</Text>
              <Text style={{ color: 'rgba(23,33,28,0.55)', fontSize: 14 }}>›</Text>
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
