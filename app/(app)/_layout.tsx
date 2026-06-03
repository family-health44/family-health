import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Tabs, router } from 'expo-router';
import { useAuth } from '@/core/auth/useAuth';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const tabConfig = [
    {
      name: 'family/index',
      label: 'Family',
      icon: (active: boolean) => (
        <View style={{ width: 26, height: 22, opacity: active ? 1 : 0.35 }}>
          <View style={{ position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: '#C9956A', top: 0, right: 4 }} />
          <View style={{ position: 'absolute', width: 10, height: 6, backgroundColor: '#C9956A', bottom: 0, right: 0, borderTopLeftRadius: 5, borderTopRightRadius: 5 }} />
          <View style={{ position: 'absolute', width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#F5A623', top: 0, left: 3 }} />
          <View style={{ position: 'absolute', width: 12, height: 7, backgroundColor: '#F5A623', bottom: 0, left: 0, borderTopLeftRadius: 6, borderTopRightRadius: 6 }} />
        </View>
      ),
    },
    {
      name: 'todos/index',
      label: 'To Do',
      icon: (active: boolean) => (
        <View style={{ width: 22, height: 22, opacity: active ? 1 : 0.35 }}>
          <View style={{ width: 22, height: 22, backgroundColor: '#1C1917', borderRadius: 3, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 10, height: 2, backgroundColor: 'white', transform: [{ rotate: '45deg' }, { translateX: -1 }, { translateY: 2 }], borderRadius: 1 }} />
            <View style={{ width: 14, height: 2, backgroundColor: 'white', transform: [{ rotate: '-45deg' }, { translateX: 2 }, { translateY: -2 }], borderRadius: 1 }} />
          </View>
        </View>
      ),
    },
    {
      name: 'visits/index',
      label: 'Visits',
      icon: (active: boolean) => (
        <View style={{ width: 22, height: 22, opacity: active ? 1 : 0.35 }}>
          <View style={{ width: 22, height: 18, backgroundColor: '#EDE9FF', borderRadius: 3, borderWidth: 1, borderColor: '#9B8EDF', position: 'absolute', bottom: 0 }} />
          <View style={{ width: 22, height: 7, backgroundColor: '#9B8EDF', borderRadius: 3, position: 'absolute', top: 2 }} />
          <View style={{ width: 2, height: 5, backgroundColor: '#9B8EDF', borderRadius: 1, position: 'absolute', top: 0, left: 6 }} />
          <View style={{ width: 2, height: 5, backgroundColor: '#9B8EDF', borderRadius: 1, position: 'absolute', top: 0, right: 6 }} />
          <View style={{ width: 3, height: 3, backgroundColor: '#7C6FCD', borderRadius: 1.5, position: 'absolute', bottom: 6, left: 4 }} />
          <View style={{ width: 3, height: 3, backgroundColor: '#7C6FCD', borderRadius: 1.5, position: 'absolute', bottom: 6, left: 10 }} />
          <View style={{ width: 3, height: 3, backgroundColor: '#7C6FCD', borderRadius: 1.5, position: 'absolute', bottom: 6, right: 4 }} />
          <View style={{ width: 3, height: 3, backgroundColor: '#7C6FCD', borderRadius: 1.5, position: 'absolute', bottom: 1, left: 4 }} />
          <View style={{ width: 3, height: 3, backgroundColor: '#7C6FCD', borderRadius: 1.5, position: 'absolute', bottom: 1, left: 10 }} />
          <View style={{ width: 3, height: 3, backgroundColor: '#B8B0E8', borderRadius: 1.5, position: 'absolute', bottom: 1, right: 4 }} />
        </View>
      ),
    },
  ];

  return (
    <View style={{ flexDirection: 'row', backgroundColor: 'rgba(247,245,240,0.97)', borderTopWidth: 1, borderTopColor: '#E3DDD5', paddingTop: 6, paddingBottom: 16 }}>
      {tabConfig.map((tab) => {
        const route = state.routes.find((r) => r.name.startsWith(tab.name.split('/')[0] ?? ''));
        if (!route) return null;
        const isFocused = state.index === state.routes.indexOf(route);
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        return (
          <Pressable key={tab.name} onPress={onPress} style={{ flex: 1, alignItems: 'center' }} accessibilityRole="button" accessibilityLabel={tab.label} accessibilityState={{ selected: isFocused }}>
            <View style={{ alignItems: 'center', gap: 2, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 2, borderColor: isFocused ? '#2A6049' : 'transparent', backgroundColor: isFocused ? '#E6F0EC' : 'transparent' }}>
              {tab.icon(isFocused)}
              <Text style={{ fontSize: 10, fontWeight: isFocused ? '700' : '500', color: isFocused ? '#2A6049' : '#A8A09A' }}>{tab.label}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function AppLayout() {
  const { status } = useAuth();
  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/(auth)/sign-in');
  }, [status]);
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="family/index" options={{ title: 'Family' }} />
      <Tabs.Screen name="todos/index" options={{ title: 'To Do' }} />
      <Tabs.Screen name="visits/index" options={{ title: 'Visits' }} />
      <Tabs.Screen name="settings/index" options={{ href: null }} />
      <Tabs.Screen name="appointments/index" options={{ href: null }} />
      <Tabs.Screen name="family/[personId]/index" options={{ href: null }} />
      <Tabs.Screen name="family/[personId]/doctors" options={{ href: null }} />
      <Tabs.Screen name="family/[personId]/medications" options={{ href: null }} />
      <Tabs.Screen name="family/[personId]/medical-events" options={{ href: null }} />
      <Tabs.Screen name="visits/[visitId]" options={{ href: null }} />
      <Tabs.Screen name="family/[personId]/doctor/[doctorId]" options={{ href: null }} />
    </Tabs>
  );
}