// src/features/invites/components/InviteFamilyMemberSection.tsx
// Settings section: invite someone to this family group by email, and manage
// (revoke) pending invites. Self-contained — drop into SettingsScreen.
import { useState } from 'react';
import { View, Text, TextInput, Alert, ActivityIndicator } from 'react-native';
import { PressableBase } from '@/design-system/components/PressableBase';
import { useGroupInvitesQuery } from '../queries/invites.queries';
import { useCreateInviteMutation, useRevokeInviteMutation } from '../mutations/invites.mutations';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const InviteFamilyMemberSection = () => {
  const { data: invites, isLoading } = useGroupInvitesQuery();
  const createInvite = useCreateInviteMutation();
  const revokeInvite = useRevokeInviteMutation();
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);

  const handleSend = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    try {
      await createInvite.mutateAsync(trimmed);
      setEmail('');
      setAdding(false);
      Alert.alert(
        'Invite created',
        `${trimmed} can now join your family. Ask them to download the app and sign up with this email — they'll see the invite on launch.`,
      );
    } catch {
      Alert.alert('Could not create invite', 'Please try again.');
    }
  };

  const handleRevoke = (id: string, addr: string) => {
    Alert.alert('Revoke invite', `Remove the invite for ${addr}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Revoke', style: 'destructive', onPress: () => revokeInvite.mutate(id) },
    ]);
  };

  const pending = (invites ?? []).filter((i) => !i.accepted);
  const accepted = (invites ?? []).filter((i) => i.accepted);

  return (
    <>
      <Text style={{ fontSize: 10, fontWeight: '700', color: '#A8A09A', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 16 }}>
        Family Members
      </Text>
      <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 12, overflow: 'hidden', marginBottom: 4 }}>
        {adding ? (
          <View style={{ padding: 14, gap: 10 }}>
            <Text style={{ fontSize: 13, color: '#A8A09A' }}>Invite by email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoFocus
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="name@example.com"
              placeholderTextColor="#C4BDB5"
              style={{ fontSize: 14, color: '#1C1917', borderWidth: 1, borderColor: '#2A6049', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 }}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <PressableBase onPress={() => { setAdding(false); setEmail(''); }} style={(pressed) => ({ flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E3DDD5', alignItems: 'center', opacity: pressed ? 0.6 : 1 })}>
                <Text style={{ fontSize: 14, color: '#6B6866' }}>Cancel</Text>
              </PressableBase>
              <PressableBase onPress={handleSend} style={(pressed) => ({ flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#2A6049', alignItems: 'center', opacity: pressed ? 0.7 : 1 })}>
                <Text style={{ fontSize: 14, color: 'white', fontWeight: '600' }}>{createInvite.isPending ? 'Sending…' : 'Send invite'}</Text>
              </PressableBase>
            </View>
          </View>
        ) : (
          <PressableBase onPress={() => setAdding(true)} style={(pressed) => ({ padding: 14, flexDirection: 'row', alignItems: 'center', opacity: pressed ? 0.7 : 1 })}>
            <Text style={{ fontSize: 14, color: '#2A6049', fontWeight: '500', flex: 1 }}>+ Invite a family member</Text>
          </PressableBase>
        )}
      </View>

      {isLoading ? (
        <View style={{ padding: 14 }}><ActivityIndicator color="#2A6049" /></View>
      ) : null}

      {pending.length > 0 ? (
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 12, overflow: 'hidden', marginBottom: 4 }}>
          {pending.map((inv, idx) => (
            <View key={inv.id} style={{ padding: 14, flexDirection: 'row', alignItems: 'center', borderTopWidth: idx === 0 ? 0 : 1, borderTopColor: '#F0EDE8' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: '#1C1917' }}>{inv.invited_email}</Text>
                <Text style={{ fontSize: 11, color: '#C9956A', marginTop: 2 }}>Pending</Text>
              </View>
              <PressableBase onPress={() => handleRevoke(inv.id, inv.invited_email)} style={(pressed) => ({ opacity: pressed ? 0.6 : 1, paddingHorizontal: 4 })}>
                <Text style={{ fontSize: 13, color: '#9B3A4A' }}>Revoke</Text>
              </PressableBase>
            </View>
          ))}
        </View>
      ) : null}

      {accepted.length > 0 ? (
        <View style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E3DDD5', borderRadius: 12, overflow: 'hidden', marginBottom: 4 }}>
          {accepted.map((inv, idx) => (
            <View key={inv.id} style={{ padding: 14, flexDirection: 'row', alignItems: 'center', borderTopWidth: idx === 0 ? 0 : 1, borderTopColor: '#F0EDE8' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: '#1C1917' }}>{inv.invited_email}</Text>
                <Text style={{ fontSize: 11, color: '#2A6049', marginTop: 2 }}>Joined</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </>
  );
};
