# FirebirdTourInterview

A small React Native app that fetches posts from JSONPlaceholder, persists them in SQLite via Drizzle ORM, and lets you mark posts as favorites with a swipe gesture.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | React Native 0.85.3 (New Architecture, Hermes) |
| Navigation | `@react-navigation/native-stack` v7 |
| Database | `@op-engineering/op-sqlite` (WAL mode) |
| ORM / migrations | `drizzle-orm` + `drizzle-kit` |
| State | `zustand` |
| Gestures / animation | `react-native-gesture-handler` v3 + `react-native-reanimated` v4 |
| Mock data | `@faker-js/faker` (image URLs) |

## Prerequisites

- Node `>= 22.11.0`
- macOS with Xcode 16+ (iOS) / Android Studio with NDK 27 (Android)
- Ruby + Bundler for CocoaPods

## Getting started

```sh
# install JS deps
npm install

# iOS native deps (first time + whenever native deps change)
bundle install
bundle exec pod install

# start Metro
npm start

# run on iOS / Android (in a separate terminal)
npm run ios
npm run android
```

After a Babel/Metro config change, restart Metro with `npm start -- --reset-cache`.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Metro dev server |
| `npm run ios` / `npm run android` | Build and launch on simulator/device |
| `npm test` | Jest |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate a new Drizzle migration from `schema.ts` |
| `npm run db:studio` | Open Drizzle Studio against the local DB |

## Architecture

The app is layered top-down: **screens → stores → repositories → DB**. Components never call the database directly.

```
src/
├── api/                    # HTTP clients (fetch wrappers)
│   └── posts.api.ts
├── db/
│   ├── index.ts            # op-sqlite client + drizzle instance, sets PRAGMA journal_mode=WAL
│   ├── schema.ts           # Drizzle table definitions — source of truth
│   └── migrations/         # generated SQL files + journal (see "Migrations" below)
├── navigation/
│   ├── Root.navigator.tsx  # native stack
│   └── types.ts            # RootStackParamList + typed screen props
├── repositories/           # thin Drizzle wrappers, no business logic
│   ├── posts.repository.ts
│   └── favorites.repository.ts
├── stores/                 # Zustand stores — orchestrate API + repository + state
│   ├── posts.store.ts
│   └── favorites.store.ts
└── screens/                # *.screen.tsx — read from stores via per-field selectors
    ├── Posts.screen.tsx
    └── Details.screen.tsx
```

### Data flow

1. On launch, `App.tsx` runs Drizzle migrations via `useMigrations` and waits before mounting the navigator.
2. `PostsScreen` triggers `loadPosts()` and `loadFavorites()` on mount.
3. `loadPosts()` checks if the local table is empty. If empty, it fetches from `https://jsonplaceholder.typicode.com/posts`, attaches a Faker-generated image URL to each post, and inserts them. On subsequent launches it just reads from SQLite — the network is bypassed entirely.
4. `favoriteIds` is held as a `Set<number>` ordered most-recent-first (insertion order). Toggling a favorite updates the store synchronously (optimistic) and persists to SQLite afterwards.
5. `PostsScreen` renders a `SectionList` with two sections (`Favorites`, `Other`); each `PostRow` subscribes to its own favorite state via `useFavoritesStore(s => s.favoriteIds.has(id))` so only the toggled row re-renders.

### File naming

- `*.screen.tsx` — screens
- `*.navigator.tsx` — navigators
- `*.repository.ts` — data access
- `*.store.ts` — Zustand stores
- `*.api.ts` — HTTP clients

## Migrations

The schema in `src/db/schema.ts` is the source of truth. **Never** write raw `CREATE TABLE` SQL by hand — always go through drizzle-kit.

### Adding a migration

1. Edit `src/db/schema.ts` (add/modify a table or column).
2. Generate the migration:

   ```sh
   npm run db:generate
   ```

   This writes:
   - `src/db/migrations/000X_<random_name>.sql` — the SQL drizzle-kit produced
   - `src/db/migrations/meta/_journal.json` — appended with a new entry
   - `src/db/migrations/meta/000X_snapshot.json` — schema snapshot
3. Import the new SQL file in `src/db/migrations/migrations.ts`:

   ```ts
   import m000X from './000X_<random_name>.sql';

   const migrations = {
     journal,
     migrations: {
       m0000,
       m0001,
       /* ... */
       m000X,
     },
   };
   ```
4. If the migration is `ALTER TABLE ... ADD COLUMN ... NOT NULL`, drizzle-kit will not include a default. SQLite requires one when existing rows are present — manually add `DEFAULT <value>` to the generated `.sql` file before shipping.
5. Restart Metro with `--reset-cache` so the `babel-plugin-inline-import` re-bundles the SQL.

Migrations are inlined at build time by `babel-plugin-inline-import` (see `babel.config.js`) and `sql` is added to Metro's `resolver.sourceExts` (see `metro.config.js`). The migrator runs them in journal order on each app launch and skips any that have already been applied.

### Resetting the local DB

To start with a clean database during development, delete the app from the simulator/device (or use the simulator's Erase All Content & Settings). The DB file `firebird.db` is created in the app's sandbox and migrations re-run from scratch on next launch.

## Performance notes

- `react-native-gesture-handler` requires `<GestureHandlerRootView>` at the app root (see `App.tsx`).
- `PostsScreen` uses per-field Zustand selectors and `React.memo` on row components so toggling a favorite re-renders only the affected row, not the whole list.
- WAL journaling is enabled at DB open (`src/db/index.ts`) for better concurrent read/write throughput.
- Tap gestures on list rows use RNGH's `useTapGesture` + `GestureDetector` so they cooperate with the row's swipe pan gesture — a tap after a swipe doesn't fire `onPress`.

## Known caveats

- iOS large-title navigation bars (`headerLargeTitleEnabled: true`) don't cooperate with `SectionList`'s `stickySectionHeadersEnabled`. The app currently disables sticky headers; see the discussion in `Posts.screen.tsx`.
- `react-native-reanimated` v4 requires `react-native-worklets` natively. If `pod install` fails with `Unable to find a specification for RNWorklets`, ensure both packages are at compatible versions.

## Project conventions

- Single quotes, trailing commas everywhere, no parens on single-arg arrows (`.prettierrc.js`).
- iOS workspace: always open `ios/FirebirdTourInterview.xcworkspace`, never the `.xcodeproj`.
- `.xcode.env.local` pins the Node binary path for Xcode build scripts. Update it if your nvm path differs.
