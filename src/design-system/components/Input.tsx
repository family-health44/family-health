// src/design-system/components/Input.tsx
// Input primitive — used with React Hook Form via Controller.
// Ref forwarding preserved. Token styles; focus border via state.
import { forwardRef, useState } from 'react';
import { View, Text, TextInput, type TextInputProps } from 'react-native';
import { Type, TextColour } from '@/design-system/tokens/typography';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
}

const GREEN = '#1F5C41';
const RED = '#B33A4A';
const BORDER = '#C8C4BC';

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, helperText, isRequired = false, onFocus, onBlur, ...textInputProps }, ref) => {
    const hasError = Boolean(error);
    const [focused, setFocused] = useState(false);
    const borderColor = hasError ? RED : focused ? GREEN : BORDER;

    return (
      <View style={{ width: '100%', gap: 6 }}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ ...Type.label, color: TextColour.secondary }}>{label}</Text>
          {isRequired && <Text style={{ ...Type.label, color: RED, marginLeft: 2 }}>{' *'}</Text>}
        </View>

        <TextInput
          ref={ref}
          accessibilityLabel={label}
          accessibilityHint={helperText}
          style={{
            borderRadius: 12, borderWidth: 1, borderColor,
            paddingHorizontal: 16, backgroundColor: '#FFFFFF',
            color: TextColour.ink,
            minHeight: 48, paddingTop: 12, paddingBottom: 12, fontSize: 16, lineHeight: 22,
          }}
          placeholderTextColor="#8B928E"
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          {...textInputProps}
        />

        {hasError && (
          <Text style={{ ...Type.caption, fontWeight: '400', color: RED }} accessibilityRole="alert" accessibilityLiveRegion="polite">
            {error}
          </Text>
        )}
        {!hasError && helperText ? (
          <Text style={{ ...Type.caption, fontWeight: '400', color: TextColour.muted }}>{helperText}</Text>
        ) : null}
      </View>
    );
  },
);

Input.displayName = 'Input';
