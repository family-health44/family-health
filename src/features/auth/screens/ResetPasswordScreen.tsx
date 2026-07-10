// src/features/auth/screens/ResetPasswordScreen.tsx
import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams } from 'expo-router';
import { Fonts } from '@/design-system/tokens/fonts';
import { AuthScreenShell } from '../components/AuthScreenShell';
import { Input } from '@/design-system/components/Input';
import { Button } from '@/design-system/components/Button';
import { useResetPassword } from '../hooks/useResetPassword';
import { resetPasswordSchema } from '../types/auth.types';
import type { ResetPasswordFormValues } from '../types/auth.types';

export const ResetPasswordScreen = () => {
  const params = useLocalSearchParams<{ code?: string }>();
  const { isLoading, error, sessionReady, hydrateSession, submit, clearError } = useResetPassword();

  const { control, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (params.code) void hydrateSession(params.code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const title = (
    <Text style={{ fontFamily: Fonts.serif, fontSize: 34, fontWeight: '700', color: '#FFFFFF', lineHeight: 38, textAlign: 'center' }}>
      New password
    </Text>
  );

  const missingCode = !params.code;

  return (
    <AuthScreenShell emoji="🔑" title={title} subtitle="Choose a new password for your account">
      {missingCode ? (
        <View className="rounded-xl border border-[#E0BDC4] bg-[#F5E8EB] px-4 py-3" accessibilityRole="alert">
          <Text className="text-sm text-[#8F2E3B]">
            This reset link is invalid or has expired. Please request a new one from the sign-in screen.
          </Text>
        </View>
      ) : (
        <View className="gap-5">
          <Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => (
            <Input label="New password" isRequired secureTextEntry textContentType="newPassword"
              autoComplete="password-new" returnKeyType="next"
              value={value}
              onChangeText={(text) => { onChange(text); if (error) clearError(); }}
              onBlur={onBlur} error={errors.password?.message} />
          )} />
          <Controller control={control} name="confirmPassword" render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Confirm new password" isRequired secureTextEntry textContentType="newPassword"
              autoComplete="password-new" returnKeyType="done"
              onSubmitEditing={handleSubmit((v) => submit(v))}
              value={value}
              onChangeText={(text) => { onChange(text); if (error) clearError(); }}
              onBlur={onBlur} error={errors.confirmPassword?.message} />
          )} />
          {error ? (
            <View className="rounded-xl border border-[#E0BDC4] bg-[#F5E8EB] px-4 py-3" accessibilityRole="alert">
              <Text className="text-sm text-[#8F2E3B]">{error.message}</Text>
            </View>
          ) : null}
          <Button label="Update password" variant="primary" size="lg" isFullWidth
            isLoading={isLoading || (!sessionReady && !error)}
            onPress={handleSubmit((v) => submit(v))} />
        </View>
      )}
    </AuthScreenShell>
  );
};
