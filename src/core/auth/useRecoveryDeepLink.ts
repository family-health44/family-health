// src/core/auth/useRecoveryDeepLink.ts
// Catches password-recovery deep links (family-health://reset-password#access_token=...&refresh_token=...&type=recovery)
// and routes to the reset-password screen with tokens as query params.
// Supabase returns tokens in the URL fragment, which expo-router does not parse into
// params — so we parse the fragment manually here.

import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';

function parseFragment(url: string): Record<string, string> {
  const hashIndex = url.indexOf('#');
  if (hashIndex === -1) return {};
  const fragment = url.slice(hashIndex + 1);
  const out: Record<string, string> = {};
  for (const pair of fragment.split('&')) {
    const [k, v] = pair.split('=');
    if (k && v) out[decodeURIComponent(k)] = decodeURIComponent(v);
  }
  return out;
}

function handleUrl(url: string): void {
  if (!url.includes('reset-password')) return;
  const parts = parseFragment(url);
  if (parts['type'] === 'recovery' && parts['access_token'] && parts['refresh_token']) {
    router.replace({
      pathname: '/(auth)/reset-password',
      params: {
        access_token: parts['access_token'],
        refresh_token: parts['refresh_token'],
      },
    } as never);
  }
}

export function useRecoveryDeepLink(): void {
  useEffect(() => {
    // Cold start: app opened via the link.
    void Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });
    // Warm: app already running.
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, []);
}
