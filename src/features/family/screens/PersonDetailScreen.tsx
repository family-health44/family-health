// src/features/family/screens/PersonDetailScreen.tsx
// Person detail screen — coloured header + tab bar + tab content.
// All four tabs are now fully wired. Thin screen — no business logic.

import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

import { LoadingState, ErrorState } from '@/design-system/components/EmptyState';
import { PersonDoctorsTab } from '@/features/doctors/components/PersonDoctorsTab';
import { PersonMedicationsTab } from '@/features/medications/components/PersonMedicationsTab';
import { PersonMedicalEventsTab } from '@/features/medical-events/components/PersonMedicalEventsTab';
import { usePersonDetail } from '../hooks/usePersonDetail';
import { PersonHeader } from '../components/PersonHeader';
import { PersonTabBar } from '../components/PersonTabBar';
import { PersonOverviewTab } from '../components/PersonOverviewTab';

import type { PersonTab } from '../types/person.types';

export const PersonDetailScreen = () => {
  const { personId } = useLocalSearchParams<{ personId: string }>();
  const [activeTab, setActiveTab] = useState<PersonTab>('overview');
  const { person, isLoading, error } = usePersonDetail(personId ?? '');

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}>
        <LoadingState message="Loading..." />
      </View>
    );
  }

  if (error || !person) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}>
        <ErrorState
          message={error?.message ?? 'Person not found.'}
          onRetry={() => router.back()}
        />
      </View>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <PersonOverviewTab
            personId={person.id}
            colourSet={person.colourSet}
            onNavigate={setActiveTab}
          />
        );
      case 'doctors':
        return (
          <PersonDoctorsTab
            personId={person.id}
            colourSet={person.colourSet}
          />
        );
      case 'medications':
        return (
          <PersonMedicationsTab
            personId={person.id}
            colourSet={person.colourSet}
          />
        );
      case 'medical-events':
        return (
          <PersonMedicalEventsTab
            personId={person.id}
            colourSet={person.colourSet}
          />
        );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}>
      <PersonHeader person={person} onBack={() => router.back()} />
      <PersonTabBar
        activeTab={activeTab}
        colourSet={person.colourSet}
        onTabPress={setActiveTab}
      />
      <View style={{ flex: 1 }}>
        {renderTabContent()}
      </View>
    </View>
  );
};
