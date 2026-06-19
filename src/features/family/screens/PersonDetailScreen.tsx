// src/features/family/screens/PersonDetailScreen.tsx
import { PressableBase } from '@/design-system/components/PressableBase';
import { useState } from 'react';
import { ScrollView, View, Text, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
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

export const PersonDetailScreen = () => {
  const { personId } = useLocalSearchParams<{ personId: string }>();
  const insets = useSafeAreaInsets();
  const { person, isLoading, error } = usePersonDetail(personId ?? '');
  const { updateName, deletePerson } = usePersonMutations();
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);

  const { addNote, isSubmitting: isAddingNote } = usePersonNotes(personId ?? '');
  const { addTodo, isAdding: isAddingTodo } = useTodos();
  const { addVisit, isAdding: isAddingVisit, listGroups } = useVisits();
  const { data: doctors = [] } = usePersonDoctorsQuery(personId ?? '');
  const { data: familyData } = useFamilyHome();
  const { data: doctorGroups } = useDoctorsQuery();
  const allPeople = familyData?.people ?? [];
  const allDoctors = (doctorGroups ?? []).flatMap((g) => g.doctors);
  const { data: medicationGroups = [] } = usePersonMedicationsQuery(personId ?? '');
  const medications = medicationGroups.flatMap((g) => g.medications);
  const allVisits = (listGroups ?? []).flatMap((g) => g.visits);

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

  if (isLoading) return <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}><LoadingState message="Loading..." /></View>;
  if (error || !person) return <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}><ErrorState message={error?.message ?? 'Person not found.'} onRetry={() => router.back()} /></View>;

  const { colourSet } = person;

  const menuItems = [
    { key: 'doctors',        label: 'Doctors',        emoji: '👨‍⚕️', bg: '#E8EFF8', route: `/(app)/family/${person.id}/doctors` },
    { key: 'medications',    label: 'Medications',    emoji: '💊',   bg: '#E6F0EC', route: `/(app)/family/${person.id}/medications` },
    { key: 'medical-events', label: 'Medical Events', emoji: '🏥',  bg: '#F5E8EB', route: `/(app)/family/${person.id}/medical-events` },
    { key: 'info-card',      label: 'Info Card',      emoji: '🪪',   bg: '#F5EBE0', route: `/(app)/family/${person.id}/info-card` },
    { key: 'documents',      label: 'Documents',      emoji: '📄',  bg: '#EEE8F7', route: `/(app)/family/${person.id}/documents` },
  ];

  const quickActions = [
    { key: 'note',  label: 'Add Note',  emoji: '📝', onPress: () => setShowNoteModal(true) },
    { key: 'todo',  label: 'Add To Do', emoji: '✅', onPress: () => setShowTodoModal(true) },
    { key: 'visit', label: 'Add Visit', emoji: '📅', onPress: () => setShowVisitModal(true) },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}>
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 16, paddingBottom: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F7F5F0' }}>
        <PressableBase onPress={() => router.back()} accessibilityRole="button" style={(pressed) => ({ opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 4 })}>
          <Text style={{ fontSize: 15, color: '#2A6049' }}>‹</Text>
          <Text style={{ fontSize: 14, color: '#2A6049', fontWeight: '500' }}>Back</Text>
        </PressableBase>
        <PressableBase onPress={handleManagePerson} accessibilityRole="button" accessibilityLabel="Edit person name" style={(pressed) => ({ width: 32, height: 32, borderRadius: 16, backgroundColor: '#EEEAE3', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
          <Text style={{ fontSize: 14, color: '#6B6866' }}>✎</Text>
        </PressableBase>
      </View>

      <View style={{ backgroundColor: colourSet.dot, paddingHorizontal: 16, paddingVertical: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: 'white', fontSize: 17, fontWeight: '700' }}>{person.initials}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 20, fontWeight: '700', color: 'white' }}>{person.name}</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>Health Records</Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14 }}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          {quickActions.map((action) => (
            <PressableBase key={action.key} onPress={action.onPress} accessibilityRole="button" accessibilityLabel={action.label} style={(pressed) => ({ flex: 1, backgroundColor: pressed ? '#F0EDE8' : 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 12, paddingVertical: 12, alignItems: 'center', gap: 5 })}>
              <Text style={{ fontSize: 22 }}>{action.emoji}</Text>
              <Text style={{ fontSize: 10, fontWeight: '600', color: '#1C1917' }}>{action.label}</Text>
            </PressableBase>
          ))}
        </View>
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 14, overflow: 'hidden' }}>
          {menuItems.map((item, index) => (
            <PressableBase key={item.key} onPress={() => router.push(item.route as never)} accessibilityRole="button" accessibilityLabel={item.label} style={(pressed) => ({ flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: index < menuItems.length - 1 ? 1 : 0, borderBottomColor: '#F0EDE8', backgroundColor: pressed ? '#F7F5F0' : 'white', gap: 12 })}>
              <View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 16 }}>{item.emoji}</Text>
              </View>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: '#1C1917' }}>{item.label}</Text>
              <Text style={{ color: '#A8A09A', fontSize: 14 }}>›</Text>
            </PressableBase>
          ))}
        </View>
      </ScrollView>

      <NoteModal visible={showNoteModal} editingNote={null} doctors={doctors} medications={medications} isLoading={isAddingNote} onSave={async (values) => { await addNote(values); setShowNoteModal(false); }} onDismiss={() => setShowNoteModal(false)} />
      <AddTodoModal visible={showTodoModal} isLoading={isAddingTodo} defaultPersonId={person.id} doctors={doctors} visits={allVisits} onAdd={async (input) => { await addTodo(input); setShowTodoModal(false); }} onDismiss={() => setShowTodoModal(false)} />
      <AddVisitModal visible={showVisitModal} isLoading={isAddingVisit} people={allPeople} doctors={allDoctors} defaultPersonId={person.id} onAdd={async (input) => { await addVisit(input); setShowVisitModal(false); }} onDismiss={() => setShowVisitModal(false)} />
    </View>
  );
};
