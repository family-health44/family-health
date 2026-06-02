import { ExpoConfig, ConfigContext } from 'expo/config';

// app.config.ts intentionally contains NO secrets.
// Supabase URL and anon key are injected via environment variables at build time.
// See .env.example for required variables.
// Use EAS Secrets for production values — never commit .env files.

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Family Health',
  slug: 'family-health',
owner: 'rowan44',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'familyhealth',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#F7F5F0',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.rowan44.familyhealth.app',
    buildNumber: '1',
  },
  android: {
    package: 'com.rowan44.familyhealth.app',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#F7F5F0',
    },
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#F7F5F0',
        image: './assets/splash.png',
        imageWidth: 200,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
extra: {
    supabaseUrl: 'https://ukqijssyrdmzebdasgcs.supabase.co',
    supabaseAnonKey: process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'],
    eas: {
      projectId: 'ba1462b3-731f-4539-9bbf-dbf563e815e0',
    },
  },
});