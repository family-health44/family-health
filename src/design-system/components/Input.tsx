// src/design-system/components/Input.tsx
// Input primitive — used with React Hook Form via Controller.
// Supports ref forwarding for programmatic focus (e.g. modal auto-focus).
// Handles label, error state, helper text, and secure text entry.
// No business logic — purely presentational.

import { forwardRef } from 'react';
import { View, Text, TextInput, type TextInputProps } from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, helperText, isRequired = false, ...textInputProps }, ref) => {
    const hasError = Boolean(error);

    return (
      <View className="w-full gap-1.5">
        {/* Label */}
        <View className="flex-row">
          <Text className="text-sm font-medium text-[#3D3D3D]">{label}</Text>
          {isRequired && (
            <Text className="ml-0.5 text-sm text-[#B33A4A]">{' *'}</Text>
          )}
        </View>

        {/* Input field */}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          accessibilityHint={helperText}
          className={[
            'rounded-xl border px-4 text-base text-[#1A1A1A]',
            'bg-white',
            hasError
              ? 'border-[#B33A4A]'
              : 'border-[#C8C4BC] focus:border-[#1F5C41]',
          ].join(' ')}
          style={{ minHeight: 48, paddingTop: 12, paddingBottom: 12, fontSize: 16, lineHeight: 22 }}
          placeholderTextColor="#8B928E"
          autoCapitalize="none"
          autoCorrect={false}
          {...textInputProps}
        />

        {/* Error message */}
        {hasError && (
          <Text
            className="text-sm text-[#B33A4A]"
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            {error}
          </Text>
        )}

        {/* Helper text — only shown when no error */}
        {!hasError && helperText ? (
          <Text className="text-sm text-[#57605B]">{helperText}</Text>
        ) : null}
      </View>
    );
  },
);

Input.displayName = 'Input';
