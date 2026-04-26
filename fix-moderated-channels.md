# Fix — Moderated Channels Not Showing in "Manage Channels"

## Symptom

In the "Manage Channels" UI, only the user's own channel appears. Channels where the user is a Twitch moderator are missing, even though the moderation relationship exists on Twitch.

## Architecture

```
Frontend (this repo)
  └── ChannelContext.tsx
        ├── reads user.channelsWhichIsMod[] from localStorage ('twitch_user')
        └── builds the channel list (owner + moderators)

Backend — user-management (https://github.com/projet-ccm2/user-management/tree/develop)
  ├── POST /auth/callback   → callbackConnexion()
  ├── GET  /users/:id       → getUserById()
  └── PUT  /channels/me/discord-webhook
```

The ARE (Access Role Entity) table in the DB stores user↔channel relationships with a `userType` field (`'owner'` | `'moderator'`).

## Root Cause

In `src/controllers/authController.ts` (backend), `callbackConnexion` always builds the User model with:

```ts
channelsWhichIsMod: []   // always empty
```

The response (`res.json(userModel.getAllWithoutAuth())`) is sent **before** `syncChannelsAndAreAfterAuth()` runs. That sync function fetches moderated channels from Twitch and writes ARE records to the DB, but it runs **after** the HTTP response is already sent (fire & forget).

Result: the frontend always receives `channelsWhichIsMod: []`, stores it in `localStorage('twitch_user')`, and never sees the moderated channels — even on subsequent page loads.

## What syncChannelsAndAreAfterAuth Does

Located in `src/services/syncChannelsAndAreService.ts`:
1. Ensures the user's own channel exists in the DB
2. Creates an `owner` ARE link for the user's channel
3. Calls `twitchModerationService.getModeratedChannels()` → Twitch `/helix/moderation/channels`
4. Creates `moderator` ARE links in the DB for each moderated channel
5. Also syncs the reverse: users who moderate the owner's channel

ARE records ARE written correctly — the data is in the DB. The problem is only in the auth response.

## Frontend Code (ChannelContext.tsx)

`src/context/ChannelContext.tsx` — `buildInitialChannels()` reads `user.channelsWhichIsMod`:

```ts
const modChannels: Channel[] = user.channelsWhichIsMod.map(channelId => ({
  id: `mod-${channelId}`,
  name: channelId,
  avatar: channelId.charAt(0).toUpperCase(),
  role: 'Moderator' as const,
  followers: 0,
}))
```

A second `useEffect` then enriches these with real display names and avatars by calling Twitch Helix `/users`. This part works correctly — the issue is upstream (empty array input).

## Fix Options

### Option A — Backend only (simplest)

In `callbackConnexion`, await the moderated channels fetch **before** sending the response:

```ts
// src/controllers/authController.ts
const moderatedChannels = await twitchModerationService.getModeratedChannels(
  twitchUserId,
  accessToken
)
const userModel = new User({
  username: ...,
  channel: ...,
  channelsWhichIsMod: moderatedChannels.map(c => c.broadcaster_id),
  auth: ...,
})
// syncChannelsAndAreAfterAuth can still run async after
res.status(200).json({ success: true, user: userModel.getAllWithoutAuth(), userId: dbResult.id })
```

Pros: no frontend change needed, localStorage gets correct data on next login.  
Cons: adds latency to auth callback (one extra paginated Twitch API call).

### Option B — New backend endpoint + frontend call

Add `GET /users/:id/moderated-channels` (or `GET /channels/me/moderated`) that queries the ARE table for `userId + userType = 'moderator'` and returns the channel IDs.

Then in `ChannelContext.tsx`, after the initial build, call this endpoint and merge the result into `availableChannels`.

Pros: always up-to-date from DB, no auth latency impact.  
Cons: requires both a new backend endpoint and a frontend change.

## Recommended Fix

**Option A** for quick fix — it's a one-liner in `callbackConnexion`. The user will need to log out and log back in once for localStorage to be refreshed with correct data.

**Option B** is cleaner long-term (decouples from auth flow, always reflects current DB state).

## Files to Change

| File | Repo | Change |
|------|------|--------|
| `src/controllers/authController.ts` | user-management | Option A: populate `channelsWhichIsMod` before response |
| `src/routes/userRoute.ts` (new endpoint) | user-management | Option B: add GET moderated-channels route |
| `src/context/ChannelContext.tsx` | **this repo** | Option B: fetch moderated channels after login |

## Notes

- Twitch scope `user:read:moderated_channels` is already requested in the frontend `login()` function (`src/context/AuthContext.tsx:33`) — the token has the right permissions.
- The enrichment logic (fetching display names / avatars from Helix) in `ChannelContext.tsx` is correct and will work once `channelsWhichIsMod` is non-empty.
- After fixing the backend, existing users must re-login once to refresh their localStorage.
