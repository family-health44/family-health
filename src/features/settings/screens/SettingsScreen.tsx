// src/features/settings/screens/SettingsScreen.tsx
import { PressableBase } from '@/design-system/components/PressableBase';
import { useState } from 'react';
import { View, Text, ScrollView, Alert, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/core/auth/useAuth';
import { Fonts } from '@/design-system/tokens/fonts';
import { useFamilyHomeQuery } from '@/features/family/queries/family.queries';
import { db } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { InviteFamilyMemberSection } from '@/features/invites/components/InviteFamilyMemberSection';

export const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const { session, signOut } = useAuth();
  const { data } = useFamilyHomeQuery();
  const queryClient = useQueryClient();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: async () => { setIsSigningOut(true); await signOut(); router.replace('/(auth)/sign-in'); } },
    ]);
  };

  const handleEditFamilyName = () => {
    setFamilyName(data?.familyGroup.name ?? '');
    setEditingName(true);
  };

  const handleSaveFamilyName = async () => {
    if (!familyName.trim() || !data?.familyGroup.id) return;
    setIsSavingName(true);
    try {
      const { error } = await db.from('family_groups').update({ name: familyName.trim() }).eq('id', data.familyGroup.id);
      if (error) throw error;
      // Invalidate the family query — familyGroup.name lives in the family.people() cache
      await queryClient.invalidateQueries({ queryKey: queryKeys.family.people() });
      setEditingName(false);
    } catch {
      Alert.alert('Error', 'Could not save family name.');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete account', 'This will permanently delete your account and all family health data. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete account', style: 'destructive', onPress: () => {} },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F0' }}>
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <PressableBase onPress={() => router.back()} accessibilityRole="button" style={(pressed) => ({ opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 4 })}>
          <Text style={{ fontSize: 15, color: '#2A6049' }}>‹</Text>
          <Text style={{ fontSize: 14, color: '#2A6049', fontWeight: '500' }}>Back</Text>
        </PressableBase>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4 }}>
        <Text style={{ fontSize: 28, fontWeight: '300', fontFamily: Fonts.serif, color: '#1C1917', lineHeight: 32, marginBottom: 8 }}>Settings</Text>

        <Text style={{ fontSize: 10, fontWeight: '700', color: '#A8A09A', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 16 }}>Family</Text>
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 12, overflow: 'hidden', marginBottom: 4 }}>
          {editingName ? (
            <View style={{ padding: 14, gap: 10 }}>
              <Text style={{ fontSize: 13, color: '#A8A09A' }}>Family name</Text>
              <TextInput
                value={familyName}
                onChangeText={setFamilyName}
                autoFocus
                autoCapitalize="words"
                style={{ fontSize: 14, color: '#1C1917', borderWidth: 1, borderColor: '#2A6049', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 }}
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <PressableBase onPress={() => setEditingName(false)} style={(pressed) => ({ flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E3DDD5', alignItems: 'center', opacity: pressed ? 0.6 : 1 })}>
                  <Text style={{ fontSize: 14, color: '#6B6460' }}>Cancel</Text>
                </PressableBase>
                <PressableBase onPress={handleSaveFamilyName} style={(pressed) => ({ flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#2A6049', alignItems: 'center', opacity: pressed ? 0.7 : 1 })}>
                  <Text style={{ fontSize: 14, color: 'white', fontWeight: '600' }}>{isSavingName ? 'Saving...' : 'Save'}</Text>
                </PressableBase>
              </View>
            </View>
          ) : (
            <PressableBase onPress={handleEditFamilyName} style={(pressed) => ({ padding: 14, flexDirection: 'row', alignItems: 'center', opacity: pressed ? 0.7 : 1 })}>
              <Text style={{ fontSize: 13, color: '#A8A09A', flex: 1 }}>Family name</Text>
              <Text style={{ fontSize: 13, color: '#1C1917', marginRight: 8 }}>{data?.familyGroup.name ?? '—'}</Text>
              <Text style={{ fontSize: 13, color: '#A8A09A' }}>✎</Text>
            </PressableBase>
          )}
        </View>

        <InviteFamilyMemberSection />

        <Text style={{ fontSize: 10, fontWeight: '700', color: '#A8A09A', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 16 }}>Account</Text>
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 12, overflow: 'hidden', marginBottom: 4 }}>
          <View style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: '#F0EDE8', flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: '#A8A09A', flex: 1 }}>Email</Text>
            <Text style={{ fontSize: 13, color: '#1C1917' }}>{session?.user?.email ?? '—'}</Text>
          </View>
          <PressableBase onPress={handleSignOut} accessibilityRole="button" style={(pressed) => ({ padding: 14, opacity: pressed ? 0.6 : 1 })}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#9B3A4A' }}>{isSigningOut ? 'Signing out…' : 'Sign out'}</Text>
          </PressableBase>
        </View>

        <Text style={{ fontSize: 10, fontWeight: '700', color: '#A8A09A', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 16 }}>Display</Text>
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 12, overflow: 'hidden', marginBottom: 4 }}>
          <PressableBase onPress={() => setLargeText(!largeText)} style={(pressed) => ({ padding: 14, borderBottomWidth: 1, borderBottomColor: '#F0EDE8', flexDirection: 'row', alignItems: 'center', opacity: pressed ? 0.7 : 1 })}>
            <Text style={{ fontSize: 14, flex: 1, color: '#1C1917' }}>Large text</Text>
            <View style={{ width: 40, height: 22, borderRadius: 11, backgroundColor: largeText ? '#2A6049' : '#EEEAE3', justifyContent: 'center', paddingHorizontal: 2 }}>
              <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: 'white', alignSelf: largeText ? 'flex-end' : 'flex-start', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2, elevation: 2 }} />
            </View>
          </PressableBase>
          <View style={{ padding: 14, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, flex: 1, color: '#1C1917' }}>Dark mode</Text>
            <View style={{ backgroundColor: '#EEEAE3', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: 11, color: '#A8A09A', fontWeight: '500' }}>Soon</Text>
            </View>
          </View>
        </View>

        <Text style={{ fontSize: 10, fontWeight: '700', color: '#9B3A4A', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 16 }}>Danger Zone</Text>
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 12, overflow: 'hidden' }}>
          <PressableBase onPress={handleDeleteAccount} accessibilityRole="button" style={(pressed) => ({ padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: pressed ? 0.6 : 1 })}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#9B3A4A' }}>Delete account</Text>
            <Text style={{ color: '#A8A09A', fontSize: 14 }}>›</Text>
          </PressableBase>
        </View>
      </ScrollView>
    </View>
  );
};
