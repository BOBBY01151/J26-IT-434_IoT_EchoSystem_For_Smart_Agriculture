const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable package exports to prevent Metro from picking up untranspiled ESM containing import.meta
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
