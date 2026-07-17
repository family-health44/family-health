// src/core/config/sentry.ts
// Sentry initialisation + PII scrubbing.
// Read the DSN straight from process.env — Expo inlines EXPO_PUBLIC_* vars into
// the bundle at build/export time. (Routing via app.config.js `extra` failed to
// embed because app.config.js evaluates before .env.local is applied to it.)
// The DSN is a write-only ingest key — safe to ship in a client bundle.
import * as Sentry from '@sentry/react-native';
import type { ErrorEvent, Breadcrumb } from '@sentry/react-native';

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

// ── PII scrubbing ────────────────────────────────────────────────────────────
// Repositories wrap raw Supabase/Postgres errors as `originalError`, which is
// captured verbatim. Postgres and PostgREST embed row values in their messages:
//   duplicate key ... Key (email)=(jane@example.com) already exists.
//   ... violates foreign key constraint ... Key (person_id)=(<uuid>) ...
// and PostgREST responses carry details/hint with column values. Redact these
// patterns from any string that leaves the device.

const REDACTIONS: Array<[RegExp, string]> = [
  // Postgres "Key (col)=(value)" — the value is the leak.
  [/Key \(([^)]+)\)=\([^)]*\)/gi, 'Key ($1)=(REDACTED)'],
  // Email addresses anywhere.
  [/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, '<email>'],
  // Bare UUIDs (person/visit/doc ids surfaced in constraint text).
  [/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '<uuid>'],
];

function scrubString(s: string): string {
  return REDACTIONS.reduce((acc, [re, rep]) => acc.replace(re, rep), s);
}

function scrubEvent(event: ErrorEvent): ErrorEvent {
  // 1. Exception type/value strings (where Postgres text lands).
  if (event.exception?.values) {
    for (const ex of event.exception.values) {
      if (ex.value) ex.value = scrubString(ex.value);
    }
  }
  // 2. Top-level message, if any.
  if (typeof event.message === 'string') {
    event.message = scrubString(event.message);
  }
  // 3. Our own extra.appMessage.
  const extra = event.extra as Record<string, unknown> | undefined;
  if (extra && typeof extra.appMessage === 'string') {
    extra.appMessage = scrubString(extra.appMessage);
  }
  // 4. Defensive: we never set these, but the SDK can populate them.
  //    Drop user identity and request details (URLs carry ?col=eq.<value>).
  delete event.user;
  delete event.request;
  return event;
}

function scrubBreadcrumb(crumb: Breadcrumb): Breadcrumb | null {
  // Drop network breadcrumbs entirely — Supabase REST URLs embed filter values
  // (?id=eq.<uuid>, ?email=eq....) in the breadcrumb data.
  if (crumb.category === 'http' || crumb.category === 'xhr' || crumb.category === 'fetch') {
    return null;
  }
  if (typeof crumb.message === 'string') {
    crumb.message = scrubString(crumb.message);
  }
  return crumb;
}

export function initSentry() {
  if (!dsn) {
    if (__DEV__) console.warn('[sentry] no DSN configured; skipping init');
    return;
  }
  Sentry.init({
    dsn,
    tracesSampleRate: 0,
    enableAutoSessionTracking: true,
    sendDefaultPii: false,
    debug: false,
    beforeSend: (event) => scrubEvent(event),
    beforeBreadcrumb: (crumb) => scrubBreadcrumb(crumb),
  });
}

export { Sentry };
