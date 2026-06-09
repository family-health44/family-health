// app/index.tsx
import { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/core/auth/useAuth';

export default function Index() {
  const { status } = useAuth();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/(app)/family');
    } else if (status === 'unauthenticated') {
      router.replace('/(auth)/sign-in');
    }
  }, [status]);

  return <View style={{ flex: 1, backgroundColor: '#F7F5F0' }} />;
}
