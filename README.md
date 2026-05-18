# Stream Quest — Frontend

Stream Quest is a Twitch achievement platform that lets streamers create custom achievements for their community. Viewers unlock achievements by meeting triggers (chat messages, channel point redemptions, API calls), track their progress, and compete on leaderboards. Streamers and their moderators manage achievements from a dedicated dashboard.

The app is also distributed as a **Twitch Extension** (panel + config page) and supports a **mobile build** via Capacitor (Android).

---

## Tech Stack

| Category      | Technology                                |
| ------------- | ----------------------------------------- |
| Framework     | React 19                                  |
| Language      | TypeScript 5.9 (strict)                   |
| Build tool    | Vite 7 + SWC                              |
| Styling       | Tailwind CSS + `tailwind-merge` + `clsx`  |
| UI primitives | Radix UI (full suite) + shadcn/ui pattern |
| Icons         | Lucide React                              |
| Charts        | Recharts                                  |
| Toasts        | Sonner                                    |
| Forms         | React Hook Form                           |
| State         | React Context + hooks (no external store) |
| i18n          | Custom (`resolveTranslation`) — EN / FR   |
| Testing       | Vitest + jsdom + Testing Library          |
| Mobile        | Capacitor 6 (Android)                     |

---

## Project Structure

```
src/
├── features/           # One folder per domain — all code for a feature lives here
│   ├── achievements/   # Achievement creation, editing, management
│   ├── apk/            # Android APK download
│   ├── chat/           # Chat integration
│   ├── dashboard/      # Stats, charts, recent activity
│   ├── discord/        # Discord webhook configuration
│   ├── landing/        # Public landing page (unauthenticated)
│   ├── marketplace/    # Public community template browser
│   ├── overlay/        # Twitch live panel + extension panel/config
│   ├── profile/        # Viewer profile, XP, leaderboard
│   └── viewer/         # ViewerHub — multi-channel tracker
│
├── context/            # Global React contexts (Auth, Channel, Language, Theme)
├── components/
│   ├── ui/             # Reusable "dumb" atoms (button, card, select, …)
│   └── layout/         # Structural shells (Sidebar)
├── config/             # Environment variable resolution
├── hooks/              # Shared custom hooks
├── i18n/               # Translation keys (EN + FR)
├── lib/                # Utility helpers
├── types/              # Shared TypeScript types (Twitch, global env)
│
├── App.tsx             # Entry point, screen routing, auth flow
├── main.tsx            # Main app mount (index.html)
├── TwitchExtensionPanelApp.tsx   # Extension viewer panel (panel.html)
└── TwitchExtensionConfigApp.tsx  # Extension broadcaster config (config.html)
```

Each feature folder follows the same convention:

```
features/<name>/
├── <Name>.tsx          # Root component — acts as container (fetches via hooks, passes props)
├── hooks/              # Business logic, data fetching, state
├── components/         # Private UI components (not shared outside this feature)
├── api/                # API client + types
├── utils/              # Pure helpers
└── forms/              # Form models and validation
```

---

## Features

### Dashboard

Aggregated view of achievement stats, an engagement chart (Recharts), and a recent activity feed. Metrics are intentionally hidden when browsing a moderated channel — only the moderator's own achievement progress is shown.

### Achievement Creator

Full-featured form to create or edit an achievement:

- **Trigger types**: chat message count, message content match, channel point cost, channel point redemption name, API caller
- **AI suggestion**: generates a title + description from a prompt via `POST /achievements/ai-suggestion`
- **Image upload**: converts a file to base64 and sends it to the backend; stored URL returned on save
- **Moderator support**: moderators can create and edit achievements on channels they moderate; a yellow banner signals the moderated context

### Achievement Management

List of a channel's achievements with search, filter, activate/deactivate toggle, edit, and delete. Also available to moderators.

### Marketplace

Browse public achievement templates from the community. Filter and sort, then use one as a starting point in the Creator.

### Twitch Overlay & Extension

- **Live overlay** (`/overlay`): real-time viewer panel for OBS browser source
- **Public panel**: `?channel=<id>` URL renders a public achievement board
- **Twitch Extension Panel** (`panel.html`): embedded in the Twitch panel slot
- **Twitch Extension Config** (`config.html`): broadcaster config page inside Twitch dashboard

### Viewer Hub

Allows a logged-in viewer to track their achievement progress across multiple channels they follow in one place.

### User Profile

Shows a viewer's level, XP, unlocked achievements list, and their position on the channel leaderboard.

### Discord Webhook

Configure a Discord webhook URL to receive notifications when achievements are unlocked.

### Mobile (APK)

Android build via Capacitor. The APK download screen lets users grab the latest mobile build directly.

---

## Navigation & Routing

Navigation is **purely state-driven** — no router library. `App.tsx` holds a `currentScreen` state typed as:

```ts
type Screen =
  | 'landing'
  | 'dashboard'
  | 'creator'
  | 'management'
  | 'marketplace'
  | 'profile'
  | 'viewerHub'
  | 'overlay'
  | 'discord'
```

On mount, `App.tsx` checks the URL path:

- Twitch extension panel path → renders `TwitchExtensionPanel` directly
- `?channel=<id>` query param → renders `PublicTwitchPanel` directly
- Otherwise → renders the main `AppContent` with the `currentScreen` switcher

---

## Context Providers

