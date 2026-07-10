// src/core/auth/useRecoveryDeepLink.ts
// Catches password-recovery deep links (family-health://reset-password?code=...)
// and routes to the reset-password screen with the code as a query param.
// Supabase PKCE recovery returns a ?code= that must be exchanged for a session.

import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';

function parseCode(url: string): string | null {
  const q = url.indexOf('?');
  if (q === -1) return null;
  // Strip any fragment, then read query params.
  const afterQ = url.slice(q + 1);
  const query = afterQ.split('#')[0] ?? afterQ;
  for (const pair of query.split('&')) {
    const [k, v] = pair.split('=');
    if (k === 'code' && v) return decodeURIComponent(v);
  }
  return null;
}

function handleUrl(url: string): void {
  if (!url.includes('reset-password')) return;
  const code = parseCode(url);
  if (code) {
    router.replace({
      pathname: '/(auth)/reset-password',
      params: { code },
    } as never);
  }
}

export function useRecoveryDeepLink(): void {
  useEffect(() => {
    void Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, []);
}
