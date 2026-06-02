// src/design-system/components/Badge.tsx
// Badge primitive — small status/label chips.
// Used for medication status (active/inactive/completed), todo due dates, etc.
// Variants map to semantic meaning — not arbitrary colours.

import { View, Text } from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

type BadgeVariant =
  | 'success'   // active medications, completed items
  | 'warning'   // upcoming/due soon
  | 'danger'    // overdue, inactive
  | 'neutral'   // completed/archived
  | 'info';     // general info

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const containerStyles: Record<BadgeVariant, string> = {
  success: 'bg-[#E6F0EC] border border-[#C0D8CA]',
  warning: 'bg-[#F5EBE0] border border-[#DEBFAA]',
  danger: 'bg-[#F5E8EB] border border-[#E0BDC4]',
  neutral: 'bg-[#EEECE8] border border-[#D8D4CC]',
  info: 'bg-[#E8EFF8] border border-[#C0CFDF]',
};

const textStyles: Record<BadgeVariant, string> = {
  success: 'text-[#1A4D35]',
  warning: 'text-[#7A3A10]',
  danger: 'text-[#7A2030]',
  neutral: 'text-[#4A4744]',
  info: 'text-[#1A3A6B]',
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Badge = ({ label, variant = 'neutral' }: BadgeProps) => (
  <View
    className={`self-start rounded-full px-2.5 py-0.5 ${containerStyles[variant]}`}
    accessibilityRole="text"
  >
    <Text className={`text-xs font-medium ${textStyles[variant]}`}>
      {label}
    </Text>
  </View>
);
