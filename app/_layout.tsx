// app/_layout.tsx
import '../global.css';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useAuth } from '@/core/auth/useAuth';
import { useSyncManager } from '@/core/sync/useSyncManager';
import { OfflineBanner } from '@/design-system/components/OfflineBanner';
import { DrawerProvider } from '@/design-system/components/DrawerContext';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { status } = useAuth();
  const { isOnline, isSyncing, pendingCount } = useSyncManager();
  const hasNavigated = useRef(false);
  const [fontsLoaded] = useFonts({
    'Fraunces': require('../assets/fonts/Fraunces-Variable.ttf'),
  });

  useEffect(() => {
    if (status !== 'loading' && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [status, fontsLoaded]);

  useEffect(() => {
    if (status === 'loading' || !fontsLoaded) return;
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    if (status === 'unauthenticated') {
      router.replace('/(auth)/sign-in');
    } else if (status === 'authenticated') {
      router.replace('/(app)/family');
    }
  }, [status, fontsLoaded]);

  if (status === 'loading' || !fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#F7F5F0' }} />;
  }

  return (
    <DrawerProvider>
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
    </DrawerProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
