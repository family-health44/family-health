import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LoadingState } from '@/design-system/components/EmptyState';
import { usePersonDetail } from '@/features/family/hooks/usePersonDetail';
import { PersonMedicationsTab } from '@/features/medications/components/PersonMedicationsTab';

export default function PersonMedicationsRoute() {
  const { personId } = useLocalSearchParams<{ personId: string }>();
  const { person, isLoading } = usePersonDetail(personId ?? '');
  if (isLoading || !person) return <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}><LoadingState message="Loading..." /></View>;
  return <PersonMedicationsTab personId={person.id} colourSet={person.colourSet} personName={person.name} />;
}
