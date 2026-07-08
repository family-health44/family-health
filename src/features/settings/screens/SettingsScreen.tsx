// src/features/settings/screens/SettingsScreen.tsx
import { BUILD_STAMP } from '@/core/config/buildStamp';
import { PressableBase } from '@/design-system/components/PressableBase';
import { useState } from 'react';
import { View, Text, ScrollView, Alert, TextInput, ActivityIndicator } from 'react-native';
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
  const { session, signOut, deleteAccount } = useAuth();
  const { data } = useFamilyHomeQuery();
  const queryClient = useQueryClient();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

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
      {
        text: 'Delete account',
        style: 'destructive',
        onPress: () => {
          // Second confirmation — Apple guideline 5.1.1(v) wants clear intent.
          Alert.alert(
            'Are you absolutely sure?',
            'All records, visits, medications, and documents will be deleted forever.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Yes, delete everything',
                style: 'destructive',
                onPress: async () => {
                  setIsDeletingAccount(true);
                  try {
                    await deleteAccount();
                    router.replace('/(auth)/sign-in');
                  } catch {
                    setIsDeletingAccount(false);
                    Alert.alert('Could not delete account', 'Please try again or contact support.');
                  }
                },
              },
            ],
          );
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F7F4' }}>
      {isDeletingAccount && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 99, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, alignItems: 'center', gap: 12 }}>
            <ActivityIndicator size="large" color="#B33A4A" />
            <Text style={{ fontSize: 14, color: '#17211C' }}>Deleting account…</Text>
          </View>
        </View>
      )}
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <PressableBase onPress={() => router.back()} accessibilityRole="button" style={(pressed) => ({ opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 4 })}>
          <Text style={{ fontSize: 15, color: '#1F5C41' }}>‹</Text>
          <Text style={{ fontSize: 14, color: '#1F5C41', fontWeight: '500' }}>Back</Text>
        </PressableBase>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4 }}>
        <Text style={{ fontSize: 28, fontWeight: '300', fontFamily: Fonts.serif, color: '#17211C', lineHeight: 32, marginBottom: 8 }}>Settings</Text>

        <Text style={{ fontSize: 10, fontWeight: '700', color: 'rgba(23,33,28,0.55)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 16 }}>Family</Text>
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3E2DB', borderRadius: 12, overflow: 'hidden', marginBottom: 4 }}>
          {editingName ? (
            <View style={{ padding: 14, gap: 10 }}>
              <Text style={{ fontSize: 13, color: 'rgba(23,33,28,0.55)' }}>Family name</Text>
              <TextInput
                value={familyName}
                onChangeText={setFamilyName}
                autoFocus
                autoCapitalize="words"
                style={{ fontSize: 14, color: '#17211C', borderWidth: 1, borderColor: '#1F5C41', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 }}
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <PressableBase onPress={() => setEditingName(false)} style={(pressed) => ({ flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E3E2DB', alignItems: 'center', opacity: pressed ? 0.6 : 1 })}>
                  <Text style={{ fontSize: 14, color: 'rgba(23,33,28,0.65)' }}>Cancel</Text>
                </PressableBase>
                <PressableBase onPress={handleSaveFamilyName} style={(pressed) => ({ flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#1F5C41', alignItems: 'center', opacity: pressed ? 0.7 : 1 })}>
                  <Text style={{ fontSize: 14, color: 'white', fontWeight: '600' }}>{isSavingName ? 'Saving...' : 'Save'}</Text>
                </PressableBase>
              </View>
            </View>
          ) : (
            <PressableBase onPress={handleEditFamilyName} accessibilityRole="button" accessibilityLabel="Edit family name" style={(pressed) => ({ padding: 14, flexDirection: 'row', alignItems: 'center', opacity: pressed ? 0.7 : 1 })}>
              <Text style={{ fontSize: 13, color: 'rgba(23,33,28,0.55)', flex: 1 }}>Family name</Text>
              <Text style={{ fontSize: 13, color: '#17211C', marginRight: 8 }}>{data?.familyGroup.name ?? '—'}</Text>
              <Text style={{ fontSize: 13, color: 'rgba(23,33,28,0.55)' }}>✎</Text>
            </PressableBase>
          )}
        </View>

        <InviteFamilyMemberSection />

        <Text style={{ fontSize: 10, fontWeight: '700', color: 'rgba(23,33,28,0.55)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 16 }}>Account</Text>
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3E2DB', borderRadius: 12, overflow: 'hidden', marginBottom: 4 }}>
          <View style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: '#F0EFEA', flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: 'rgba(23,33,28,0.55)', flex: 1 }}>Email</Text>
            <Text style={{ fontSize: 13, color: '#17211C' }}>{session?.user?.email ?? '—'}</Text>
          </View>
          <PressableBase onPress={handleSignOut} accessibilityRole="button" style={(pressed) => ({ padding: 14, opacity: pressed ? 0.6 : 1 })}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#B33A4A' }}>{isSigningOut ? 'Signing out…' : 'Sign out'}</Text>
          </PressableBase>
        </View>

        <Text style={{ fontSize: 10, fontWeight: '700', color: 'rgba(23,33,28,0.55)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 16 }}>Display</Text>
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3E2DB', borderRadius: 12, overflow: 'hidden', marginBottom: 4 }}>
          <View style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: '#F0EFEA', flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, flex: 1, color: '#17211C' }}>Large text</Text>
            <View style={{ backgroundColor: '#ECEBE5', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: 11, color: 'rgba(23,33,28,0.55)', fontWeight: '500' }}>Coming soon</Text>
            </View>
          </View>
          <View style={{ padding: 14, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, flex: 1, color: '#17211C' }}>Dark mode</Text>
            <View style={{ backgroundColor: '#ECEBE5', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: 11, color: 'rgba(23,33,28,0.55)', fontWeight: '500' }}>Coming soon</Text>
            </View>
          </View>
        </View>

        <Text style={{ fontSize: 10, fontWeight: '700', color: 'rgba(23,33,28,0.55)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 16 }}>About</Text>
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3E2DB', borderRadius: 12, overflow: 'hidden', marginBottom: 4 }}>
          <PressableBase onPress={() => router.push('/(app)/settings/disclaimer' as never)} accessibilityRole="button" style={(pressed) => ({ padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: pressed ? 0.6 : 1 })}>
            <Text style={{ fontSize: 14, color: '#17211C' }}>Medical disclaimer</Text>
            <Text style={{ color: 'rgba(23,33,28,0.55)', fontSize: 14 }}>›</Text>
          </PressableBase>
        </View>

        <Text style={{ fontSize: 10, fontWeight: '700', color: '#B33A4A', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 16 }}>Danger Zone</Text>
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3E2DB', borderRadius: 12, overflow: 'hidden' }}>
          <PressableBase onPress={handleDeleteAccount} accessibilityRole="button" style={(pressed) => ({ padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: pressed ? 0.6 : 1 })}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#B33A4A' }}>Delete account</Text>
            <Text style={{ color: 'rgba(23,33,28,0.55)', fontSize: 14 }}>›</Text>
          </PressableBase>
        </View>
        <Text style={{ fontSize: 10, color: 'rgba(23,33,28,0.55)', textAlign: 'center', marginTop: 20 }}>{BUILD_STAMP}</Text>
      </ScrollView>
    </View>
  );
};
