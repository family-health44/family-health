// src/features/invites/components/InviteFamilyMemberSection.tsx
// Settings section: invite someone to this family group by email, and manage
// (revoke) pending invites. Self-contained — drop into SettingsScreen.
//
// ORGANISER CAP: 2 per family group (account holder + 1). The DB is the real
// enforcement (trg_enforce_organiser_cap / trg_enforce_invite_cap). This UI only
// hides the CTA and explains the limit. Pending invites hold a seat.
import { useState } from 'react';
import { View, Text, TextInput, Alert, ActivityIndicator } from 'react-native';
import { PressableBase } from '@/design-system/components/PressableBase';
import { Type, TextColour, Shadow } from '@/design-system/tokens/typography';
import { useAuth } from '@/core/auth/useAuth';
import { useGroupInvitesQuery, useGroupSeatsQuery, useOrganisersQuery } from '../queries/invites.queries';
import {
  useCreateInviteMutation,
  useRevokeInviteMutation,
  useRemoveOrganiserMutation,
  isOrganiserCapError,
} from '../mutations/invites.mutations';
import { MAX_ORGANISERS } from '../types/invites.types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DIVIDER = 'rgba(23,33,28,0.07)';
const GREEN = '#1F5C41';
const RED = '#B33A4A';
const AMBER = '#C9956A';

const Card = ({ children }: { children: React.ReactNode }) => (
  <View style={{ backgroundColor: 'white', borderRadius: 14, overflow: 'hidden', marginBottom: 8, ...Shadow.resting }}>{children}</View>
);
const Divider = () => <View style={{ height: 1, backgroundColor: DIVIDER, marginHorizontal: 15 }} />;