| Context           | What it manages                                                                         |
| ----------------- | --------------------------------------------------------------------------------------- |
| `AuthContext`     | Twitch OAuth state (`user`, `isAuthenticated`), `login()`, `logout()`, `completeAuth()` |
| `ChannelContext`  | `selectedChannel`, `availableChannels` (own + moderated), `setSelectedChannel()`        |
| `LanguageContext` | Active language (`en` / `fr`), `t(key)` translation helper                              |
| `ThemeContext`    | `theme` (`dark` / `light`), `toggleTheme()`                                             |

All providers are composed in `App.tsx`. The `<Toaster />` from Sonner is mounted once inside `AppContent`, outside the layout, and reads the active theme.

---

## Auth Flow

1. User clicks "Login" → redirected to Twitch OAuth (implicit flow)
2. Twitch redirects back with token in the URL hash
3. `App.tsx` calls `completeAuth(tokens)` which stores `twitch_user` and `twitch_tokens` in `localStorage`
4. On mobile (Capacitor), deep links are handled via `@capacitor/browser` + `@capacitor/app`

Moderated channels are identified by a `mod-` prefix on their synthetic ID (e.g., `mod-123456`). The real broadcaster ID is recovered with `getRealChannelId()` when calling the backend.

---

## API

All backend communication goes through typed client objects. The pattern is a plain object wrapping a `requestJson<T>` helper that throws `AchievementManagementError` on failure.

### Achievement Management Service

Env var: `VITE_ACHIEVEMENT_MANAGEMENT_SERVICE_URL` (default: `http://localhost:3001`)

| Method | Route                                           | Usage                                 |
| ------ | ----------------------------------------------- | ------------------------------------- |
| GET    | `/achievements/:id`                             | Load one achievement                  |
| GET    | `/achievements/channel/:channelId`              | Channel achievement list              |
| GET    | `/achievements/public`                          | Marketplace                           |
| GET    | `/achievements/user/:userId`                    | User's unlocked achievements          |
| GET    | `/achievements/user/:userId/channel/:channelId` | User achievements filtered by channel |
| POST   | `/achievements`                                 | Create                                |
| PUT    | `/achievements/:id`                             | Update                                |
| DELETE | `/achievements/:id`                             | Delete                                |
| PATCH  | `/achievements/:id/activate`                    | Activate                              |
| PATCH  | `/achievements/:id/deactivate`                  | Deactivate                            |
| POST   | `/achievements/ai-suggestion`                   | AI generation                         |

### Other Services

| Env var                 | Default                 | Used by                              |
| ----------------------- | ----------------------- | ------------------------------------ |
| `VITE_AUTH_SERVICE_URL` | `http://localhost:3000` | Auth, channel list                   |
| `VITE_API_SERVICE_URL`  | `http://localhost:3000` | General API calls                    |
| `VITE_TWITCH_CLIENT_ID` | —                       | Twitch API requests (channel points) |
| `VITE_FRONT_URL`        | —                       | OAuth redirect URL                   |

At runtime, env vars are injected into `globalThis._env_` via `env.sh` (Docker). `src/config/environment.ts` resolves them with a fallback chain: `_env_` → `import.meta.env` → hardcoded default.

---

## Multi-Entry Build

Vite builds three separate HTML entry points:

| File          | Mount                              | Purpose                             |
| ------------- | ---------------------------------- | ----------------------------------- |
| `index.html`  | `src/main.tsx`                     | Main dashboard app                  |
| `panel.html`  | `src/TwitchExtensionPanelApp.tsx`  | Twitch extension viewer panel       |
| `config.html` | `src/TwitchExtensionConfigApp.tsx` | Twitch extension broadcaster config |

---

## Commands

```bash
npm run dev           # Start dev server (Vite, hot reload)
npm run build         # Type-check (tsc -b) then production build
npm run lint          # ESLint
npm run prettier      # Format all files (Prettier)
npm run test          # Run test suite once (Vitest)
npm run test:watch    # Watch mode
npm run test:ui       # Vitest browser UI
npm run test:coverage # Coverage report (80% thresholds enforced)
```

Run a single test file:

```bash
npx vitest run src/tests/features/AchievementCreator.test.tsx
```

---

## Testing

Tests live under `src/tests/` (shared) and in co-located `tests/` subdirectories within features. The jsdom environment is used with globals enabled.

Use the custom render helpers — they wrap all providers automatically:

```ts
import { render, renderHook } from '../../tests/utils/test-utils'
```

Coverage thresholds are enforced at **80%** for lines, functions, branches, and statements. Coverage excludes `types.ts`, `constants.ts`, `index.ts`, mock data, and config files.

---

## Docker

The production image serves the Vite preview server on port `4173`:

```bash
docker build -t stream-quest-front .
docker run -p 4173:4173 \
  -e VITE_AUTH_SERVICE_URL=https://... \
  -e VITE_ACHIEVEMENT_MANAGEMENT_SERVICE_URL=https://... \
  -e VITE_TWITCH_CLIENT_ID=... \
  -e VITE_FRONT_URL=https://... \
  stream-quest-front
```

`env.sh` runs at container start and writes a `env-config.js` file loaded by `index.html`, making runtime env vars available as `window._env_` without a rebuild.

---

## Conventions

- **Components**: PascalCase files and exports (`AchievementCreator.tsx`)
- **Hooks**: `use` prefix, camelCase (`useChannelAchievements.ts`)
- **Feature components** act as containers: fetch via hooks, render via props
- **Shared UI atoms** go in `src/components/ui/`; layout shells in `src/components/layout/`
- All user-visible strings must use `t('key')` from `useLanguage()` — no hardcoded UI text
