# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (Vite)
npm run build        # Type-check + production build (tsc -b && vite build)
npm run lint         # ESLint
npm run prettier     # Format all files
npm run test         # Run tests once (Vitest)
npm run test:watch   # Watch mode
npm run test:ui      # Vitest UI
npm run test:coverage  # Coverage report (80% thresholds enforced)
```

To run a single test file:

```bash
npx vitest run src/tests/App.test.tsx
```

## Architecture

**Feature-based architecture** — all code for a feature lives together under `src/features/<name>/`. Each feature has:

- A root component (`Dashboard.tsx`, `AchievementCreator.tsx`, etc.) as the entry point
- A `hooks/` subfolder for business logic (data fetching, state)
- A `components/` subfolder for private UI components
- An `api/` subfolder for API clients and types (where needed)

**Navigation** is purely state-driven in `App.tsx` — no router. `currentScreen` is a union string type (`'landing' | 'dashboard' | 'creator' | ...`). Adding a new screen means adding it to the `Screen` type and the render block in `AppContent`.

**Multi-entry build** — Vite builds three HTML entry points: `index.html` (main app), `panel.html` (Twitch extension panel), `config.html` (Twitch extension config). The app detects which path it's on at startup (`App.tsx`) and renders accordingly.

**Context providers** (in `src/context/`):

- `AuthContext` — Twitch OAuth flow, user session stored in localStorage
- `ChannelContext` — selected channel (user's own + modded channels), depends on `AuthContext`
- `LanguageContext` — i18n (EN/FR), translations in `src/i18n/translations.ts`, use `t('key')` hook
- `ThemeContext` — light/dark theme

**API clients** live at `src/features/<feature>/api/`. The pattern is a plain object (`achievementManagementClient`) wrapping a typed `requestJson<T>` helper. Errors throw `AchievementManagementError` with `.status` and `.details`.

**Runtime env config** — backend URLs come from `globalThis._env_` (injected at runtime in Docker) with fallback to `import.meta.env` vars. Env prefix whitelist is in `vite.config.ts`.

## Testing

Tests live under `src/tests/` (shared tests) and co-located within feature `tests/` directories. The jsdom environment is used with globals enabled.

Use the custom render helpers from `src/tests/utils/test-utils.tsx` — they wrap all providers automatically:

```typescript
import { render, renderHook } from '../../tests/utils/test-utils'
```

Coverage excludes `types.ts`, `constants.ts`, `index.ts`, mock data, and config files. Minimum threshold is 80% for lines/functions/branches/statements.

## Conventions

- Components: PascalCase files and exports
- Hooks: `use` prefix, camelCase
- Feature components act as containers (fetch via hooks, pass data to UI via props)
- Shared "dumb" UI atoms go in `src/components/ui/`; layout shells in `src/components/layout/`
- The `t()` function from `useLanguage()` must be used for all user-visible strings

<!-- rtk-instructions v2 -->

# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:

```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)

```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (90-99% savings)

```bash
rtk cargo test          # Cargo test failures only (90%)
rtk vitest run          # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)

```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)

```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)

```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)

```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%)
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)

```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)

```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)

```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands

```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category         | Commands                       | Typical Savings |
| ---------------- | ------------------------------ | --------------- |
| Tests            | vitest, playwright, cargo test | 90-99%          |
| Build            | next, tsc, lint, prettier      | 70-87%          |
| Git              | status, log, diff, add, commit | 59-80%          |
| GitHub           | gh pr, gh run, gh issue        | 26-87%          |
| Package Managers | pnpm, npm, npx                 | 70-90%          |
| Files            | ls, read, grep, find           | 60-75%          |
| Infrastructure   | docker, kubectl                | 85%             |
| Network          | curl, wget                     | 65-70%          |

Overall average: **60-90% token reduction** on common development operations.

<!-- /rtk-instructions -->
