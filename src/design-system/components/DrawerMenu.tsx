// src/design-system/components/DrawerMenu.tsx
// Slide-in hamburger menu — overlays from the left.
// Matches PWA design: app title, user email, menu items.
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

  // All hooks above — safe to return null here
  if (!visible) return null;

  const menuItems = [
    { key: 'settings', label: 'Settings', emoji: '⚙️', onPress: () => { onClose(); router.push('/(app)/settings' as never); } },
    { key: 'signout', label: 'Sign Out', emoji: '🚪', onPress: () => { onClose(); signOut(); }, danger: true },
  ];

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* Dark overlay */}
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.45)', opacity: fadeAnim }]}
      >
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} accessibilityLabel="Close menu" />
      </Animated.View>

      {/* Drawer panel */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }], paddingTop: insets.top + 16 }]}>
        {/* App title + email */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#E3DDD5', marginBottom: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: '300', fontFamily: Fonts.serif, color: '#1C1917', lineHeight: 32, marginBottom: 6 }}>
            Family Health
          </Text>
          {session?.user?.email ? (
            <Text style={{ fontSize: 13, color: '#A8A09A' }}>{session.user.email}</Text>
          ) : null}
        </View>

        {/* Menu items */}
        <View style={{ paddingHorizontal: 12 }}>
          {menuItems.map((item) => (
            <Pressable
              key={item.key}
              onPress={item.onPress}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingHorizontal: 12,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: pressed ? '#F0EDE8' : 'transparent',
              })}
            >
              <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
              <Text style={{ fontSize: 15, fontWeight: '500', color: item.danger ? '#9B3A4A' : '#1C1917' }}>
                {item.label}
              </Text>
            </Pressable>
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
    backgroundColor: '#F7F5F0',
    borderRightWidth: 1,
    borderRightColor: '#E3DDD5',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
});
