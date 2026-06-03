// src/features/family/screens/FamilyHomeScreen.tsx
// Family home screen — lists family members with coloured cards.
// Thin screen: imports hook + components only. No business logic.

import { useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { router } from 'expo-router';

import { ScreenWrapper } from '@/design-system/components/ScreenWrapper';
import { EmptyState, ErrorState, LoadingState } from '@/design-system/components/EmptyState';
import { FAB } from '@/design-system/components/FAB';
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
  const { data, isLoading, isRefreshing, error, refresh, addPerson, isAddingPerson } =
    useFamilyHome();

  const handlePersonPress = (personId: string) => {
    router.push(`/(app)/family/${personId}`);
  };

  const handleAddPerson = async (name: string) => {
    await addPerson(name);
    setShowAddModal(false);
  };

  if (isLoading) {
    return (
      <ScreenWrapper>
        <LoadingState message="Loading family..." />
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper>
        <ErrorState message={error.message} onRetry={refresh} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper padded={false}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
      }}>
        <HamburgerButton onPress={openDrawer} />
      </View>

      <FlatList<Person>
        data={data?.people ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor="#2A6049"
          />
        }
        ListHeaderComponent={
          <View style={{ marginBottom: 20, marginTop: 4 }}>
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              color: '#A8A09A',
              textTransform: 'uppercase',
              letterSpacing: 0.9,
              marginBottom: 2,
            }}>
              {data?.familyGroup.name ?? 'Family'}
            </Text>
            <Text style={{
              fontSize: 33,
              fontWeight: '300',
              color: '#1C1917',
              fontFamily: Fonts.serif,
              lineHeight: 36,
            }}>
              Health Records
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="No family members yet"
            message="Add your first family member to get started."
            actionLabel="Add person"
            onAction={() => setShowAddModal(true)}
          />
        }
        renderItem={({ item }) => (
          <PersonCard person={item} onPress={handlePersonPress} />
        )}
        ListFooterComponent={
          (data?.people.length ?? 0) > 0 ? (
            <Pressable
              onPress={() => setShowAddModal(true)}
              accessibilityRole="button"
              accessibilityLabel="Add family member"
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 14,
                marginTop: 4,
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: '#C0D8CA',
                borderStyle: 'dashed',
                backgroundColor: pressed ? '#E6F0EC' : 'transparent',
                gap: 8,
              })}
            >
              <Text style={{ fontSize: 20, color: '#2A6049', lineHeight: 24 }}>+</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#2A6049' }}>
                Add family member
              </Text>
            </Pressable>
          ) : null
        }
      />

      <FAB
        onPress={() => setShowAddModal(true)}
        accessibilityLabel="Add family member"
      />

      <AddPersonModal
        visible={showAddModal}
        isLoading={isAddingPerson}
        onAdd={handleAddPerson}
        onDismiss={() => setShowAddModal(false)}
      />
    </ScreenWrapper>
  );
};