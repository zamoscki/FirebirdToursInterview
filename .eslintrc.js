module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'newline-per-chained-call': ['error', { ignoreChainWithDepth: 2 }],
  },
  overrides: [
    {
      files: ['jest.setup.js', '**/__tests__/**', '**/*.test.{ts,tsx}'],
      env: { jest: true },
    },
  ],
};
