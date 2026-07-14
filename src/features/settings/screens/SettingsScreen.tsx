// src/features/settings/screens/SettingsScreen.tsx
import { BUILD_STAMP } from '@/core/config/buildStamp';
import { PressableBase } from '@/design-system/components/PressableBase';
import { useState } from 'react';
import { View, Text, ScrollView, Alert, TextInput, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/core/auth/useAuth';
import { Type, TextColour, Shadow } from '@/design-system/tokens/typography';
import { useFamilyHomeQuery } from '@/features/family/queries/family.queries';
import { db } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { InviteFamilyMemberSection } from '@/features/invites/components/InviteFamilyMemberSection';
import { Icon } from '@/design-system/components/Icon';

const PAGE = '#F4F2EC';
const DIVIDER = 'rgba(23,33,28,0.07)';
const GREEN = '#1F5C41';
const RED = '#B33A4A';

const SectionLabel = ({ text, danger }: { text: string; danger?: boolean }) => (
  <Text style={{ ...Type.micro, textTransform: 'uppercase', color: danger ? RED : TextColour.faint, marginBottom: 8, marginTop: 20 }}>{text}</Text>
);
const Card = ({ children }: { children: React.ReactNode }) => (
  <View style={{ backgroundColor: 'white', borderRadius: 14, overflow: 'hidden', ...Shadow.resting }}>{children}</View>
);
const Divider = () => <View style={{ height: 1, backgroundColor: DIVIDER, marginHorizontal: 15 }} />;

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
      await queryClient.invalidateQueries({ queryKey: queryKeys.family.people() });
      setEditingName(false);
    } catch {
      Alert.alert('Error', 'Could not save family name.');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete account', 'This will permanently delete your account and all your family data. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete account',
        style: 'destructive',
        onPress: () => {
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
    <View style={{ flex: 1, backgroundColor: PAGE }}>
      {isDeletingAccount && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 99, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, alignItems: 'center', gap: 12 }}>
            <ActivityIndicator size="large" color={RED} />
            <Text style={{ ...Type.body, color: TextColour.ink }}>Deleting account…</Text>
          </View>
        </View>
      )}
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <PressableBase onPress={() => router.back()} accessibilityRole="button" style={(pressed) => ({ opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 4 })}>
          <Icon name="chevron.left" size={16} color={GREEN} weight="semibold" />
          <Text style={{ ...Type.caption, color: GREEN, fontWeight: '500' }}>Back</Text>
        </PressableBase>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4 }}>
        <Text style={{ ...Type.display, color: TextColour.ink, marginBottom: 4 }}>Settings</Text>

        <SectionLabel text="Family" />
        <Card>
          {editingName ? (
            <View style={{ padding: 15, gap: 10 }}>
              <Text style={{ ...Type.label, fontWeight: '400', color: TextColour.muted }}>Family name</Text>
              <TextInput
                value={familyName}
                onChangeText={setFamilyName}
                autoFocus
                autoCapitalize="words"
                style={{ ...Type.body, color: TextColour.ink, borderWidth: 1, borderColor: GREEN, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 }}
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <PressableBase onPress={() => setEditingName(false)} style={(pressed) => ({ flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E3E2DB', alignItems: 'center', opacity: pressed ? 0.6 : 1 })}>
                  <Text style={{ ...Type.body, color: TextColour.secondary }}>Cancel</Text>
                </PressableBase>
                <PressableBase onPress={handleSaveFamilyName} style={(pressed) => ({ flex: 1, padding: 10, borderRadius: 8, backgroundColor: GREEN, alignItems: 'center', opacity: pressed ? 0.7 : 1 })}>
                  <Text style={{ ...Type.body, color: 'white', fontWeight: '600' }}>{isSavingName ? 'Saving...' : 'Save'}</Text>
                </PressableBase>
              </View>
            </View>
          ) : (
            <PressableBase onPress={handleEditFamilyName} accessibilityRole="button" accessibilityLabel="Edit family name" style={(pressed) => ({ padding: 15, flexDirection: 'row', alignItems: 'center', opacity: pressed ? 0.7 : 1 })}>
              <Text style={{ ...Type.label, fontWeight: '400', color: TextColour.muted, flex: 1 }}>Family name</Text>
              <Text style={{ ...Type.label, fontWeight: '400', color: TextColour.ink, marginRight: 8 }}>{data?.familyGroup.name ?? '—'}</Text>
              <Text style={{ ...Type.label, fontWeight: '400', color: TextColour.muted }}>✎</Text>
            </PressableBase>
          )}
        </Card>

        <InviteFamilyMemberSection />

        <SectionLabel text="Account" />
        <Card>
          <View style={{ padding: 15, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ ...Type.label, fontWeight: '400', color: TextColour.muted, flex: 1 }}>Email</Text>
            <Text style={{ ...Type.label, fontWeight: '400', color: TextColour.ink }}>{session?.user?.email ?? '—'}</Text>
          </View>
          <Divider />
          <PressableBase onPress={handleSignOut} accessibilityRole="button" style={(pressed) => ({ padding: 15, opacity: pressed ? 0.6 : 1 })}>
            <Text style={{ ...Type.body, fontWeight: '500', color: RED }}>{isSigningOut ? 'Signing out…' : 'Sign out'}</Text>
          </PressableBase>
        </Card>

        <SectionLabel text="About" />
        <Card>
          <PressableBase onPress={() => router.push('/(app)/settings/disclaimer' as never)} accessibilityRole="button" style={(pressed) => ({ padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: pressed ? 0.6 : 1 })}>
            <Text style={{ ...Type.body, color: TextColour.ink }}>Medical disclaimer</Text>
            <Icon name="chevron.right" size={13} color={TextColour.muted} weight="semibold" />
          </PressableBase>
        </Card>

        <SectionLabel text="Danger Zone" danger />
        <Card>
          <PressableBase onPress={handleDeleteAccount} accessibilityRole="button" style={(pressed) => ({ padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: pressed ? 0.6 : 1 })}>
            <Text style={{ ...Type.body, fontWeight: '500', color: RED }}>Delete account</Text>
            <Icon name="chevron.right" size={13} color={TextColour.muted} weight="semibold" />
          </PressableBase>
        </Card>

        <Text style={{ ...Type.micro, fontWeight: '400', letterSpacing: 0, color: TextColour.muted, textAlign: 'center', marginTop: 24 }}>{BUILD_STAMP}</Text>
      </ScrollView>
    </View>
  );
};
