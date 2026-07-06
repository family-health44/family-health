const path = require('path');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const { withNativeWind } = require('nativewind/metro');

const config = getSentryExpoConfig(__dirname);

// Sentry's RN error handler requires `promise/setimmediate/done`, but there's no
// top-level `promise` package — RN ships its own nested copy. Alias to it so Metro
// can resolve the subpath during export/OTA bundling.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  promise: path.resolve(__dirname, 'node_modules/react-native/node_modules/promise'),
};

module.exports = withNativeWind(config, { input: './global.css' });
