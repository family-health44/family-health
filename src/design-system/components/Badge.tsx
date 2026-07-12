// src/design-system/components/Badge.tsx
// Badge primitive — small status/label chips. Semantic variants, token styles.
import { View, Text } from 'react-native';
import { Type } from '@/design-system/tokens/typography';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const tones: Record<BadgeVariant, { bg: string; border: string; text: string }> = {
  success: { bg: '#E4EFE9', border: '#BFD4C8', text: '#17452F' },
  warning: { bg: '#F5EBE0', border: '#DEBFAA', text: '#7A3A10' },
  danger:  { bg: '#F5E8EB', border: '#E0BDC4', text: '#8F2E3B' },
  neutral: { bg: '#EEECE8', border: '#D8D4CC', text: '#4A4744' },
  info:    { bg: '#E8EFF8', border: '#C0CFDF', text: '#1A3A6B' },
};

export const Badge = ({ label, variant = 'neutral' }: BadgeProps) => {
  const t = tones[variant];
  return (
    <View
      accessibilityRole="text"
      style={{ alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2, backgroundColor: t.bg, borderWidth: 1, borderColor: t.border }}
    >
      <Text style={{ ...Type.caption, color: t.text }}>{label}</Text>
    </View>
  );
};
