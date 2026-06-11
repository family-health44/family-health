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

// Each canonical specialty type has a unique colour index (0–29).
// Aliases (alternate spellings/abbreviations) map to the same index.
// Any unknown type falls back to hash-based assignment in specialtyColourIndex().
const SPECIALTY_COLOUR_MAP: Record<string, number> = {
  // 0 — sage green
  'gp': 0, 'general practitioner': 0, 'general practice': 0, 'family doctor': 0, 'family medicine': 0, 'primary care': 0,
  // 1 — sky blue
  'paediatrician': 1, 'pediatrician': 1, 'paediatrics': 1, 'pediatrics': 1, 'paediatric': 1, 'pediatric': 1,
  // 2 — dusty rose
  'dentist': 2, 'dental': 2, 'dentistry': 2,
  // 3 — soft purple
  'physiotherapist': 3, 'physiotherapy': 3, 'physio': 3, 'physical therapist': 3, 'physical therapy': 3,
  // 4 — warm amber
  'optometrist': 4, 'optometry': 4, 'eye doctor': 4, 'vision': 4,
  // 5 — teal
  'ophthalmologist': 5, 'ophthalmology': 5,
  // 6 — coral
  'orthodontist': 6, 'orthodontics': 6, 'braces': 6,
  // 7 — mint
  'occupational therapist': 7, 'ot': 7, 'occupational therapy': 7,
  // 8 — lavender
  'speech therapist': 8, 'speech pathologist': 8, 'speech language pathologist': 8, 'slp': 8, 'speech therapy': 8, 'speech pathology': 8,
  // 9 — gold
  'psychologist': 9, 'psychology': 9,
  // 10 — slate blue
  'counsellor': 10, 'counselor': 10, 'counselling': 10, 'counseling': 10, 'therapist': 10,
  // 11 — dusty pink
  'psychiatrist': 11, 'psychiatry': 11,
  // 12 — olive
  'neurologist': 12, 'neurology': 12,
  // 13 — sky teal
  'cardiologist': 13, 'cardiology': 13, 'heart': 13,
  // 14 — warm rose
  'endocrinologist': 14, 'endocrinology': 14,
  // 15 — forest green
  'dermatologist': 15, 'dermatology': 15, 'skin': 15,
  // 16 — periwinkle
  'allergist': 16, 'allergy': 16, 'immunologist': 16, 'immunology': 16, 'allergist/immunologist': 16,
  // 17 — peach
  'surgeon': 17, 'surgery': 17, 'surgical': 17,
  // 18 — sage teal
  'obstetrician': 18, 'obstetrics': 18, 'gynaecologist': 18, 'gynecologist': 18, 'gynaecology': 18, 'gynecology': 18, 'ob/gyn': 18, 'obgyn': 18,
  // 19 — warm purple
  'gastroenterologist': 19, 'gastroenterology': 19, 'gastro': 19,
  // 20 — burnt orange
  'urologist': 20, 'urology': 20,
  // 21 — indigo
  'rheumatologist': 21, 'rheumatology': 21,
  // 22 — fern
  'oncologist': 22, 'oncology': 22, 'cancer': 22,
  // 23 — mauve
  'radiologist': 23, 'radiology': 23, 'radiography': 23,
  // 24 — azure
  'pathologist': 24, 'pathology': 24,
  // 25 — deep teal
  'dietitian': 25, 'dietician': 25, 'nutritionist': 25, 'nutrition': 25, 'dietetics': 25,
  // 26 — lilac
  'podiatrist': 26, 'podiatry': 26, 'podiatric': 26,
  // 27 — copper
  'chiropractor': 27, 'chiropractic': 27, 'chiro': 27,
  // 28 — seafoam
  'naturopath': 28, 'naturopathy': 28, 'naturopathic': 28,
  // 29 — violet
  'audiologist': 29, 'audiology': 29, 'hearing': 29,
  // Rarer types — reuse indices 0–16 (unlikely to co-appear on same person as their twin)
  'osteopath': 0, 'osteopathy': 0, 'osteopathic': 0,
  'respiratory': 1, 'respiratory physician': 1, 'pulmonologist': 1, 'pulmonology': 1, 'lung': 1,
  'haematologist': 2, 'hematologist': 2, 'haematology': 2, 'hematology': 2,
  'geriatrician': 3, 'geriatrics': 3, 'aged care': 3,
  'paediatric surgeon': 4, 'pediatric surgeon': 4,
  'hepatologist': 5, 'hepatology': 5, 'liver': 5,
  'nephrologist': 6, 'nephrology': 6, 'kidney': 6,
  'infectious disease': 7, 'infectious diseases': 7,
  'sleep specialist': 8, 'sleep physician': 8, 'sleep': 8,
  'pain specialist': 9, 'pain management': 9, 'pain': 9,
  'rehabilitation physician': 10, 'rehabilitation': 10, 'rehab': 10,
  'sports medicine': 11, 'sports physician': 11, 'sports doctor': 11,
  'genetic counsellor': 12, 'genetic counselor': 12, 'genetics': 12, 'geneticist': 12,
  'specialist': 13,
  'clinical immunologist': 14,
  'other': 15,
};

// Returns a colour index for a doctor type.
// Known types use the curated map (guaranteed unique per canonical type).
// Unknown types are assigned by hash of the type string so the same unknown
// type always gets the same colour, and different unknown types usually differ.
function specialtyColourIndex(type: string | null): number {
  const s = (type ?? '').toLowerCase().trim();
  if (s && SPECIALTY_COLOUR_MAP[s] !== undefined) return SPECIALTY_COLOUR_MAP[s]!;
  if (!s) return 0;
  // Hash fallback for unknown types
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + (s.charCodeAt(i) ?? 0)) >>> 0;
  }
  return hash % PERSON_COLOURS.length;
}

export const PersonDoctorsTab = ({ personId, personName }: PersonDoctorsTabProps) => {
  const insets = useSafeAreaInsets();
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const { doctors, isLoading, error, addDoctor, unlinkDoctor, isAdding } = usePersonDoctors(personId);
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
          <DoctorCard
            doctor={item}
            colourIndex={specialtyColourIndex(item.type)}
            onPress={(id) => router.push(`/(app)/family/${personId}/doctor/${id}` as never)}
            onUnlink={unlinkDoctor}
          />
        )}
      />
      <FAB onPress={() => setShowAddModal(true)} accessibilityLabel="Add doctor" />
      <AddDoctorModal visible={showAddModal} isLoading={isAdding} onAdd={addDoctor} onDismiss={() => setShowAddModal(false)} />
    </View>
  );
};
