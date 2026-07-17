// src/design-system/components/DrawerMenu.tsx
// Slide-in hamburger menu — overlays from the left.
// Matches PWA design: app title, user email, menu items.
import { PressableBase } from '@/design-system/components/PressableBase';
import { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, Dimensions, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/core/auth/useAuth';
import { Fonts } from '@/design-system/tokens/fonts';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.78;

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
}

export const DrawerMenu = ({ visible, onClose }: DrawerMenuProps) => {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { session, signOut } = useAuth();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: -DRAWER_WIDTH, useNativeDriver: true, tension: 65, friction: 11 }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);


  const menuItems = [
    { key: 'settings', label: 'Settings', emoji: '⚙️', onPress: () => { onClose(); router.push('/(app)/settings' as never); } },
    { key: 'signout', label: 'Sign Out', emoji: '🚪', onPress: async () => { onClose(); await signOut(); router.replace('/(auth)/sign-in'); }, danger: true },
  ];

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents={visible ? 'box-none' : 'none'}>
      {/* Dark overlay */}
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.45)', opacity: fadeAnim }]}
      >
        <PressableBase style={StyleSheet.absoluteFillObject} onPress={onClose} accessibilityLabel="Close menu"></PressableBase>
      </Animated.View>

      {/* Drawer panel */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }], paddingTop: insets.top + 16 }]}>
        {/* App title + email */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#E3E2DB', marginBottom: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: '300', fontFamily: Fonts.serif, color: '#17211C', lineHeight: 32, marginBottom: 6 }}>
            FamFiles
          </Text>
          {session?.user?.email ? (
            <Text numberOfLines={1} style={{ fontSize: 13, color: 'rgba(23,33,28,0.55)' }}>{session.user.email}</Text>
          ) : null}
        </View>

        {/* Menu items */}
        <View style={{ paddingHorizontal: 12 }}>
          {menuItems.map((item) => (
            <PressableBase
              key={item.key}
              onPress={item.onPress}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              style={(pressed) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingHorizontal: 12,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: pressed ? '#F0EFEA' : 'transparent',
              })}
            >
              <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
              <Text numberOfLines={1} adjustsFontSizeToFit style={{ flexShrink: 1, fontSize: 15, fontWeight: '500', color: item.danger ? '#B33A4A' : '#17211C' }}>
                {item.label}
              </Text>
            </PressableBase>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#F7F7F4',
    borderRightWidth: 1,
    borderRightColor: '#E3E2DB',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
});
