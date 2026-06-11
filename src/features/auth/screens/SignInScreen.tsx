// src/features/auth/screens/SignInScreen.tsx
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
  const { control, handleSubmit, formState: { errors } } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (error) clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScreenWrapper avoidKeyboard padded>
      <View style={{ alignItems: 'center', marginBottom: 40, marginTop: 32 }}>
        <Text style={{ fontSize: 56, marginBottom: 8 }}>🏥</Text>
        <Text style={{ fontFamily: Fonts.serif, fontSize: 44, fontWeight: '300', color: '#1C1917', lineHeight: 46 }}>
          Family
        </Text>
        <Text style={{ fontFamily: Fonts.serif, fontSize: 44, fontWeight: '300', color: '#2A6049', lineHeight: 46, marginTop: -4 }}>
          Health
        </Text>
        <Text style={{ fontSize: 13, color: '#A8A09A', marginTop: 10 }}>
          Your family's health, all in one place
        </Text>
      </View>

      <View className="gap-5">
        <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
          <Input label="Email" isRequired keyboardType="email-address" textContentType="emailAddress"
            autoComplete="email" autoCapitalize="none" returnKeyType="next" value={value}
            onChangeText={(text) => { onChange(text); if (error) clearError(); }}
            onBlur={onBlur} error={errors.email?.message} />
        )} />
        <Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => (
          <Input label="Password" isRequired secureTextEntry textContentType="password"
            autoComplete="password" returnKeyType="done"
            onSubmitEditing={handleSubmit((v) => signIn(v))}
            value={value} onChangeText={(text) => { onChange(text); if (error) clearError(); }}
            onBlur={onBlur} error={errors.password?.message} />
        )} />
        {error ? (
          <View className="rounded-xl border border-[#E0BDC4] bg-[#F5E8EB] px-4 py-3" accessibilityRole="alert">
            <Text className="text-sm text-[#7A2030]">{error.message}</Text>
          </View>
        ) : null}
        <Button label="Sign in" variant="primary" size="lg" isFullWidth
          isLoading={isLoading} onPress={handleSubmit((v) => signIn(v))} />
      </View>

      <View className="mt-8 flex-row items-center justify-center gap-1">
        <Text className="text-sm text-[#6B6866]">{"Don't have an account?"}</Text>
        <Pressable onPress={() => router.push('/(auth)/sign-up' as never)} accessibilityRole="link">
          <Text className="text-sm font-semibold text-[#2A6049]">Sign up</Text>
        </Pressable>
      </View>
    </ScreenWrapper>
  );
};
