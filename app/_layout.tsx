// app/_layout.tsx
import '../global.css';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useAuth } from '@/core/auth/useAuth';
import { useSyncManager } from '@/core/sync/useSyncManager';
import { OfflineBanner } from '@/design-system/components/OfflineBanner';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { status } = useAuth();
  const { isOnline, isSyncing, pendingCount } = useSyncManager();

  useEffect(() => {
    if (status !== 'loading') {
      SplashScreen.hideAsync();
    }
  }, [status]);

  if (status === 'loading') return null;

  return (
    <View style={{ flex: 1 }}>
      <OfflineBanner
        isOnline={isOnline}
        isSyncing={isSyncing}
        pendingCount={pendingCount}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutNav />
    </QueryClientProvider>
  );
}
