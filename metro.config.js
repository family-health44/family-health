// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// NativeWind requires processing CSS through Metro
module.exports = withNativeWind(config, { input: './src/design-system/theme/global.css' });
