// src/features/family/screens/FamilyHomeScreen.tsx
import { PressableBase } from '@/design-system/components/PressableBase';
import { useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { EmptyState, ErrorState, LoadingState } from '@/design-system/components/EmptyState';
import { ScreenHeader } from '@/design-system/components/ScreenHeader';
import { useFamilyHome } from '../hooks/useFamilyHome';
import { PersonCard } from '../components/PersonCard';
import { AddPersonModal } from '../components/AddPersonModal';
import { GetStartedSection } from '../components/GetStartedSection';
import { WelcomeTourModal } from '../components/WelcomeTourModal';
import { useWelcomeTour } from '../hooks/useWelcomeTour';
import type { Person } from '../types/family.types';

export const FamilyHomeScreen = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const { showTour, closeTour } = useWelcomeTour();
  const { data, isLoading, isRefreshing, error, refresh, addPerson, isAddingPerson } = useFamilyHome();

  const handlePersonPress = (personId: string) => router.push(`/(app)/family/${personId}`);
  const handleAddPerson = async (name: string) => { await addPerson(name); setShowAddModal(false); };

  if (isLoading) return <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}><LoadingState message="Loading family..." /></View>;
  if (error) return <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}><ErrorState message={error.message} onRetry={refresh} /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}>
      <ScreenHeader title={data?.familyGroup.name ?? 'Family'} />
      <FlatList<Person>
          data={data?.people ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor="#1F5C41" />}
          ListHeaderComponent={<GetStartedSection onRequestAddPerson={() => setShowAddModal(true)} />}
          ListEmptyComponent={
            <EmptyState title="No family members yet" message="Add your first family member to get started."
              actionLabel="Add person" onAction={() => setShowAddModal(true)} />
          }
          renderItem={({ item }) => <PersonCard person={item} onPress={handlePersonPress} />}
          ListFooterComponent={
            (data?.people.length ?? 0) > 0 ? (
              <PressableBase
                onPress={() => setShowAddModal(true)}
                accessibilityRole="button"
                accessibilityLabel="Add family member"
                style={(pressed) => ({
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  paddingVertical: 14, marginTop: 4, borderRadius: 16,
                  backgroundColor: pressed ? '#E4EFE9' : '#FFFFFF', gap: 8,
                  shadowColor: '#17211C', shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
                })}
              >
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#1F5C41' }}>+ Add family member</Text>
              </PressableBase>
            ) : null
          }
      />
      <AddPersonModal visible={showAddModal} isLoading={isAddingPerson} onAdd={handleAddPerson} onDismiss={() => setShowAddModal(false)} />
      <WelcomeTourModal
        visible={showTour}
        onClose={closeTour}
        onAddPerson={() => {
          closeTour();
          setShowAddModal(true);
        }}
      />
    </View>
  );
};
