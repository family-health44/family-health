// src/features/auth/screens/ForgotPasswordScreen.tsx
import { View, Text, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Type, TextColour } from '@/design-system/tokens/typography';
import { AuthScreenShell } from '../components/AuthScreenShell';
import { Input } from '@/design-system/components/Input';
import { Button } from '@/design-system/components/Button';
import { useForgotPassword } from '../hooks/useForgotPassword';
import { forgotPasswordSchema } from '../types/auth.types';
import type { ForgotPasswordFormValues } from '../types/auth.types';

const GREEN = '#1F5C41';
const SUCCESS_BG = '#E4EFE9';
const SUCCESS_TEXT = '#17452F';
const ERROR_BG = '#F5E8EB';
const ERROR_TEXT = '#8F2E3B';

export const ForgotPasswordScreen = () => {
  const { isLoading, error, isSent, submit, clearError } = useForgotPassword();
  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const title = (
    <Text style={{ fontSize: 34, fontWeight: '700', color: '#FFFFFF', lineHeight: 38, textAlign: 'center' }}>
      Reset password
    </Text>
  );

  return (
    <AuthScreenShell
      emoji="🔑"
      title={title}
      subtitle="We'll email you a link to set a new password"
      footer={
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Text style={{ ...Type.body, color: TextColour.muted }}>Remembered it?</Text>
          <Pressable onPress={() => router.replace('/(auth)/sign-in' as never)} accessibilityRole="link">
            <Text style={{ ...Type.body, fontWeight: '600', color: GREEN }}>Sign in</Text>
          </Pressable>
        </View>
      }
    >
      {isSent ? (
        <View style={{ gap: 20 }}>
          <View style={{ borderRadius: 12, backgroundColor: SUCCESS_BG, paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={{ ...Type.body, color: SUCCESS_TEXT, lineHeight: 21 }}>
              If an account exists for that email, a reset link is on its way. Check your inbox and follow the link to set a new password.
            </Text>
          </View>
          <Button label="Back to sign in" variant="primary" size="lg" isFullWidth
            onPress={() => router.replace('/(auth)/sign-in' as never)} />
        </View>
      ) : (
        <View style={{ gap: 20 }}>
          <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Email" isRequired keyboardType="email-address" textContentType="emailAddress"
              autoComplete="email" autoCapitalize="none" returnKeyType="done"
              onSubmitEditing={handleSubmit((v) => submit(v))}
              value={value}
              onChangeText={(text) => { onChange(text); if (error) clearError(); }}
              onBlur={onBlur} error={errors.email?.message} />
          )} />
          {error ? (
            <View style={{ borderRadius: 12, backgroundColor: ERROR_BG, paddingHorizontal: 16, paddingVertical: 12 }} accessibilityRole="alert">
              <Text style={{ ...Type.body, color: ERROR_TEXT }}>{error.message}</Text>
            </View>
          ) : null}
          <Button label="Send reset link" variant="primary" size="lg" isFullWidth
            isLoading={isLoading} onPress={handleSubmit((v) => submit(v))} />
        </View>
      )}
    </AuthScreenShell>
  );
};
