module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleNameMapper: {
    '^@containers/(.*)$': '<rootDir>/src/containers/$1',
    '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
    '^@stores/(.*)$': '<rootDir>/src/stores/$1',
    '^@db/(.*)$': '<rootDir>/src/db/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-gesture-handler|react-native-reanimated|react-native-worklets|@d11|react-native-safe-area-context|@testing-library|@op-engineering|@faker-js)/)',
  ],
};
