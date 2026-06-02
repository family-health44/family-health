// src/design-system/components/ScreenWrapper.tsx
// ScreenWrapper — applies the app background colour and safe area insets
// to every screen. All screens should use this as their root container.
// Handles keyboard avoiding view and scroll behaviour.

import { View, ScrollView, KeyboardAvoidingView, Platform, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
  // Set to true for screens with forms — avoids keyboard covering inputs
  avoidKeyboard?: boolean;
  // Set to true for screens with scrollable content
  scrollable?: boolean;
  // Padding applied to the inner content container
  padded?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ScreenWrapper = ({
  children,
  avoidKeyboard = false,
  scrollable = false,
  padded = true,
  ...viewProps
}: ScreenWrapperProps) => {
  const contentClass = padded ? 'flex-1 px-4 py-4' : 'flex-1';

  const inner = scrollable ? (
    <ScrollView
      className={contentClass}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View className={contentClass} {...viewProps}>
      {children}
    </View>
  );

  if (avoidKeyboard) {
    return (
      <SafeAreaView className="flex-1 bg-[#F7F5F0]">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {inner}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F7F5F0]">
      {inner}
    </SafeAreaView>
  );
};
