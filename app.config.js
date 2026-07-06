module.exports = ({ config }) => ({
  ...config,
  name: 'Family Health',
  slug: 'family-health',
  scheme: 'family-health',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#F7F5F0',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.familyhealthapp.ios',
    developmentTeam: 'U63S68M7JJ',
    buildNumber: '2',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#F7F5F0',
    },
    package: 'com.familyhealthapp.ios',
  },
  updates: {
    url: 'https://u.expo.dev/ba1462b3-731f-4539-9bbf-dbf563e815e0',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    eas: {
      projectId: 'ba1462b3-731f-4539-9bbf-dbf563e815e0',
    },
  },
  plugins: [
    'expo-router',
    'expo-font',
    '@sentry/react-native',
    '@react-native-community/datetimepicker',
    'expo-sharing',
    [
      'expo-document-picker',
      { iCloudContainerEnvironment: 'Production' },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'Family Health needs access to your photos so you can attach them to a person\u2019s records.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
});
