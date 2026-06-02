// src/features/settings/screens/SettingsScreen.tsx
// Settings screen — family display name (local only) and sign out.
// Dark mode listed as coming soon per project spec.

import { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { ScreenWrapper } from '@/design-system/components/ScreenWrapper';
import { Input } from '@/design-system/components/Input';
import { Button } from '@/design-system/components/Button';
import { useAuth } from '@/core/auth/useAuth';
import { useSettings } from '../hooks/useSettings';

const schema = z.object({
  familyDisplayName: z.string().max(50, 'Must be under 50 characters'),
});

type FormValues = z.infer<typeof schema>;

export const SettingsScreen = () => {
  const { signOut } = useAuth();
  const { settings, updateFamilyDisplayName } = useSettings();
  const [isSaved, setIsSaved] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const { control, handleSubmit, formState: { errors, isDirty } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: { familyDisplayName: settings.familyDisplayName },
    });

  const onSave = (values: FormValues) => {
    updateFamilyDisplayName(values.familyDisplayName);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            setIsSigningOut(true);
            await signOut();
          },
        },
      ],
    );
  };

  return (
    <ScreenWrapper avoidKeyboard padded scrollable>
      {/* Header */}
      <View style={{ marginBottom: 32, marginTop: 8 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#1A1A1A' }}>
          Settings
        </Text>
      </View>

      {/* Family display section */}
      <View style={{ marginBottom: 32 }}>
        <Text style={{
          fontSize: 13, fontWeight: '600', color: '#6B6866',
          textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14,
        }}>
          Family
        </Text>

        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#E8E4DC',
          padding: 16,
          gap: 16,
        }}>
          <Controller
            control={control}
            name="familyDisplayName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Display name"
                placeholder="e.g. The Smith Family"
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSave)}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.familyDisplayName?.message}
                helperText="Shown on the family home screen. Stored on this device only."
              />
            )}
          />

          <Button
            label={isSaved ? '✓ Saved' : 'Save'}
            variant={isSaved ? 'secondary' : 'primary'}
            isFullWidth
            disabled={!isDirty && !isSaved}
            onPress={handleSubmit(onSave)}
          />
        </View>
      </View>

      {/* Appearance section */}
      <View style={{ marginBottom: 32 }}>
        <Text style={{
          fontSize: 13, fontWeight: '600', color: '#6B6866',
          textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14,
        }}>
          Appearance
        </Text>

        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#E8E4DC',
          overflow: 'hidden',
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            justifyContent: 'space-between',
          }}>
            <View>
              <Text style={{ fontSize: 15, fontWeight: '500', color: '#1A1A1A' }}>
                Dark mode
              </Text>
              <Text style={{ fontSize: 13, color: '#6B6866', marginTop: 2 }}>
                Coming soon
              </Text>
            </View>
            <View style={{
              backgroundColor: '#EEECE8',
              borderRadius: 12,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}>
              <Text style={{ fontSize: 12, color: '#6B6866', fontWeight: '500' }}>
                Soon
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Account section */}
      <View style={{ marginBottom: 32 }}>
        <Text style={{
          fontSize: 13, fontWeight: '600', color: '#6B6866',
          textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14,
        }}>
          Account
        </Text>

        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#E8E4DC',
          overflow: 'hidden',
        }}>
          <Pressable
            onPress={handleSignOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            style={({ pressed }) => ({
              padding: 16,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text style={{ fontSize: 15, fontWeight: '500', color: '#9B3A4A' }}>
              {isSigningOut ? 'Signing out…' : 'Sign out'}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};
