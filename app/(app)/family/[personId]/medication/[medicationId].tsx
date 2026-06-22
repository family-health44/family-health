import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LoadingState } from '@/design-system/components/EmptyState';
import { usePersonDetail } from '@/features/family/hooks/usePersonDetail';
import { MedicationDetailScreen } from '@/features/medications/screens/MedicationDetailScreen';

export default function MedicationDetailRoute() {
  const { personId, medicationId } = useLocalSearchParams<{ personId: string; medicationId: string }>();
  const { person, isLoading } = usePersonDetail(personId ?? '');
  if (isLoading || !person) {
    return <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}><LoadingState message="Loading..." /></View>;
  }
  return (
    <MedicationDetailScreen
      personId={person.id}
      medicationId={medicationId ?? ''}
      personName={person.name}
      familyGroupId={person.familyGroupId}
    />
  );
}
