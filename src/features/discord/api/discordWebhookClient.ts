import { AUTH_SERVICE_URL as USER_MANAGEMENT_URL } from '../../../config/environment'

export class DiscordWebhookError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'DiscordWebhookError'
    this.status = status
    this.details = details
  }
}

export const discordWebhookClient = {
  async register(accessToken: string, channelId: string, webhookUrl: string | null): Promise<void> {
    const response = await fetch(`${USER_MANAGEMENT_URL}/channels/me/discord-webhook`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ channelId, discordWebhookUrl: webhookUrl }),
    })

    if (!response.ok) {
      let details: unknown = null
      try {
        details = await response.json()
      } catch {
        details = await response.text()
      }
      throw new DiscordWebhookError(
        `Discord webhook request failed with status ${response.status}`,
        response.status,
        details
      )
    }
  },
}
