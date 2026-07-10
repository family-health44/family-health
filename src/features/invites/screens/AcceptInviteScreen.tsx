// src/features/invites/screens/AcceptInviteScreen.tsx
// Shown to an authenticated user who has no group but a pending invite.
// Accepting adds them to the family group (auto-join) and enters the app.
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Fonts } from '@/design-system/tokens/fonts';
import { ScreenWrapper } from '@/design-system/components/ScreenWrapper';
import { Button } from '@/design-system/components/Button';
import { PressableBase } from '@/design-system/components/PressableBase';
import { useAuth } from '@/core/auth/useAuth';
import { useAcceptInvite } from '../hooks/useAcceptInvite';

export const AcceptInviteScreen = () => {
  const { signOut } = useAuth();
  const { isLoading, isAccepting, error, familyGroupName, hasInvite, accept } = useAcceptInvite();

  if (isLoading) {
    return (
      <ScreenWrapper padded>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#1F5C41" />
        </View>
      </ScreenWrapper>
    );
  }

  if (!hasInvite) {
    return (
      <ScreenWrapper padded>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <Text style={{ fontSize: 44 }}>📭</Text>
          <Text style={{ fontFamily: Fonts.serif, fontSize: 24, fontWeight: '300', color: '#17211C', textAlign: 'center' }}>
            No pending invite
          </Text>
          <Text style={{ fontSize: 13, color: 'rgba(23,33,28,0.55)', textAlign: 'center', lineHeight: 20 }}>
            This invite may have been withdrawn. You can create your own family group instead.
          </Text>
          <Button label="Create a family group" variant="primary" size="lg" isFullWidth
            onPress={() => router.replace('/(auth)/onboarding')} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper padded>
      <View style={{ alignItems: 'center', marginBottom: 32, marginTop: 48 }}>
        <Text style={{ fontSize: 44, marginBottom: 12 }}>🏡</Text>
        <Text style={{ fontFamily: Fonts.serif, fontSize: 28, fontWeight: '300', color: '#17211C', textAlign: 'center' }}>
          You've been invited!
        </Text>
        <Text style={{ fontSize: 15, color: 'rgba(23,33,28,0.65)', marginTop: 12, lineHeight: 22, textAlign: 'center' }}>
          Join the{' '}
          <Text style={{ fontWeight: '700', color: '#1F5C41' }}>{familyGroupName}</Text>
          {' '}family to view and organise their records together.
        </Text>
      </View>

      <View className="gap-4">
        {error ? (
          <View className="rounded-xl border border-[#E0BDC4] bg-[#F5E8EB] px-4 py-3" accessibilityRole="alert">
            <Text className="text-sm text-[#8F2E3B]">{error.message}</Text>
          </View>
        ) : null}

        <Button label="Accept & Join" variant="primary" size="lg" isFullWidth
          isLoading={isAccepting} onPress={accept} />

        <PressableBase
          onPress={() => router.replace('/(auth)/onboarding')}
          accessibilityRole="button"
          style={(pressed) => ({ alignItems: 'center', paddingVertical: 10, opacity: pressed ? 0.6 : 1 })}
        >
          <Text style={{ fontSize: 14, color: 'rgba(23,33,28,0.65)' }}>No thanks — create my own group</Text>
        </PressableBase>

        <PressableBase
          onPress={async () => { await signOut(); router.replace('/(auth)/sign-in'); }}
          accessibilityRole="button"
          style={(pressed) => ({ alignItems: 'center', paddingVertical: 6, opacity: pressed ? 0.6 : 1 })}
        >
          <Text style={{ fontSize: 13, color: 'rgba(23,33,28,0.55)' }}>Sign out</Text>
        </PressableBase>
      </View>
    </ScreenWrapper>
  );
};
