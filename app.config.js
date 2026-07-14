module.exports = ({ config }) => ({
  ...config,
  name: 'FamFiles',
  slug: 'family-health',
  scheme: 'famfiles',
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
    bundleIdentifier: 'app.famfiles.ios',
    developmentTeam: 'U63S68M7JJ',
    buildNumber: '7',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
    privacyManifests: {
      NSPrivacyTracking: false,
      NSPrivacyTrackingDomains: [],
      NSPrivacyCollectedDataTypes: [],
      NSPrivacyAccessedAPITypes: [
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults',
          NSPrivacyAccessedAPITypeReasons: ['CA92.1'],
        },
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryFileTimestamp',
          NSPrivacyAccessedAPITypeReasons: ['C617.1'],
        },
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategorySystemBootTime',
          NSPrivacyAccessedAPITypeReasons: ['35F9.1'],
        },
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryDiskSpace',
          NSPrivacyAccessedAPITypeReasons: ['E174.1'],
        },
      ],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#F7F5F0',
    },
    package: 'app.famfiles.android',
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
          'FamFiles needs access to your photos so you can attach them to a person\\u2019s records.',
      },
    ],
    [
      'expo-notifications',
      { color: '#1F5C41' },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
});
