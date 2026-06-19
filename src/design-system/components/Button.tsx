// src/design-system/components/Button.tsx
// Button primitive — the only button component used across the entire app.
// Variants: primary, secondary, ghost, danger.
// Sizes: sm, md, lg.
// Handles loading and disabled states consistently.
// No business logic — purely presentational.

import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isFullWidth?: boolean;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const containerStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[#2A6049] active:bg-[#1A4D35]',
  secondary: 'bg-white border border-[#C0D8CA] active:bg-[#E6F0EC]',
  ghost: 'bg-transparent active:bg-[#E6F0EC]',
  danger: 'bg-[#9B3A4A] active:bg-[#7A2030]',
};

const textStyles: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-[#1A4D35]',
  ghost: 'text-[#2A6049]',
  danger: 'text-white',
};

const sizeContainerStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 rounded-lg',
  md: 'px-5 py-3 rounded-xl',
  lg: 'px-6 py-4 rounded-xl',
};

const sizeTextStyles: Record<ButtonSize, string> = {
  sm: 'text-sm font-medium',
  md: 'text-base font-semibold',
  lg: 'text-lg font-semibold',
};

const spinnerColours: Record<ButtonVariant, string> = {
  primary: '#FFFFFF',
  secondary: '#2A6049',
  ghost: '#2A6049',
  danger: '#FFFFFF',
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Button = ({
  label,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isFullWidth = false,
  disabled,
  ...pressableProps
}: ButtonProps) => {
  const isDisabled = disabled === true || isLoading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      disabled={isDisabled}
      className={[
        'flex-row items-center justify-center',
        containerStyles[variant],
        sizeContainerStyles[size],
        isFullWidth ? 'w-full' : 'self-start',
        isDisabled ? 'opacity-50' : 'opacity-100',
      ].join(' ')}
      {...pressableProps}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={spinnerColours[variant]}
          accessibilityLabel="Loading"
        />
      ) : (
        <Text
          className={[
            'text-center',
            textStyles[variant],
            sizeTextStyles[size],
          ].join(' ')}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
};
