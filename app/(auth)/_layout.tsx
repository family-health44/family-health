// app/(auth)/_layout.tsx
// Auth group layout — unauthenticated routes only.
// Redirects authenticated users to the app immediately.

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { router } from 'expo-router';

import { useAuth } from '@/core/auth/useAuth';

export default function AuthLayout() {
  const { status } = useAuth();

  useEffect(() => {
    // If user is already authenticated, send them into the app
    if (status === 'authenticated') {
      router.replace('/(app)/family');
    }
  }, [status]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
