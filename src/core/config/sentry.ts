// src/core/config/sentry.ts
// Sentry initialisation.
// Read the DSN straight from process.env — Expo inlines EXPO_PUBLIC_* vars into
// the bundle at build/export time. (Routing via app.config.js `extra` failed to
// embed because app.config.js evaluates before .env.local is applied to it.)
// The DSN is a write-only ingest key — safe to ship in a client bundle.
import * as Sentry from '@sentry/react-native';

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

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
