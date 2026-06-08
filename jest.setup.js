import 'react-native-gesture-handler/jestSetup';

// Use the official mocks shipped by react-native-worklets and react-native-reanimated.
// The worklets mock must be wired first because reanimated's mock imports worklets.
jest.mock('react-native-worklets', () =>
  require('react-native-worklets/lib/module/mock'),
);

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('@d11/react-native-fast-image', () => {
  const { Image } = require('react-native');
  return { __esModule: true, default: Image };
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Native SQLite — return a fake driver. Tests that need a real DB should
// mock at the repository layer instead.
jest.mock('@op-engineering/op-sqlite', () => ({
  open: () => ({
    execute: jest.fn(),
    executeAsync: jest.fn(async () => ({ rows: [] })),
    close: jest.fn(),
    delete: jest.fn(),
  }),
}));
