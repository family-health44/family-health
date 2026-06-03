// app/(app)/visits/[visitId].tsx
import { useLocalSearchParams } from 'expo-router';
import { VisitDetailScreen } from '@/features/visits/screens/VisitDetailScreen';

export default function VisitDetailRoute() {
  const { visitId } = useLocalSearchParams<{ visitId: string }>();
  return <VisitDetailScreen visitId={visitId ?? ''} />;
}
