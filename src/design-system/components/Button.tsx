// src/design-system/components/Button.tsx
// Button primitive — the only button component used across the entire app.
// Variants: primary, secondary, ghost, danger. Sizes: sm, md, lg.
// Inline token styles (runtime-themable); no NativeWind classes.
import { ActivityIndicator, Pressable, Text, type PressableProps, type ViewStyle, type TextStyle } from 'react-native';
import { Type } from '@/design-system/tokens/typography';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isFullWidth?: boolean;
}

const GREEN = '#1F5C41';
const GREEN_PRESSED = '#17452F';
const GREEN_TINT = '#E4EFE9';
const RED = '#B33A4A';
const RED_PRESSED = '#8F2E3B';

const container = (variant: ButtonVariant, pressed: boolean): ViewStyle => {
  switch (variant) {
    case 'primary':   return { backgroundColor: pressed ? GREEN_PRESSED : GREEN };
    case 'secondary': return { backgroundColor: pressed ? GREEN_TINT : '#FFFFFF', borderWidth: 1, borderColor: '#BFD4C8' };
    case 'ghost':     return { backgroundColor: pressed ? GREEN_TINT : 'transparent' };
    case 'danger':    return { backgroundColor: pressed ? RED_PRESSED : RED };
  }
};

const textColour: Record<ButtonVariant, string> = {
  primary: '#FFFFFF',
  secondary: '#17452F',
  ghost: GREEN,
  danger: '#FFFFFF',
};

const sizeContainer: Record<ButtonSize, ViewStyle> = {
  sm: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  md: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  lg: { paddingHorizontal: 24, paddingVertical: 16, borderRadius: 12 },
};

const sizeText: Record<ButtonSize, TextStyle> = {
  sm: { ...Type.label },
  md: { ...Type.body, fontWeight: '600' },
  lg: { ...Type.heading },
};

const spinnerColours: Record<ButtonVariant, string> = {
  primary: '#FFFFFF', secondary: GREEN, ghost: GREEN, danger: '#FFFFFF',
};

export const Button = ({
  label, variant = 'primary', size = 'md', isLoading = false, isFullWidth = false, disabled, ...pressableProps
}: ButtonProps) => {
  const isDisabled = disabled === true || isLoading;
  console.warn('[BTN]', label, variant, JSON.stringify(container(variant, false)), JSON.stringify(Object.keys(pressableProps)));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      disabled={isDisabled}
      {...pressableProps}
      style={({ pressed }) => ([{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        ...sizeContainer[size],
        alignSelf: isFullWidth ? 'stretch' : 'flex-start',
        width: isFullWidth ? '100%' : undefined,
        opacity: isDisabled ? 0.5 : 1,
      }, container(variant, pressed)])}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={spinnerColours[variant]} accessibilityLabel="Loading" />
      ) : (
        <Text style={{ textAlign: 'center', color: textColour[variant], ...sizeText[size] }}>{label}</Text>
      )}
    </Pressable>
  );
};
