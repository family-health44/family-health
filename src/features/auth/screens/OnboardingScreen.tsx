// src/features/auth/screens/OnboardingScreen.tsx
// Onboarding screen — shown after first sign-in to create a family group.
// Thin UI wired to useOnboarding hook. No business logic.

import { View, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Fonts } from '@/design-system/tokens/fonts';

import { ScreenWrapper } from '@/design-system/components/ScreenWrapper';
import { Input } from '@/design-system/components/Input';
import { Button } from '@/design-system/components/Button';
import { PressableBase } from '@/design-system/components/PressableBase';
import { useOnboarding } from '../hooks/useOnboarding';
import { onboardingSchema } from '../types/auth.types';
import { useAuth } from '@/core/auth/useAuth';

import type { OnboardingFormValues } from '../types/auth.types';

export const OnboardingScreen = () => {
  const { isLoading, error, createFamily, clearError } = useOnboarding();
  const { signOut } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { familyGroupName: '' },
  });

  const onSubmit = (values: OnboardingFormValues) => {
    createFamily(values);
  };

  return (
    <ScreenWrapper avoidKeyboard padded>
      {/* Header */}
      <View style={{ alignItems: 'center', marginBottom: 32, marginTop: 32 }}>
        <Text style={{ fontSize: 44, marginBottom: 12 }}>🏡</Text>
        <Text style={{ fontFamily: Fonts.serif, fontSize: 28, fontWeight: '300', color: '#1C1917' }}>
          Welcome!
        </Text>
        <Text style={{ fontSize: 13, color: '#A8A09A', marginTop: 8, lineHeight: 20, textAlign: 'center' }}>
          {"Let's set up your family group."}
        </Text>
      </View>

      {/* Form */}
      <View className="gap-5">
        <Controller
          control={control}
          name="familyGroupName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Family Group Name"
              isRequired
              placeholder="e.g. The Smith Family"
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onSubmit)}
              value={value}
              onChangeText={(text) => {
                onChange(text);
                if (error) clearError();
              }}
              onBlur={onBlur}
              error={errors.familyGroupName?.message}
            />
          )}
        />

        {/* Server-side error */}
        {error ? (
          <View
            className="rounded-xl border border-[#E0BDC4] bg-[#F5E8EB] px-4 py-3"
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            <Text className="text-sm text-[#7A2030]">{error.message}</Text>
          </View>
        ) : null}

        <Button
          label="Create Family Group"
          variant="primary"
          size="lg"
          isFullWidth
          isLoading={isLoading}
          onPress={handleSubmit(onSubmit)}
        />

        {/* Sign out link */}
        <PressableBase
          onPress={signOut}
          accessibilityRole="button"
          style={(pressed) => ({ alignItems: 'center', paddingVertical: 4, opacity: pressed ? 0.6 : 1 })}
        >
          <Text style={{ fontSize: 13, color: '#A8A09A' }}>Sign out</Text>
        </PressableBase>
      </View>
    </ScreenWrapper>
  );
};
