# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A React Native mobile client for [TeslaMate](https://github.com/adriankumpf/teslamate), connecting to a self-hosted TeslaMateApi instance. Displays vehicle dashboard, drive history, and drive detail charts.

## Commands

```bash
npx expo start          # Dev server (press i/a for iOS/Android sim)
npx expo run:ios        # Native iOS build
npx expo run:android    # Native Android build
npx expo start --web    # Web dev server
npx expo export         # Static export (clean dist/ after)
```

No test runner or linter is configured yet. The single existing test (`components/__tests__/StyledText-test.js`) uses react-test-renderer.

## Architecture

### Routing (Expo Router 6 — file-based)
- `app/_layout.tsx` — Root: wraps everything in SafeAreaProvider → QueryClientProvider → ThemeProvider (forced dark). Loads SpaceMono font.
- `app/(tabs)/_layout.tsx` — Tab navigator with custom tab bar. Three tabs: Dashboard (index), Activity, Settings.
- `app/drive/[id].tsx` — Drive detail screen (push from Activity tab). Shows route, stats, and line charts.

### Data Flow
- **API**: `lib/api.ts` — axios client created per-request from stored URL/token. All endpoints hit `/api/v1/cars/...`. Types (`Car`, `CarStatus`, `Drive`, `DriveDetail`) are co-located here.
- **Persistence**: `lib/store.ts` — expo-secure-store wrapper for `teslamate_api_url` and `teslamate_api_token`.
- **State**: TanStack Query manages all server state. No global client state. Car status auto-refreshes every 30s.

### Styling System
- **NativeWind 4** (Tailwind-in-RN) with custom design tokens in `tailwind.config.js`.
- Token namespaces: `surface.*` (backgrounds), `tesla.*` (brand accents), `dim.*` (translucent tinted backgrounds), `txt.*` (text hierarchy), `edge.*` (borders).
- `constants/Colors.ts` has a `palette` object mirroring these tokens for use in inline styles.
- `global.css` is the Tailwind entry point, processed by NativeWind's metro plugin.
- `babel.config.js`: NativeWind preset + `jsxImportSource: "nativewind"` + reanimated plugin (must be last).

### UI Components (`components/ui/`)
- **GlassCard** — Card with `bg-surface-card` + subtle border. Primary layout container.
- **BatteryRing** — Animated SVG ring using `Animated.createAnimatedComponent(Circle)` from reanimated. Gradient-stroked progress arc.
- **Skeleton** — Reanimated opacity pulse for loading states. Exported named skeletons: `DashboardSkeleton`, `ActivitySkeleton`.
- **StatusBadge** — Pill with colored dot, uses `dim.*` Tailwind colors for background.
- **CustomTabBar** — Custom bottom tab bar replacing default, handles safe area insets.

### Themed.tsx
`Text` defaults to `#f5f5f5` via style (className can override). `View` is fully transparent — no bg injection — so NativeWind `bg-*` classes work.

## Key Conventions

- **Dark-first**: All screens use `bg-surface-primary` (#000). No light mode support.
- **Path alias**: `@/*` maps to project root (tsconfig paths).
- **Icons**: `lucide-react-native` exclusively — import individual icons by name.
- **Charts**: `react-native-chart-kit` requires a `color` callback returning `rgba(r,g,b,opacity)`. Use the `hexToRgba` helper pattern from `drive/[id].tsx`.
- **First car assumption**: All screens use `cars?.[0]` — no multi-car selector yet.
- **HTTP allowed**: `NSAllowsArbitraryLoads` is enabled in iOS plist for local network TeslaMate instances.
- **New Arch**: Enabled (`newArchEnabled: true` in app.json).
