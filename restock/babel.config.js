module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { 
        jsxImportSource: 'nativewind',
        unstable_transformImportMeta: true
      }],
      'nativewind/babel'
    ],
    plugins: [
      'expo-router/babel',
      'react-native-reanimated/plugin',
    ],
  };
}; 