import { TWITCH_CLIENT_ID } from '../../../config/environment'

/** User ID of the IRC bot account (streamquestbotccm) */
const BOT_USER_ID = '1488389988'

export class ChatClientError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ChatClientError'
    this.status = status
  }
}

/**
 * Adds the IRC bot as a moderator in the streamer's channel.
 * Called automatically after login — silent if already mod (409).
 * Requires scope: channel:manage:moderators
 */
export async function addBotAsModerator(broadcasterId: string, accessToken: string): Promise<void> {
  const url = new URL('https://api.twitch.tv/helix/moderation/moderators')
  url.searchParams.set('broadcaster_id', broadcasterId)
  url.searchParams.set('user_id', BOT_USER_ID)

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Client-Id': TWITCH_CLIENT_ID,
    },
  })

  // 204 = added, 409 = already mod — both are fine
  if (!res.ok && res.status !== 409) {
    const body = await res.json().catch(() => ({}))
    throw new ChatClientError(
      body.message ?? `Failed to add bot as moderator (${res.status})`,
      res.status
    )
  }
}
