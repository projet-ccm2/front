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

## Twitch & Auth

- Auth flow : OAuth implicit (token dans l'URL hash après redirect). Géré dans `AuthContext` + `App.tsx` (`completeAuth`). Token et user stockés dans `localStorage` sous la clé `twitch_user`.
- `ChannelContext` expose `selectedChannel` (channel courant). Le channel owner a un ID numérique Twitch. Les channels modérés ont un ID préfixé `mod-` (synthétique, pas un vrai ID Twitch).
- La distinction owner/mod est faite par `isOwnerAchievementChannelId(id)` dans `achievementManagementChannel.ts` — vérifie l'absence du préfixe `mod-`.

## Notifications (Toasts)

Les feedbacks ponctuels (succès/erreur publish, erreurs de validation) utilisent **Sonner** via `toast.success()` / `toast.error()` importés depuis `'sonner'`.

Le composant `<Toaster />` (`src/components/ui/sonner.tsx`) est monté une seule fois dans `AppContent` (`App.tsx`), en dehors du layout, et synchronise le thème via `useTheme()`.

## API — Achievement Management

Service URL : `VITE_ACHIEVEMENT_MANAGEMENT_SERVICE_URL` (défaut `http://localhost:3001`).  
Client : `src/features/achievements/api/achievementManagementClient.ts`

### Endpoints utilisés

| Méthode  | Route                                           | Usage                                   |
| -------- | ----------------------------------------------- | --------------------------------------- |
| `GET`    | `/achievements/:id`                             | Charger un achievement existant         |
| `GET`    | `/achievements/channel/:channelId`              | Lister les achievements d'un channel    |
| `GET`    | `/achievements/public`                          | Marketplace                             |
| `GET`    | `/achievements/user/:userId`                    | Achievements débloqués par un user      |
| `GET`    | `/achievements/user/:userId/channel/:channelId` | Achievements user filtrés par channel   |
| `POST`   | `/achievements`                                 | Créer un achievement (owner uniquement) |
| `PUT`    | `/achievements/:id`                             | Mettre à jour un achievement            |
| `DELETE` | `/achievements/:id`                             | Supprimer                               |
| `PATCH`  | `/achievements/:id/activate`                    | Activer                                 |
| `PATCH`  | `/achievements/:id/deactivate`                  | Désactiver                              |
| `POST`   | `/achievements/ai-suggestion`                   | Suggestion IA                           |

### Payload `type` — mapping et règles `type.data`

Achievement-management normalise `type.label` avant d'appeler DB-gateway.

| Frontend `type.label`  | Normalisé (AM)            | `type.data` requis  | Contrainte                                                              |
| ---------------------- | ------------------------- | ------------------- | ----------------------------------------------------------------------- |
| `message`              | `countMessage`            | Non (ignoré par AM) | ⚠️ Bug : AM envoie `data: ''` à DB-gateway → crash. Fix côté AM requis. |
| `message_content`      | `contentMessage`          | Oui                 | string non-vide (contenu à matcher)                                     |
| `channel_point_cost`   | `countCostChannelPoint`   | Oui                 | entier positif (coût minimum en points)                                 |
| `redeem_channel_point` | `countRedeemChannelPoint` | Oui                 | string non-vide (nom de la récompense)                                  |
| `api_caller`           | `apicaller`               | Oui                 | string non-vide                                                         |

### Chaîne d'appel

```
Frontend → achievement-management → DB-gateway (POST /type-achievements + POST|PUT /achievements)
```

DB-gateway stocke le type dans `TypeAchievement (label VARCHAR(50), data VARCHAR(55))` — les deux champs sont NOT NULL non-vides.

### Champ `label` du payload (top-level)

Le champ `label: string` dans `AchievementUpsertPayload` **n'est pas saisi par l'utilisateur**. Il est toujours dérivé automatiquement dans `AchievementCreator.handlePublish` :

```ts
label: String(formValues.type.data ?? 'dummy label')
```

Même logique pour `type.data` envoyé : `formValues.type.data ?? 'dummy label'`.

### Upload d'image

Le flow est piloté par `selectedImageUpload` dans `AchievementCreator` :

- L'utilisateur sélectionne un fichier → converti en base64 via `createImageUploadFormValue()` (`achievementFormModel.ts`)
- Au publish : `image: null` + `imageUpload: { fileName, mimeType, contentBase64 }` → AM gère l'upload et stocke l'URL
- Si pas de nouveau fichier : `image: <url existante>` + `imageUpload: null`

### Restriction owner-only

Seul le channel **owner** peut créer/modifier des achievements. Les channels modérateurs (préfixés `mod-`) sont bloqués côté frontend dans `getPublishValidationError` via `isOwnerAchievementChannelId()` (`achievementManagementChannel.ts`). La création depuis un canal modérateur affiche un `toast.error`.

### Erreur DB-gateway

```json
{
  "code": "db_service_validation_error",
  "message": "DB service validation failed for achievement type",
  "details": { "error": "label and data required" }
}
```

Cause : `type.data` vide ou null envoyé à DB-gateway.
