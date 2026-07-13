// src/features/auth/screens/SignInScreen.tsx
import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Type, TextColour } from '@/design-system/tokens/typography';
import { AuthScreenShell } from '../components/AuthScreenShell';
import { Input } from '@/design-system/components/Input';
import { Button } from '@/design-system/components/Button';
import { useSignIn } from '../hooks/useSignIn';
import { signInSchema } from '../types/auth.types';
import type { SignInFormValues } from '../types/auth.types';

const GREEN = '#1F5C41';
const ERROR_BG = '#F5E8EB';
const ERROR_TEXT = '#8F2E3B';

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
    <Text style={{ fontSize: 40, fontWeight: '700', color: '#FFFFFF', lineHeight: 42, textAlign: 'center' }}>
      FamFiles
    </Text>
  );

  return (
    <AuthScreenShell
      emoji="📁"
      title={title}
      subtitle="Your family's records, all in one place"
      footer={
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Text style={{ ...Type.body, color: TextColour.muted }}>{"Don't have an account?"}</Text>
          <Pressable onPress={() => router.push('/(auth)/sign-up' as never)} accessibilityRole="link">
            <Text style={{ ...Type.body, fontWeight: '600', color: GREEN }}>Sign up</Text>
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
          <Input label="Password" isRequired secureTextEntry textContentType="password"
            autoComplete="password" returnKeyType="done"
            onSubmitEditing={handleSubmit((v) => signIn(v))}
            value={value} onChangeText={(text) => { onChange(text); if (error) clearError(); }}
            onBlur={onBlur} error={errors.password?.message} />
        )} />
        <Pressable onPress={() => router.push('/(auth)/forgot-password' as never)} accessibilityRole="link" style={{ alignSelf: 'flex-end', marginTop: -8 }}>
          <Text style={{ ...Type.label, color: TextColour.secondary }}>Forgot password?</Text>
        </Pressable>
        {error ? (
          <View style={{ borderRadius: 12, backgroundColor: ERROR_BG, paddingHorizontal: 16, paddingVertical: 12 }} accessibilityRole="alert">
            <Text style={{ ...Type.body, color: ERROR_TEXT }}>{error.message}</Text>
          </View>
        ) : null}
        <Button label="Sign in" variant="primary" size="lg" isFullWidth
          isLoading={isLoading} onPress={handleSubmit((v) => signIn(v))} />
      </View>
    </AuthScreenShell>
  );
};
