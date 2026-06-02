// src/design-system/components/OfflineBanner.tsx
// Offline status banner — shown at the top of the app when offline or syncing.
// Mounts in the root layout so it appears across all screens.

import { useEffect } from 'react';
import { View, Text, Animated, useAnimatedValue } from 'react-native';

interface OfflineBannerProps {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
}

export const OfflineBanner = ({ isOnline, isSyncing, pendingCount }: OfflineBannerProps) => {
  const shouldShow = !isOnline || isSyncing;

  if (!shouldShow) return null;

  const getMessage = () => {
    if (isSyncing) {
      return pendingCount > 0
        ? `Syncing ${pendingCount} change${pendingCount > 1 ? 's' : ''}…`
        : 'Syncing…';
    }
    return pendingCount > 0
      ? `Offline · ${pendingCount} change${pendingCount > 1 ? 's' : ''} pending`
      : 'You are offline';
  };

  const bgColour = isSyncing ? '#2A6049' : '#7A3A10';

  return (
    <View
      style={{
        backgroundColor: bgColour,
        paddingVertical: 6,
        paddingHorizontal: 16,
        alignItems: 'center',
      }}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
        {getMessage()}
      </Text>
    </View>
  );
};
