// src/design-system/components/SubScreenHeader.tsx
// G2 curved colour-block header for pushed sub-screens (Back instead of hamburger).
// Defaults to brand green; bgColour overrides (e.g. person colour).
import type { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/design-system/theme/ThemeProvider';
import { Fonts } from '@/design-system/tokens/fonts';
import { Type } from '@/design-system/tokens/typography';
import { PressableBase } from './PressableBase';
import { Icon } from '@/design-system/components/Icon';

interface SubScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children?: ReactNode;
  bgColour?: string;
  onBack?: () => void;
}

export const SubScreenHeader = ({ title, subtitle, right, children, bgColour, onBack }: SubScreenHeaderProps) => {
  const insets = useSafeAreaInsets();
  const t = useTheme();
  const isFocused = useIsFocused();
  return (
    <View
      style={{
        backgroundColor: bgColour ?? t.colours.headerBg,
        paddingTop: insets.top + 4,
        paddingHorizontal: 16,
        paddingBottom: children ? 12 : 16,
        borderBottomLeftRadius: t.radius.header,
        borderBottomRightRadius: t.radius.header,
      }}
    >
      {isFocused ? <StatusBar style="light" /> : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
        <PressableBase
          onPress={onBack ?? (() => router.back())}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={(pressed) => ({ opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 })}
        >
          <Icon name="chevron.left" size={16} color="#FFFFFF" />
          <Text style={{ ...Type.caption, fontWeight: '500', color: '#FFFFFF' }}>Back</Text>
        </PressableBase>
        {right}
      </View>
      <Text style={{ ...Type.title, fontFamily: Fonts.serif, color: t.colours.headerText, lineHeight: 30 }}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ ...Type.caption, color: t.colours.headerTextSub, marginTop: 2 }}>{subtitle}</Text>
      ) : null}
      {children}
    </View>
  );
};
