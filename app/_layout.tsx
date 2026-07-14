// app/_layout.tsx
import '../global.css';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useAuth } from '@/core/auth/useAuth';
import { useSyncManager } from '@/core/sync/useSyncManager';
import { useRecoveryDeepLink } from '@/core/auth/useRecoveryDeepLink';
import { useReminderSync } from '@/core/notifications/useReminderSync';
import { OfflineBanner } from '@/design-system/components/OfflineBanner';
import { DrawerProvider } from '@/design-system/components/DrawerContext';
import { ThemeProvider } from '@/design-system/theme/ThemeProvider';
import { initSentry, Sentry } from '@/core/config/sentry';

initSentry();

SplashScreen.preventAutoHideAsync();
function RootLayoutNav() {
  const { status } = useAuth();
  const { isOnline, isSyncing, pendingCount } = useSyncManager();
  useRecoveryDeepLink();
  useReminderSync(status === 'authenticated');
  const [fontsLoaded] = useFonts({
    'Fraunces': require('../assets/fonts/Fraunces-Variable.ttf'),
  });
  useEffect(() => {
    if (status !== 'loading' && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [status, fontsLoaded]);
  if (status === 'loading' || !fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#F7F7F4' }} />;
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
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="appointment-history" options={{ presentation: 'modal' }} />
        </Stack>
      </View>
    </DrawerProvider>
  );
}
function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RootLayoutNav />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);
