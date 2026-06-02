// src/features/doctors/components/PersonDoctorsTab.tsx
// Doctors tab content for the person detail screen.
// Lists doctors assigned to this person, allows adding and unlinking.

import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';

import { EmptyState, ErrorState, LoadingState } from '@/design-system/components/EmptyState';
import { usePersonDoctors } from '../hooks/usePersonDoctors';
import { DoctorCard } from './DoctorCard';
import { AddDoctorModal } from './AddDoctorModal';

import type { PersonColourSet } from '@/design-system/tokens/colours';

interface PersonDoctorsTabProps {
  personId: string;
  colourSet: PersonColourSet;
}

export const PersonDoctorsTab = ({ personId, colourSet }: PersonDoctorsTabProps) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const { doctors, isLoading, error, addDoctor, unlinkDoctor, isAdding } =
    usePersonDoctors(personId);

  if (isLoading) return <LoadingState message="Loading doctors..." />;
  if (error) return <ErrorState message={error.message} />;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 4, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {doctors.length === 0 ? (
          <EmptyState
            title="No doctors yet"
            message="Add a doctor to track who looks after this person."
            actionLabel="Add doctor"
            onAction={() => setShowAddModal(true)}
          />
        ) : (
          <>
            {doctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                colourSet={colourSet}
                onUnlink={unlinkDoctor}
              />
            ))}

            {/* Add more button */}
            <Pressable
              onPress={() => setShowAddModal(true)}
              accessibilityRole="button"
              accessibilityLabel="Add doctor"
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
                Add doctor
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      <AddDoctorModal
        visible={showAddModal}
        isLoading={isAdding}
        onAdd={addDoctor}
        onDismiss={() => setShowAddModal(false)}
      />
    </View>
  );
};
