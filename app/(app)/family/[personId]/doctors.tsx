// app/(app)/family/[personId]/doctors.tsx
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LoadingState } from '@/design-system/components/EmptyState';
import { usePersonDetail } from '@/features/family/hooks/usePersonDetail';
import { PersonDoctorsTab } from '@/features/doctors/components/PersonDoctorsTab';

export default function PersonDoctorsRoute() {
  const { personId } = useLocalSearchParams<{ personId: string }>();
  const { person, isLoading } = usePersonDetail(personId ?? '');
  if (isLoading || !person) {
    return <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}><LoadingState message="Loading..." /></View>;
  }
  return <PersonDoctorsTab personId={person.id} personName={person.name} />;
}