module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['babel-plugin-inline-import', { extensions: ['.sql'] }],
    [
      'module-resolver',
      {
        alias: {
          '@containers': './src/containers',
          '@components': './src/components/',
          '@repositories': './src/repositories',
          '@stores': './src/stores',
          '@db': './src/db',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
