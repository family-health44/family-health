// src/features/auth/screens/SignInScreen.tsx
// Sign-in screen — thin UI wired to useSignIn hook.
// React Hook Form + Zod for validation. No business logic here.
// Approx 80 lines of JSX — within the screen size limit.

import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Fonts } from '@/design-system/tokens/fonts';

import { ScreenWrapper } from '@/design-system/components/ScreenWrapper';
import { Input } from '@/design-system/components/Input';
import { Button } from '@/design-system/components/Button';
import { useSignIn } from '../hooks/useSignIn';
import { signInSchema } from '../types/auth.types';

import type { SignInFormValues } from '../types/auth.types';

export const SignInScreen = () => {
  const { isLoading, error, signIn, clearError } = useSignIn();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  // Clear server-side error when user starts typing again
  useEffect(() => {
    if (error) clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (values: SignInFormValues) => {
    signIn(values);
  };

  return (
    <ScreenWrapper avoidKeyboard padded>
      {/* Header */}
      <View className="mb-10 mt-8">
        <Text style={{ fontFamily: Fonts.serif, fontSize: 34, fontWeight: '300', color: '#1C1917', lineHeight: 38 }}>
          Family Health ✓
        </Text>
        <Text className="mt-2 text-base text-[#6B6866]">
          Sign in to your account
        </Text>
      </View>

      {/* Form */}
      <View className="gap-5">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              isRequired
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              autoCapitalize="none"
              returnKeyType="next"
              value={value}
              onChangeText={(text) => {
                onChange(text);
                if (error) clearError();
              }}
              onBlur={onBlur}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Password"
              isRequired
              secureTextEntry
              textContentType="password"
              autoComplete="password"
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onSubmit)}
              value={value}
              onChangeText={(text) => {
                onChange(text);
                if (error) clearError();
              }}
              onBlur={onBlur}
              error={errors.password?.message}
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
          label="Sign in"
          variant="primary"
          size="lg"
          isFullWidth
          isLoading={isLoading}
          onPress={handleSubmit(onSubmit)}
        />
      </View>

      {/* Onboarding link */}
      <View className="mt-8 flex-row items-center justify-center gap-1">
        <Text className="text-sm text-[#6B6866]">
          {"Don't have a family group yet?"}
        </Text>
        <Pressable
          onPress={() => router.push('/(auth)/onboarding')}
          accessibilityRole="link"
          accessibilityLabel="Go to onboarding"
        >
          <Text className="text-sm font-semibold text-[#2A6049]">
            Get started
          </Text>
        </Pressable>
      </View>
    </ScreenWrapper>
  );
};
