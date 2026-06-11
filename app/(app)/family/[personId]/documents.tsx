import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LoadingState } from '@/design-system/components/EmptyState';
import { usePersonDetail } from '@/features/family/hooks/usePersonDetail';
import { DocumentsScreen } from '@/features/family/screens/DocumentsScreen';

export default function DocumentsRoute() {
  const { personId } = useLocalSearchParams<{ personId: string }>();
  const { person, isLoading } = usePersonDetail(personId ?? '');
  if (isLoading || !person) return <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}><LoadingState message="Loading..." /></View>;
  return <DocumentsScreen personName={person.name} />;
}
