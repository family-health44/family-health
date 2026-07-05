// src/features/auth/screens/SignUpScreen.tsx
// Account creation. With "Confirm email" ON in Supabase, shows a post-signup
// "check your email" state instead of entering the app immediately.
import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Fonts } from '@/design-system/tokens/fonts';
import { AuthScreenShell } from '../components/AuthScreenShell';
import { Input } from '@/design-system/components/Input';
import { Button } from '@/design-system/components/Button';
import { useSignUp } from '../hooks/useSignUp';
import { signUpSchema } from '../types/auth.types';
import type { SignUpFormValues } from '../types/auth.types';

export const SignUpScreen = () => {
  const { isLoading, error, needsConfirmation, confirmationEmail, signUp, clearError } = useSignUp();
  const { control, handleSubmit, formState: { errors } } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (error) clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Post-signup: check your email ───────────────────────────────────────────
  if (needsConfirmation) {
    return (
      <AuthScreenShell emoji="📧" title="Check your email">
        <View style={{ gap: 16 }}>
          <Text style={{ fontSize: 14, color: 'rgba(23,33,28,0.65)', textAlign: 'center', lineHeight: 21 }}>
            We've sent a confirmation link to{'\n'}
            <Text style={{ fontWeight: '700', color: '#1F5C41' }}>{confirmationEmail}</Text>.
            {'\n\n'}Tap the link to confirm your account, then sign in.
          </Text>
          <Button label="Back to sign in" variant="primary" size="lg" isFullWidth
            onPress={() => router.replace('/(auth)/sign-in')} />
        </View>
      </AuthScreenShell>
    );
  }

  // ─── Sign-up form ─────────────────────────────────────────────────────────────
  return (
    <AuthScreenShell
      emoji="🏡"
      title="Create your account"
      subtitle="If you've been invited to a family, sign up with the email you were invited with."
      footer={
        <View className="flex-row items-center justify-center gap-1">
          <Text className="text-sm text-[#57605B]">Already have an account?</Text>
          <Pressable onPress={() => router.replace('/(auth)/sign-in')} accessibilityRole="link">
            <Text className="text-sm font-semibold text-[#1F5C41]">Sign in</Text>
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
          <Input label="Password" isRequired secureTextEntry textContentType="newPassword"
            autoComplete="password-new" returnKeyType="next" value={value}
            onChangeText={(text) => { onChange(text); if (error) clearError(); }}
            onBlur={onBlur} error={errors.password?.message} />
        )} />
        <Controller control={control} name="confirmPassword" render={({ field: { onChange, onBlur, value } }) => (
          <Input label="Confirm password" isRequired secureTextEntry textContentType="newPassword"
            autoComplete="password-new" returnKeyType="done"
            onSubmitEditing={handleSubmit((v) => signUp(v))}
            value={value} onChangeText={(text) => { onChange(text); if (error) clearError(); }}
            onBlur={onBlur} error={errors.confirmPassword?.message} />
        )} />

        {error ? (
          <View className="rounded-xl border border-[#E0BDC4] bg-[#F5E8EB] px-4 py-3" accessibilityRole="alert">
            <Text className="text-sm text-[#8F2E3B]">{error.message}</Text>
          </View>
        ) : null}

        <Button label="Sign up" variant="primary" size="lg" isFullWidth
          isLoading={isLoading} onPress={handleSubmit((v) => signUp(v))} />
      </View>
    </AuthScreenShell>
  );
};