export const InviteFamilyMemberSection = () => {
  const { session } = useAuth();
  const { data: invites, isLoading } = useGroupInvitesQuery();
  const { data: seats } = useGroupSeatsQuery();
  const { data: organisers } = useOrganisersQuery();
  const createInvite = useCreateInviteMutation();
  const revokeInvite = useRevokeInviteMutation();
  const removeOrganiser = useRemoveOrganiserMutation();
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);

  const seatsUsed = seats ?? MAX_ORGANISERS; // fail closed while loading
  const atCap = seatsUsed >= MAX_ORGANISERS;

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
    } catch (error) {
      setAdding(false);
      if (isOrganiserCapError(error)) {
        Alert.alert(
          'Organiser limit reached',
          `A family can have ${MAX_ORGANISERS} organisers. Revoke the pending invite or remove an organiser first.`,
        );
      } else {
        Alert.alert('Could not create invite', 'Please try again.');
      }
    }
  };

  const handleRevoke = (id: string, addr: string) => {
    Alert.alert('Revoke invite', `Remove the invite for ${addr}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Revoke', style: 'destructive', onPress: () => revokeInvite.mutate(id) },
    ]);
  };

  const handleRemoveOrganiser = (memberId: string, addr: string) => {
    Alert.alert(
      'Remove organiser',
      `Remove ${addr} from this family? They will lose access to all records. This frees a seat.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeOrganiser.mutateAsync(memberId);
            } catch {
              Alert.alert('Could not remove', 'Please try again.');
            }
          },
        },
      ],
    );
  };

  const pending = (invites ?? []).filter((i) => !i.accepted);
  const members = organisers ?? [];
  const myEmail = session?.user?.email?.toLowerCase() ?? null;
  // Only the account holder may remove an organiser (also enforced in the RPC).
  const viewerIsOwner = members.some(
    (m) => m.role === 'owner' && m.email.toLowerCase() === myEmail,
  );

  return (
    <>
      <Text style={{ ...Type.micro, textTransform: 'uppercase', color: TextColour.faint, marginBottom: 8, marginTop: 20 }}>
        Family Members
      </Text>

      <Card>
        {atCap ? (
          <View style={{ paddingVertical: 15, paddingHorizontal: 16 }}>
            <Text style={{ ...Type.body, color: TextColour.secondary }}>
              {seatsUsed} of {MAX_ORGANISERS} organisers
            </Text>
            <Text style={{ ...Type.caption, color: TextColour.muted, marginTop: 4, lineHeight: 17 }}>
              A family can have {MAX_ORGANISERS} organisers. Shared access for carers is coming to Family Plus.
            </Text>
          </View>
        ) : adding ? (
          <View style={{ padding: 16, gap: 12 }}>
            <Text style={{ ...Type.caption, color: TextColour.muted }}>Invite by email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoFocus
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="name@example.com"
              placeholderTextColor={TextColour.faint}
              style={{ ...Type.body, color: TextColour.ink, backgroundColor: '#F4F2EC', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <PressableBase
                onPress={() => { setAdding(false); setEmail(''); }}
                style={(pressed) => ({ flex: 1, paddingVertical: 11, borderRadius: 10, backgroundColor: '#F4F2EC', alignItems: 'center', opacity: pressed ? 0.6 : 1 })}
              >
                <Text style={{ ...Type.body, fontWeight: '600', color: TextColour.secondary }}>Cancel</Text>
              </PressableBase>
              <PressableBase
                onPress={handleSend}
                style={(pressed) => ({ flex: 1, paddingVertical: 11, borderRadius: 10, backgroundColor: GREEN, alignItems: 'center', opacity: pressed ? 0.7 : 1 })}
              >
                <Text style={{ ...Type.body, fontWeight: '600', color: 'white' }}>
                  {createInvite.isPending ? 'Sending…' : 'Send invite'}
                </Text>
              </PressableBase>
            </View>
          </View>
        ) : (
          <PressableBase
            onPress={() => setAdding(true)}
            style={(pressed) => ({ paddingVertical: 15, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', opacity: pressed ? 0.7 : 1 })}
          >
            <Text style={{ ...Type.body, fontWeight: '600', color: GREEN, flex: 1 }}>+ Invite a family member</Text>
            <Text style={{ ...Type.caption, color: TextColour.faint }}>{seatsUsed}/{MAX_ORGANISERS}</Text>
          </PressableBase>
        )}
      </Card>

      {isLoading ? (
        <View style={{ paddingVertical: 16 }}><ActivityIndicator color={GREEN} /></View>
      ) : null}

      {pending.length > 0 ? (
        <Card>
          {pending.map((inv, idx) => (
            <View key={inv.id}>
              {idx > 0 ? <Divider /> : null}
              <View style={{ paddingVertical: 13, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...Type.body, color: TextColour.ink }}>{inv.invited_email}</Text>
                  <Text style={{ ...Type.caption, color: AMBER, marginTop: 2 }}>Pending</Text>
                </View>
                <PressableBase
                  onPress={() => handleRevoke(inv.id, inv.invited_email)}
                  style={(pressed) => ({ opacity: pressed ? 0.6 : 1, paddingHorizontal: 4, paddingVertical: 4 })}
                >
                  <Text style={{ ...Type.label, color: RED }}>Revoke</Text>
                </PressableBase>
              </View>
            </View>
          ))}
        </Card>
      ) : null}

      {members.length > 0 ? (
        <Card>
          {members.map((m, idx) => (
            <View key={m.memberId}>
              {idx > 0 ? <Divider /> : null}
              <View style={{ paddingVertical: 13, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...Type.body, color: TextColour.ink }}>{m.email}</Text>
                  <Text style={{ ...Type.caption, color: GREEN, marginTop: 2 }}>
                    {m.role === 'owner' ? 'Account holder' : 'Organiser'}
                  </Text>
                </View>
                {m.role === 'member' && viewerIsOwner ? (
                  <PressableBase
                    onPress={() => handleRemoveOrganiser(m.memberId, m.email)}
                    style={(pressed) => ({ opacity: pressed ? 0.6 : 1, paddingHorizontal: 4, paddingVertical: 4 })}
                  >
                    <Text style={{ ...Type.label, color: RED }}>Remove</Text>
                  </PressableBase>
                ) : null}
              </View>
            </View>
          ))}
        </Card>
      ) : null}
    </>
  );
};
