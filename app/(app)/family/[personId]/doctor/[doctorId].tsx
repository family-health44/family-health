import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LoadingState } from '@/design-system/components/EmptyState';
import { usePersonDetail } from '@/features/family/hooks/usePersonDetail';
import { DoctorDetailScreen } from '@/features/doctors/components/DoctorDetailScreen';

export default function DoctorDetailRoute() {
  const { personId, doctorId } = useLocalSearchParams<{ personId: string; doctorId: string }>();
  const { person, isLoading } = usePersonDetail(personId ?? '');
  if (isLoading || !person) {
    return <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}><LoadingState message="Loading..." /></View>;
  }
  return <DoctorDetailScreen personId={person.id} doctorId={doctorId ?? ''} />;
}
