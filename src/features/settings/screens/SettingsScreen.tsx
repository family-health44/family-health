// src/features/settings/screens/SettingsScreen.tsx
// Settings screen — accessed via hamburger menu.
// Matches PWA design: account, display, danger zone sections.
import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/core/auth/useAuth';
import { Fonts } from '@/design-system/tokens/fonts';

export const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const { session, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [largeText, setLargeText] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            setIsSigningOut(true);
            await signOut();
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This will permanently delete your account and all family health data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete account', style: 'destructive', onPress: () => {} },
      ],
    );
  };

  const SectionLabel = ({ label }: { label: string }) => (
    <Text style={{ fontSize: 10, fontWeight: '700', color: '#A8A09A', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 16 }}>
      {label}
    </Text>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 4 })}
        >
          <Text style={{ fontSize: 15, color: '#2A6049' }}>‹</Text>
          <Text style={{ fontSize: 14, color: '#2A6049', fontWeight: '500' }}>Back</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4 }}>
        <Text style={{ fontSize: 28, fontWeight: '300', fontFamily: Fonts.serif, color: '#1C1917', lineHeight: 32, marginBottom: 8 }}>
          Settings
        </Text>

        {/* Account section */}
        <SectionLabel label="Account" />
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 12, overflow: 'hidden', marginBottom: 4 }}>
          <View style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: '#F0EDE8', flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: '#A8A09A', flex: 1 }}>Email</Text>
            <Text style={{ fontSize: 13, color: '#1C1917' }}>{session?.user?.email ?? '—'}</Text>
          </View>
          <Pressable
            onPress={handleSignOut}
            accessibilityRole="button"
            style={({ pressed }) => ({ padding: 14, opacity: pressed ? 0.6 : 1 })}
          >
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#9B3A4A' }}>
              {isSigningOut ? 'Signing out…' : 'Sign out'}
            </Text>
          </Pressable>
        </View>

        {/* Display section */}
        <SectionLabel label="Display" />
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 12, overflow: 'hidden', marginBottom: 4 }}>
          <Pressable
            onPress={() => setLargeText(!largeText)}
            style={({ pressed }) => ({ padding: 14, borderBottomWidth: 1, borderBottomColor: '#F0EDE8', flexDirection: 'row', alignItems: 'center', opacity: pressed ? 0.7 : 1 })}
          >
            <Text style={{ fontSize: 14, flex: 1, color: '#1C1917' }}>Large text</Text>
            <View style={{ width: 40, height: 22, borderRadius: 11, backgroundColor: largeText ? '#2A6049' : '#EEEAE3', justifyContent: 'center', paddingHorizontal: 2 }}>
              <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: 'white', alignSelf: largeText ? 'flex-end' : 'flex-start', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2, elevation: 2 }} />
            </View>
          </Pressable>
          <View style={{ padding: 14, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, flex: 1, color: '#1C1917' }}>Dark mode</Text>
            <View style={{ backgroundColor: '#EEEAE3', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: 11, color: '#A8A09A', fontWeight: '500' }}>Soon</Text>
            </View>
          </View>
        </View>

        {/* Danger zone */}
        <SectionLabel label="Danger Zone" />
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 12, overflow: 'hidden' }}>
          <Pressable
            onPress={handleDeleteAccount}
            accessibilityRole="button"
            style={({ pressed }) => ({ padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: pressed ? 0.6 : 1 })}
          >
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#9B3A4A' }}>Delete account</Text>
            <Text style={{ color: '#A8A09A', fontSize: 14 }}>›</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};
