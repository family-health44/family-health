// src/features/auth/screens/SignUpScreen.tsx
// Account creation. With "Confirm email" ON in Supabase, shows a post-signup
// "check your email" state instead of entering the app immediately.
import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Fonts } from '@/design-system/tokens/fonts';
import { ScreenWrapper } from '@/design-system/components/ScreenWrapper';
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
      <ScreenWrapper padded>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <Text style={{ fontSize: 44 }}>📧</Text>
          <Text style={{ fontFamily: Fonts.serif, fontSize: 26, fontWeight: '300', color: '#1C1917', textAlign: 'center' }}>
            Check your email
          </Text>
          <Text style={{ fontSize: 14, color: '#6B6460', textAlign: 'center', lineHeight: 21 }}>
            We've sent a confirmation link to{'\n'}
            <Text style={{ fontWeight: '700', color: '#2A6049' }}>{confirmationEmail}</Text>.
            {'\n\n'}Tap the link to confirm your account, then sign in.
          </Text>
          <Button label="Back to sign in" variant="primary" size="lg" isFullWidth
            onPress={() => router.replace('/(auth)/sign-in')} />
        </View>
      </ScreenWrapper>
    );
  }

  // ─── Sign-up form ─────────────────────────────────────────────────────────────
  return (
    <ScreenWrapper avoidKeyboard padded>
      <View style={{ alignItems: 'center', marginBottom: 32, marginTop: 32 }}>
        <Text style={{ fontSize: 44, marginBottom: 8 }}>🏡</Text>
        <Text style={{ fontFamily: Fonts.serif, fontSize: 28, fontWeight: '300', color: '#1C1917' }}>
          Create your account
        </Text>
        <Text style={{ fontSize: 13, color: '#A8A09A', marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
          {"If you've been invited to a family, sign up with the email you were invited with."}
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
            <Text className="text-sm text-[#7A2030]">{error.message}</Text>
          </View>
        ) : null}

        <Button label="Sign up" variant="primary" size="lg" isFullWidth
          isLoading={isLoading} onPress={handleSubmit((v) => signUp(v))} />
      </View>

      <View className="mt-8 flex-row items-center justify-center gap-1">
        <Text className="text-sm text-[#6B6866]">Already have an account?</Text>
        <Pressable onPress={() => router.replace('/(auth)/sign-in')} accessibilityRole="link">
          <Text className="text-sm font-semibold text-[#2A6049]">Sign in</Text>
        </Pressable>
      </View>
    </ScreenWrapper>
  );
};
