// src/features/auth/screens/ForgotPasswordScreen.tsx
import { View, Text, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Fonts } from '@/design-system/tokens/fonts';
import { AuthScreenShell } from '../components/AuthScreenShell';
import { Input } from '@/design-system/components/Input';
import { Button } from '@/design-system/components/Button';
import { useForgotPassword } from '../hooks/useForgotPassword';
import { forgotPasswordSchema } from '../types/auth.types';
import type { ForgotPasswordFormValues } from '../types/auth.types';

export const ForgotPasswordScreen = () => {
  const { isLoading, error, isSent, submit, clearError } = useForgotPassword();
  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const title = (
    <Text style={{ fontFamily: Fonts.serif, fontSize: 34, fontWeight: '700', color: '#FFFFFF', lineHeight: 38, textAlign: 'center' }}>
      Reset password
    </Text>
  );

  return (
    <AuthScreenShell
      emoji="🔑"
      title={title}
      subtitle="We'll email you a link to set a new password"
      footer={
        <View className="flex-row items-center justify-center gap-1">
          <Text className="text-sm text-[#57605B]">Remembered it?</Text>
          <Pressable onPress={() => router.replace('/(auth)/sign-in' as never)} accessibilityRole="link">
            <Text className="text-sm font-semibold text-[#1F5C41]">Sign in</Text>
          </Pressable>
        </View>
      }
    >
      {isSent ? (
        <View className="gap-5">
          <View className="rounded-xl border border-[#BFD4C8] bg-[#E4EFE9] px-4 py-3">
            <Text className="text-sm text-[#17452F]">
              If an account exists for that email, a reset link is on its way. Check your inbox and follow the link to set a new password.
            </Text>
          </View>
          <Button label="Back to sign in" variant="primary" size="lg" isFullWidth
            onPress={() => router.replace('/(auth)/sign-in' as never)} />
        </View>
      ) : (
        <View className="gap-5">
          <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Email" isRequired keyboardType="email-address" textContentType="emailAddress"
              autoComplete="email" autoCapitalize="none" returnKeyType="done"
              onSubmitEditing={handleSubmit((v) => submit(v))}
              value={value}
              onChangeText={(text) => { onChange(text); if (error) clearError(); }}
              onBlur={onBlur} error={errors.email?.message} />
          )} />
          {error ? (
            <View className="rounded-xl border border-[#E0BDC4] bg-[#F5E8EB] px-4 py-3" accessibilityRole="alert">
              <Text className="text-sm text-[#8F2E3B]">{error.message}</Text>
            </View>
          ) : null}
          <Button label="Send reset link" variant="primary" size="lg" isFullWidth
            isLoading={isLoading} onPress={handleSubmit((v) => submit(v))} />
        </View>
      )}
    </AuthScreenShell>
  );
};
