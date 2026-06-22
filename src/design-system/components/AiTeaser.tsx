// src/design-system/components/AiTeaser.tsx
// Locked "Pro" AI teaser card (purple). No model call — a paid-tier hook only.
// Owns its own dismiss/reappear state via SecureStore so callers just pass content.
// Used by the medication detail + start-appointment screens.

import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { PressableBase } from './PressableBase';
import { secureStorageAdapter } from '@/core/auth/secureStorage';

const REAPPEAR_MS = 30 * 24 * 60 * 60 * 1000; // ~30 days

interface AiTeaserProps {
  storageKey: string; // SecureStore key for the per-teaser dismissal timestamp
  title: string;
  body: string;
}

export const AiTeaser = ({ storageKey, title, body }: AiTeaserProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const raw = await secureStorageAdapter.getItem(storageKey);
      const dismissedAt = raw ? Number(raw) : 0;
      const due = !dismissedAt || Date.now() - dismissedAt > REAPPEAR_MS;
      if (active) setShow(due);
    })();
    return () => { active = false; };
  }, [storageKey]);

  const dismiss = () => {
    setShow(false);
    void secureStorageAdapter.setItem(storageKey, String(Date.now()));
  };

  if (!show) return null;

  return (
    <View style={{ backgroundColor: '#F3F0FA', borderWidth: 1, borderColor: '#D8D0F0', borderRadius: 12, padding: 12, marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Text style={{ fontSize: 14, color: '#534AB7' }}>✦</Text>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#26215C', flex: 1 }}>{title}</Text>
        <View style={{ backgroundColor: '#CECBF6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: '#3C3489' }}>Pro</Text>
        </View>
        <PressableBase onPress={dismiss} hitSlop={10} style={(pressed) => ({ opacity: pressed ? 0.5 : 1, marginLeft: 4 })}>
          <Text style={{ fontSize: 16, color: '#7F77DD' }}>×</Text>
        </PressableBase>
      </View>
      <Text style={{ fontSize: 12, color: '#3C3489', lineHeight: 18 }}>{body}</Text>
    </View>
  );
};
