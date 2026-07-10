// src/core/auth/useRecoveryDeepLink.ts
// Catches password-recovery deep links
// (famfiles://reset-password?token_hash=...&type=recovery)
// and routes to the reset-password screen with the token_hash as a query param.
// Uses verifyOtp (token_hash) — no PKCE code verifier required on native.

import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';

function parseParam(url: string, key: string): string | null {
  const q = url.indexOf('?');
  if (q === -1) return null;
  const afterQ = url.slice(q + 1);
  const query = afterQ.split('#')[0] ?? afterQ;
  for (const pair of query.split('&')) {
    const [k, v] = pair.split('=');
    if (k === key && v) return decodeURIComponent(v);
  }
  return null;
}

function handleUrl(url: string): void {
  if (!url.includes('reset-password')) return;
  const tokenHash = parseParam(url, 'token_hash');
  if (tokenHash) {
    router.replace({
      pathname: '/(auth)/reset-password',
      params: { token_hash: tokenHash },
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
