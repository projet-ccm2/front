const TWITCH_EVENT_LISTENER_URL =
  globalThis._env_?.TWITCH_EVENT_LISTENER_URL ||
  import.meta.env.VITE_TWITCH_EVENT_LISTENER_URL ||
  'http://localhost:3000'

const CHAT_API_KEY =
  globalThis._env_?.CHAT_API_KEY || import.meta.env.VITE_CHAT_API_KEY || ''

const TWITCH_CLIENT_ID =
  globalThis._env_?.TWITCH_CLIENT_ID || import.meta.env.VITE_TWITCH_CLIENT_ID || ''

/** User ID of the IRC bot account (streamquestbotccm) */
const BOT_USER_ID = '1488389988'

const WELCOME_MESSAGE =
  'Merci de faire confiance à StreamQuest ! Je suis maintenant connecté à votre chat et prêt à célébrer vos achievements !'

export class ChatClientError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ChatClientError'
    this.status = status
  }
}

/**
 * Sends a message to a Twitch channel via the IRC bot.
 */
export async function sendChatMessage(channelLogin: string, message: string): Promise<void> {
  const res = await fetch(`${TWITCH_EVENT_LISTENER_URL}/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CHAT_API_KEY,
    },
    body: JSON.stringify({ channelLogin, message }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ChatClientError(
      body.error ?? `Failed to send chat message (${res.status})`,
      res.status,
    )
  }
}

/**
 * Adds the IRC bot as a moderator in the streamer's channel.
 * On first add (204), the bot sends a welcome message in chat.
 * Silent if already mod (409).
 * Requires scope: channel:manage:moderators
 */
export async function addBotAsModerator(
  broadcasterId: string,
  channelLogin: string,
  accessToken: string,
): Promise<void> {
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

  if (res.status === 204) {
    // First time — send welcome message (non-blocking)
    sendChatMessage(channelLogin, WELCOME_MESSAGE).catch(() => {})
    return
  }

  if (res.status === 409) {
    // Already mod — nothing to do
    return
  }

  const body = await res.json().catch(() => ({}))
  throw new ChatClientError(
    body.message ?? `Failed to add bot as moderator (${res.status})`,
    res.status,
  )
}
