// src/features/medications/components/PersonMedicationsTab.tsx
// Medications tab for the person detail screen.
// Lists medications grouped by status. Allows adding and status toggling.

import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';

import { EmptyState, ErrorState, LoadingState } from '@/design-system/components/EmptyState';
import { usePersonMedications } from '../hooks/usePersonMedications';
import { MedicationCard } from './MedicationCard';
import { AddMedicationModal } from './AddMedicationModal';

import type { PersonColourSet } from '@/design-system/tokens/colours';
import type { MedicationStatus } from '../types/medications.types';

interface PersonMedicationsTabProps {
  personId: string;
  colourSet: PersonColourSet;
}

export const PersonMedicationsTab = ({ personId, colourSet }: PersonMedicationsTabProps) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const { groups, isLoading, error, addMedication, updateStatus, isAdding } =
    usePersonMedications(personId);

  if (isLoading) return <LoadingState message="Loading medications..." />;
  if (error) return <ErrorState message={error.message} />;

  const totalCount = groups.reduce((acc, g) => acc + g.medications.length, 0);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 4, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {totalCount === 0 ? (
          <EmptyState
            title="No medications yet"
            message="Add a medication to track what this person is taking."
            actionLabel="Add medication"
            onAction={() => setShowAddModal(true)}
          />
        ) : (
          <>
            {groups.map((group) => (
              <View key={group.status} style={{ marginBottom: 16 }}>
                {/* Group header */}
                <Text style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: '#6B6866',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  marginBottom: 10,
                }}>
                  {group.label}
                </Text>

                {group.medications.map((med) => (
                  <MedicationCard
                    key={med.id}
                    medication={med}
                    colourSet={colourSet}
                    onStatusToggle={(id, status: MedicationStatus) => updateStatus(id, status)}
                  />
                ))}
              </View>
            ))}

            {/* Add more button */}
            <Pressable
              onPress={() => setShowAddModal(true)}
              accessibilityRole="button"
              accessibilityLabel="Add medication"
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 14,
                marginTop: 4,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: colourSet.border,
                borderStyle: 'dashed',
                backgroundColor: pressed ? colourSet.bg : 'transparent',
                gap: 8,
              })}
            >
              <Text style={{ fontSize: 18, color: colourSet.dot }}>+</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colourSet.dot }}>
                Add medication
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>

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
