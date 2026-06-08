const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('mjs');

// Add specific module resolution for Firebase
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;

