// src/design-system/components/ScreenHeader.tsx
// G2 curved colour-block header. Used by all top-level tab screens.
// - Green block curves into the page (borderBottom radius from theme)
// - Serif white title, optional subtitle, optional right slot
// - children render inside the block (e.g. Visits segmented control)
// - bgColour overrides the block colour (person-colour detail headers)
import type { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/design-system/theme/ThemeProvider';
import { Fonts } from '@/design-system/tokens/fonts';
import { Type } from '@/design-system/tokens/typography';
import { HamburgerButton } from './HamburgerButton';
import { useDrawer } from './DrawerContext';

interface ScreenHeaderProps {
  title: string;
  /** Multiplier on the display title size (1 = default). */
  titleScale?: number;
  subtitle?: string;
  right?: ReactNode;
  children?: ReactNode;
  bgColour?: string;
}

export const ScreenHeader = ({ title, subtitle, right, children, bgColour, titleScale = 1 }: ScreenHeaderProps) => {
  const insets = useSafeAreaInsets();
  const t = useTheme();
  const { openDrawer } = useDrawer();
  const isFocused = useIsFocused();
  return (
    <View
      onLayout={(e) => console.warn('[HDR]', title, 'h=' + e.nativeEvent.layout.height)}
      style={{
        backgroundColor: bgColour ?? t.colours.headerBg,
        paddingTop: insets.top + 6,
        paddingHorizontal: 16,
        paddingBottom: 14,
        borderBottomLeftRadius: t.radius.header,
        borderBottomRightRadius: t.radius.header,
      }}
    >
      {isFocused ? <StatusBar style="light" /> : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <HamburgerButton onPress={openDrawer} variant="onColour" />
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Text style={{ fontFamily: Fonts.serif, ...Type.display, fontSize: Type.display.fontSize * titleScale, lineHeight: 34 * titleScale, color: t.colours.headerText }}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={{ ...Type.caption, color: t.colours.headerTextSub }}>{subtitle}</Text>
          ) : null}
        </View>
        {right}
      </View>
      {children ?? <View style={{ height: 33, marginTop: 12 }} />}
    </View>
  );
};
