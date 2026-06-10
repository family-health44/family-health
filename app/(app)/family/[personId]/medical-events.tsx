import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LoadingState } from '@/design-system/components/EmptyState';
import { usePersonDetail } from '@/features/family/hooks/usePersonDetail';
import { PersonMedicalEventsTab } from '@/features/medical-events/components/PersonMedicalEventsTab';

export default function PersonMedicalEventsRoute() {
  const { personId } = useLocalSearchParams<{ personId: string }>();
  const { person, isLoading } = usePersonDetail(personId ?? '');
  if (isLoading || !person) return <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}><LoadingState message="Loading..." /></View>;
  return <PersonMedicalEventsTab personId={person.id} colourSet={person.colourSet} personName={person.name} />;
}
