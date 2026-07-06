// src/core/config/sentry.ts
// Sentry initialisation. DSN comes from app.config.js `extra.sentryDsn`.
// The DSN is a write-only ingest key — safe to ship in a client bundle.
import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const dsn = (Constants.expoConfig?.extra as { sentryDsn?: string } | undefined)?.sentryDsn;

export function initSentry() {
  if (!dsn) {
    if (__DEV__) console.warn('[sentry] no DSN configured; skipping init');
    return;
  }
  Sentry.init({
    dsn,
    tracesSampleRate: 0,
    enableAutoSessionTracking: true,
    debug: false,
  });
}

export { Sentry };
