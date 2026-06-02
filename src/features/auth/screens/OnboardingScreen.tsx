// src/features/auth/screens/OnboardingScreen.tsx
// Onboarding screen — shown after first sign-in to create a family group.
// Thin UI wired to useOnboarding hook. No business logic.

import { View, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { ScreenWrapper } from '@/design-system/components/ScreenWrapper';
import { Input } from '@/design-system/components/Input';
import { Button } from '@/design-system/components/Button';
import { useOnboarding } from '../hooks/useOnboarding';
import { onboardingSchema } from '../types/auth.types';

import type { OnboardingFormValues } from '../types/auth.types';

export const OnboardingScreen = () => {
  const { isLoading, error, createFamily, clearError } = useOnboarding();

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
      <View className="mb-10 mt-8">
        <Text className="text-3xl font-bold text-[#1A1A1A]">
          Welcome
        </Text>
        <Text className="mt-2 text-base text-[#6B6866]">
          {"Let's set up your family health record. What would you like to call your family?"}
        </Text>
      </View>

      {/* Form */}
      <View className="gap-5">
        <Controller
          control={control}
          name="familyGroupName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Family name"
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
              helperText="You can change this later in Settings."
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
          label="Create family"
          variant="primary"
          size="lg"
          isFullWidth
          isLoading={isLoading}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </ScreenWrapper>
  );
};
