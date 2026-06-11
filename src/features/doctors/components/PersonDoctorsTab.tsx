// src/features/doctors/components/PersonDoctorsTab.tsx
import { PressableBase } from '@/design-system/components/PressableBase';
import { useState } from 'react';
import { View, Text, TextInput, FlatList } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState, ErrorState, LoadingState } from '@/design-system/components/EmptyState';
import { FAB } from '@/design-system/components/FAB';
import { Fonts } from '@/design-system/tokens/fonts';
import { PERSON_COLOURS } from '@/design-system/tokens/colours';
import { usePersonDoctors } from '../hooks/usePersonDoctors';
import { DoctorCard } from './DoctorCard';
import { AddDoctorModal } from './AddDoctorModal';

interface PersonDoctorsTabProps { personId: string; personName: string; }

const SPECIALTY_COLOUR_MAP: Record<string, number> = {
  'gp': 0, 'general practitioner': 0, 'general practice': 0, 'family doctor': 0,
  'paediatrician': 1, 'pediatrician': 1, 'paediatrics': 1, 'pediatrics': 1,
  'dentist': 2, 'dental': 2, 'orthodontist': 2,
  'physiotherapist': 3, 'physiotherapy': 3, 'physio': 3,
  'optometrist': 4, 'ophthalmologist': 4, 'eye doctor': 4,
  'occupational therapist': 2, 'ot': 2,
  'speech therapist': 1, 'speech pathologist': 1,
  'psychologist': 2, 'psychiatrist': 2, 'counsellor': 2,
  'neurologist': 3, 'cardiologist': 3,
  'dermatologist': 4,
  'specialist': 1, 'surgeon': 2, 'endocrinologist': 3, 'allergist': 4,
};

function specialtyColourIndex(type: string | null, allTypes: (string | null)[]): number {
  const s = (type ?? '').toLowerCase().trim();
  if (s && SPECIALTY_COLOUR_MAP[s] !== undefined) return SPECIALTY_COLOUR_MAP[s]!;
  const unknownTypes = [...new Set(
    allTypes.map((t) => (t ?? '').toLowerCase().trim()).filter((t) => t && SPECIALTY_COLOUR_MAP[t] === undefined)
  )].sort();
  const pos = unknownTypes.indexOf(s);
  return pos >= 0 ? pos % PERSON_COLOURS.length : 0;
}

export const PersonDoctorsTab = ({ personId, personName }: PersonDoctorsTabProps) => {
  const insets = useSafeAreaInsets();
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const { doctors, isLoading, error, addDoctor, unlinkDoctor, isAdding } = usePersonDoctors(personId);
  const allTypes = doctors.map((d) => d.type);
  const filtered = doctors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.type ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <LoadingState message="Loading doctors..." />;
  if (error) return <ErrorState message={error.message} />;

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}>
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 16, paddingBottom: 8 }}>
        <PressableBase onPress={() => router.back()} accessibilityRole="button" style={(pressed) => ({ opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 })}>
          <Text style={{ fontSize: 15, color: '#2A6049' }}>‹</Text>
          <Text style={{ fontSize: 14, color: '#2A6049', fontWeight: '500' }}>Back</Text>
        </PressableBase>
        <Text style={{ fontSize: 28, fontWeight: '300', fontFamily: Fonts.serif, color: '#1C1917', lineHeight: 32 }}>Doctors</Text>
        <Text style={{ fontSize: 12, color: '#A8A09A', marginTop: 2 }}>{personName} · {doctors.length} {doctors.length === 1 ? 'doctor' : 'doctors'}</Text>
      </View>
      <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
        <View style={{ backgroundColor: '#EEEAE3', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 14, color: '#A8A09A' }}>🔍</Text>
          <TextInput value={search} onChangeText={setSearch} placeholder="Search doctors..." placeholderTextColor="#A8A09A" style={{ flex: 1, fontSize: 14, color: '#1C1917' }} />
        </View>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 0, flexGrow: 1 }}
        ListEmptyComponent={<EmptyState title="No doctors yet" message="Add a doctor to track who looks after this person." />}
        renderItem={({ item }) => (
          <DoctorCard doctor={item} colourIndex={specialtyColourIndex(item.type, allTypes)} onPress={(id) => router.push(`/(app)/family/${personId}/doctor/${id}` as never)} onUnlink={unlinkDoctor} />
        )}
      />
      <FAB onPress={() => setShowAddModal(true)} accessibilityLabel="Add doctor" />
      <AddDoctorModal visible={showAddModal} isLoading={isAdding} onAdd={addDoctor} onDismiss={() => setShowAddModal(false)} />
    </View>
  );
};
