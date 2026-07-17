// src/features/auth/screens/SignUpScreen.tsx
// Account creation. With "Confirm email" ON in Supabase, shows a post-signup
// "check your email" state instead of entering the app immediately.
import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Type, TextColour, Brand } from '@/design-system/tokens/typography';
import { AuthScreenShell } from '../components/AuthScreenShell';
import { Input } from '@/design-system/components/Input';
import { Button } from '@/design-system/components/Button';
import { useSignUp } from '../hooks/useSignUp';
import { signUpSchema } from '../types/auth.types';
import type { SignUpFormValues } from '../types/auth.types';

const ERROR_BG = '#F5E8EB';
const ERROR_TEXT = '#8F2E3B';

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
          <Text style={{ ...Type.body, color: TextColour.secondary, textAlign: 'center', lineHeight: 21 }}>
            We've sent a confirmation link to{'\n'}
            <Text style={{ fontWeight: '700', color: TextColour.ink }}>{confirmationEmail}</Text>.
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
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Text style={{ ...Type.body, color: TextColour.muted }}>Already have an account?</Text>
          <Pressable onPress={() => router.replace('/(auth)/sign-in')} accessibilityRole="link">
            <Text style={{ ...Type.body, fontWeight: '600', color: Brand.green }}>Sign in</Text>
          </Pressable>
        </View>
      }
    >
      <View style={{ gap: 20 }}>
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
          <View style={{ borderRadius: 12, backgroundColor: ERROR_BG, paddingHorizontal: 16, paddingVertical: 12 }} accessibilityRole="alert">
            <Text style={{ ...Type.body, color: ERROR_TEXT }}>{error.message}</Text>
          </View>
        ) : null}

        <Button label="Sign up" variant="primary" size="lg" isFullWidth
          isLoading={isLoading} onPress={handleSubmit((v) => signUp(v))} />
      </View>
    </AuthScreenShell>
  );
};
