// src/features/auth/screens/SignInScreen.tsx
import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Fonts } from '@/design-system/tokens/fonts';
import { AuthScreenShell } from '../components/AuthScreenShell';
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

  const title = (
    <Text style={{ fontFamily: Fonts.serif, fontSize: 40, fontWeight: '700', color: '#FFFFFF', lineHeight: 42, textAlign: 'center' }}>
      FamFiles
    </Text>
  );

  return (
    <AuthScreenShell
      emoji="📁"
      title={title}
      subtitle="Your family's records, all in one place"
      footer={
        <View className="flex-row items-center justify-center gap-1">
          <Text className="text-sm text-[#57605B]">{"Don't have an account?"}</Text>
          <Pressable onPress={() => router.push('/(auth)/sign-up' as never)} accessibilityRole="link">
            <Text className="text-sm font-semibold text-[#1F5C41]">Sign up</Text>
          </Pressable>
        </View>
      }
    >
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
        <Pressable onPress={() => router.push('/(auth)/forgot-password' as never)} accessibilityRole="link" className="self-end -mt-2">
          <Text className="text-sm font-semibold text-[#1F5C41]">Forgot password?</Text>
        </Pressable>
        {error ? (
          <View className="rounded-xl border border-[#E0BDC4] bg-[#F5E8EB] px-4 py-3" accessibilityRole="alert">
            <Text className="text-sm text-[#8F2E3B]">{error.message}</Text>
          </View>
        ) : null}
        <Button label="Sign in" variant="primary" size="lg" isFullWidth
          isLoading={isLoading} onPress={handleSubmit((v) => signIn(v))} />
      </View>
    </AuthScreenShell>
  );
};
