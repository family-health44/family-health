// src/features/auth/screens/OnboardingScreen.tsx
// Onboarding screen — shown after first sign-in to create a family group.
// Thin UI wired to useOnboarding hook. No business logic.

import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { AuthScreenShell } from '../components/AuthScreenShell';
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
    <AuthScreenShell
      emoji="🏡"
      title="Welcome!"
      subtitle="Let's set up your family group."
      footer={
        <PressableBase
          onPress={async () => { await signOut(); router.replace('/(auth)/sign-in'); }}
          accessibilityRole="button"
          style={(pressed) => ({ alignItems: 'center', paddingVertical: 4, opacity: pressed ? 0.6 : 1 })}
        >
          <Text style={{ fontSize: 13, color: 'rgba(23,33,28,0.55)' }}>Sign out</Text>
        </PressableBase>
      }
    >
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
            <Text className="text-sm text-[#8F2E3B]">{error.message}</Text>
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
      </View>
    </AuthScreenShell>
  );
};
