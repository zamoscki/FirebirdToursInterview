module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'newline-per-chained-call': ['error', { ignoreChainWithDepth: 2 }],
  },
};
