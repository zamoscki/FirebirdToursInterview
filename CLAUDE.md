# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start                   # Metro bundler
npm run ios                 # Build and run on iOS simulator
npm run android             # Build and run on Android emulator
npm test                    # Jest (all tests)
npx jest --testPathPattern=<file>  # Run a single test file
npm run lint                # ESLint

bundle install              # Install Ruby gems (first-time or after Gemfile changes)
bundle exec pod install     # Install/update CocoaPods dependencies (iOS)
```

## Architecture

**New Architecture (enabled)** — both platforms use `newArchEnabled=true`. iOS `AppDelegate.swift` uses `RCTReactNativeFactory`, not the old `RCTBridge`. Native modules must be TurboModule-compatible.

**Hermes** — JavaScript engine enabled on both iOS and Android.

**iOS builds** — always use `ios/FirebirdTourInterview.xcworkspace`, never `.xcodeproj` directly. CocoaPods manages all native dependencies.

**Node in Xcode** — `.xcode.env.local` overrides the node binary path for Xcode build scripts (points to nvm). If the iOS build fails with "node not found", update this file to match your local node path.

**Safe areas** — `react-native-safe-area-context` is installed and `SafeAreaProvider` already wraps `App.tsx`. Use `useSafeAreaInsets` for notch/dynamic island handling throughout the app.

## Code Style

Prettier config (`.prettierrc.js`): single quotes, trailing commas everywhere, no parens on single-arg arrow functions.

## Testing

Jest uses `@react-native/jest-preset`. The async render pattern from `__tests__/App.test.tsx` is the convention:

```ts
await act(async () => {
  renderer = create(<App />);
});
```
