// src/features/medications/components/PersonMedicationsTab.tsx
// Medications screen for a person — matches PWA design.

import { PressableBase } from '@/design-system/components/PressableBase';
import { SubScreenHeader } from '@/design-system/components/SubScreenHeader';
import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { EmptyState, ErrorState, LoadingState } from '@/design-system/components/EmptyState';
import { FAB } from '@/design-system/components/FAB';
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
  const [showAddModal, setShowAddModal]       = useState(false);
  const [search, setSearch]                   = useState('');

  const { add } = useLocalSearchParams<{ add?: string }>();
  const handledAddToken = useRef<string | null>(null);
  useEffect(() => {
    // The nudge sends a unique ?add token each tap, so this fires every time —
    // even when this screen is already mounted (e.g. the Visits tab) and not
    // remounted. Track the last handled token to avoid reopening on unrelated
    // re-renders.
    if (add && add !== handledAddToken.current) {
      handledAddToken.current = add;
      setShowAddModal(true);
    }
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
    <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <SubScreenHeader title="Medications" subtitle={personName || undefined} />

      {/* ── Search ─────────────────────────────────────────────────────── */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
        <View style={{
          backgroundColor: '#ECEBE5', borderRadius: 10,
          paddingHorizontal: 12, paddingVertical: 8,
          flexDirection: 'row', alignItems: 'center', gap: 8,
        }}>
          <Text style={{ fontSize: 14, color: 'rgba(23,33,28,0.55)' }}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search medications..."
            placeholderTextColor="#8B928E"
            style={{ flex: 1, fontSize: 14, color: '#17211C' }}
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
              fontSize: 10, fontWeight: '700', color: 'rgba(23,33,28,0.55)',
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
