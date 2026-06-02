import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { router } from 'expo-router';
import { useAuth } from '@/core/auth/useAuth';

export default function AppLayout() {
  const { status } = useAuth();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/(auth)/sign-in');
    }
  }, [status]);

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="family/index" options={{ title: 'Family' }} />
      <Tabs.Screen name="visits/index" options={{ title: 'Visits' }} />
      <Tabs.Screen name="todos/index" options={{ title: 'To Do' }} />
      <Tabs.Screen name="settings/index" options={{ title: 'Settings' }} />
      <Tabs.Screen name="appointments/index" options={{ href: null }} />
      <Tabs.Screen name="family/[personId]/index" options={{ href: null }} />
      <Tabs.Screen name="family/[personId]/doctors" options={{ href: null }} />
      <Tabs.Screen name="family/[personId]/medications" options={{ href: null }} />
      <Tabs.Screen name="family/[personId]/medical-events" options={{ href: null }} />
      <Tabs.Screen name="visits/[visitId]" options={{ href: null }} />
    </Tabs>
  );
}
