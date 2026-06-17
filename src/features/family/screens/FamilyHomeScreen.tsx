// src/features/family/screens/FamilyHomeScreen.tsx
import { PressableBase } from '@/design-system/components/PressableBase';
import { useState } from 'react';
import { View, Text, FlatList, RefreshControl, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { EmptyState, ErrorState, LoadingState } from '@/design-system/components/EmptyState';
import { HamburgerButton } from '@/design-system/components/HamburgerButton';
import { Fonts } from '@/design-system/tokens/fonts';
import { useDrawer } from '@/design-system/components/DrawerContext';
import { useFamilyHome } from '../hooks/useFamilyHome';
import { PersonCard } from '../components/PersonCard';
import { AddPersonModal } from '../components/AddPersonModal';
import type { Person } from '../types/family.types';

export const FamilyHomeScreen = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const { openDrawer } = useDrawer();
  const { data, isLoading, isRefreshing, error, refresh, addPerson, isAddingPerson } = useFamilyHome();

  const handlePersonPress = (personId: string) => router.push(`/(app)/family/${personId}`);
  const handleAddPerson = async (name: string) => { await addPerson(name); setShowAddModal(false); };

  if (isLoading) return <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F5F0' }}><LoadingState message="Loading family..." /></SafeAreaView>;
  if (error) return <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F5F0' }}><ErrorState message={error.message} onRetry={refresh} /></SafeAreaView>;

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 50 }}>
          <HamburgerButton onPress={openDrawer} />
          <Text style={{ fontSize: 36, fontWeight: '700', color: '#1C1917', fontFamily: Fonts.serif, lineHeight: 38 }}>
            {data?.familyGroup.name ?? 'Family'}
          </Text>
        </View>
        <FlatList<Person>
          data={data?.people ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor="#2A6049" />}
          ListHeaderComponent={null}
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
                  borderWidth: 1.5, borderColor: '#C0D8CA', borderStyle: 'dashed',
                  backgroundColor: pressed ? '#E6F0EC' : 'transparent', gap: 8,
                })}
              >
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#2A6049' }}>+ Add family member</Text>
              </PressableBase>
            ) : null
          }
        />
      </SafeAreaView>
      <AddPersonModal visible={showAddModal} isLoading={isAddingPerson} onAdd={handleAddPerson} onDismiss={() => setShowAddModal(false)} />
    </View>
  );
};
