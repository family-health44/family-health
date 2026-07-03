// src/features/medications/components/PersonMedicationsTab.tsx
// Medications screen for a person — matches PWA design.

import { PressableBase } from '@/design-system/components/PressableBase';
import { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState, ErrorState, LoadingState } from '@/design-system/components/EmptyState';
import { FAB } from '@/design-system/components/FAB';
import { Fonts } from '@/design-system/tokens/fonts';
import { usePersonMedications } from '../hooks/usePersonMedications';
import { MedicationCard } from './MedicationCard';
import { AddMedicationModal } from './AddMedicationModal';
import type { PersonColourSet } from '@/design-system/tokens/colours';

interface PersonMedicationsTabProps {
  personId: string;
  colourSet: PersonColourSet;
  personName?: string;
}

export const PersonMedicationsTab = ({ personId, colourSet, personName }: PersonMedicationsTabProps) => {
  const insets = useSafeAreaInsets();
  const [showAddModal, setShowAddModal]       = useState(false);
  const [search, setSearch]                   = useState('');

  // Auto-open the Add modal when arriving via a "Get started" nudge (?add=1).
  // Guarded so it fires once, not on every render.
  const { add } = useLocalSearchParams<{ add?: string }>();
  useEffect(() => {
    if (add === '1') setShowAddModal(true);
  }, [add]);

  const {
    groups, isLoading, error,
    addMedication,
    isAdding,
  } = usePersonMedications(personId);

  if (isLoading) return <LoadingState message="Loading medications..." />;
  if (error)     return <ErrorState message={error.message} />;

  const filtered = groups
    .map((g) => ({
      ...g,
      medications: g.medications.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((g) => g.medications.length > 0);

  // Tapping a card opens the medication detail screen.
  const handleCardPress = (medicationId: string) => {
    router.push(`/(app)/family/${personId}/medication/${medicationId}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 16, paddingBottom: 8 }}>
        <PressableBase
          onPress={() => router.back()}
          accessibilityRole="button"
          style={(pressed: boolean) => ({
            opacity: pressed ? 0.6 : 1,
            flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4,
          })}
        >
          <Text style={{ fontSize: 15, color: '#2A6049' }}>‹</Text>
          <Text style={{ fontSize: 14, color: '#2A6049', fontWeight: '500' }}>Back</Text>
        </PressableBase>
        <Text style={{
          fontSize: 28, fontWeight: '300', fontFamily: Fonts.serif,
          color: '#1C1917', lineHeight: 32,
        }}>
          Medications
        </Text>
        {personName ? (
          <Text style={{ fontSize: 12, color: '#A8A09A', marginTop: 2 }}>{personName}</Text>
        ) : null}
      </View>

      {/* ── Search ─────────────────────────────────────────────────────── */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
        <View style={{
          backgroundColor: '#EEEAE3', borderRadius: 10,
          paddingHorizontal: 12, paddingVertical: 8,
          flexDirection: 'row', alignItems: 'center', gap: 8,
        }}>
          <Text style={{ fontSize: 14, color: '#A8A09A' }}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search medications..."
            placeholderTextColor="#A8A09A"
            style={{ flex: 1, fontSize: 14, color: '#1C1917' }}
          />
        </View>
      </View>

      {/* ── List ───────────────────────────────────────────────────────── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.status}
        contentContainerStyle={{ padding: 16, paddingTop: 0, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState
            title="No medications yet"
            message="Add a medication to track what this person is taking."
          />
        }
        renderItem={({ item: group }) => (
          <View style={{ marginBottom: 16 }}>
            <Text style={{
              fontSize: 10, fontWeight: '700', color: '#A8A09A',
              textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8,
            }}>
              {group.label}
            </Text>
            {group.medications.map((med) => (
              <MedicationCard
                key={med.id}
                medication={med}
                colourSet={colourSet}
                onPress={handleCardPress}
              />
            ))}
          </View>
        )}
      />

      <FAB onPress={() => setShowAddModal(true)} accessibilityLabel="Add medication" />

      {/* ── Add modal ──────────────────────────────────────────────────── */}
      <AddMedicationModal
        visible={showAddModal}
        isLoading={isAdding}
        personId={personId}
        onAdd={addMedication}
        onDismiss={() => setShowAddModal(false)}
      />

    </View>
  );
};
