// src/features/auth/components/AuthScreenShell.tsx
// G2 shared shell for pre-login screens (Sign in / Sign up / Onboarding).
// Renders the G Colour Block identity WITHOUT the in-app nav chrome:
//   - green curved band at the top holding an emoji + serif heading + optional subtitle
//   - a floating white card below that holds the form
// Auth screens are pre-login, so a broken shell locks everyone out — this file is the
// single highest-stakes surface in G2. Keep the band compact so short devices don't
// squeeze under the keyboard.
import type { ReactNode } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '@/design-system/theme/ThemeProvider';
import { Fonts } from '@/design-system/tokens/fonts';

interface AuthScreenShellProps {
  emoji: string;
  title: ReactNode;       // string, or stacked <Text> lines (e.g. Family / Health)
  subtitle?: string;
  children: ReactNode;    // the form / actions, rendered inside the floating card
  footer?: ReactNode;     // e.g. "Don't have an account? Sign up" — sits under the card
}

export const AuthScreenShell = ({ emoji, title, subtitle, children, footer }: AuthScreenShellProps) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  return (
    <View style={{ flex: 1, backgroundColor: t.colours.headerBg }}>
      {isFocused ? <StatusBar style="light" /> : null}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Green identity band — paints to the physical top edge; content padded by the inset */}
          <View
            style={{
              backgroundColor: t.colours.headerBg,
              paddingHorizontal: 28,
              paddingTop: insets.top + 24,
              paddingBottom: 30,
              borderBottomLeftRadius: t.radius.header,
              borderBottomRightRadius: t.radius.header,
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 48, marginBottom: 8 }}>{emoji}</Text>
              {typeof title === 'string' ? (
                <Text style={{ fontFamily: Fonts.serif, fontSize: 32, fontWeight: '700', color: t.colours.headerText, textAlign: 'center', lineHeight: 36 }}>
                  {title}
                </Text>
              ) : (
                title
              )}
              {subtitle ? (
                <Text style={{ fontSize: 13, color: t.colours.headerTextSub, marginTop: 10, textAlign: 'center', lineHeight: 20 }}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Cream region below the band — the floating form card sits over it */}
          <View style={{ flexGrow: 1, backgroundColor: t.colours.background, paddingHorizontal: 20, paddingTop: 18 }}>
            <View
              style={{
                marginTop: -36,
                backgroundColor: t.colours.surface,
                borderRadius: 20,
                padding: 20,
                shadowColor: '#17211C',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              {children}
            </View>
            {footer ? <View style={{ marginTop: 20, marginBottom: 24 }}>{footer}</View> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
