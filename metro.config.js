const path = require('path');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const { withNativeWind } = require('nativewind/metro');

const config = getSentryExpoConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  promise: path.resolve(__dirname, 'node_modules/react-native/node_modules/promise'),
};

module.exports = withNativeWind(config, { input: './global.css' });
