// app/index.tsx
import { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/core/auth/useAuth';
import { useBootstrapQuery } from '@/features/invites/hooks/useBootstrap';

export default function Index() {
  const { status } = useAuth();
  const isAuthed = status === 'authenticated';
  const { data: destination } = useBootstrapQuery(isAuthed);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/(auth)/sign-in');
      return;
    }
    if (status === 'authenticated' && destination) {
      if (destination === 'has-group') {
        router.replace('/(app)/family');
      } else if (destination === 'has-invite') {
        router.replace('/(auth)/accept-invite' as never);
      } else {
        router.replace('/(auth)/onboarding');
      }
    }
  }, [status, destination]);

  return <View style={{ flex: 1, backgroundColor: '#F7F7F4' }} />;
}
