// app/+html.tsx
// Custom HTML shell for the web build. Injects the Apple PWA meta tags iOS
// needs for standalone (chrome-free) home-screen launch — the manifest's
// display field alone is not honoured by iOS Safari. Also links the web
// manifest, whose scope:"/" keeps post-login navigations inside the PWA
// (without it iOS scopes to the start dir and boots deeper routes to Safari,
// which is why the URL bar reappeared after login).
import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#1F5C41" />
        <link rel="manifest" href="/manifest.json" />
        {/* iOS standalone PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FamFiles" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
