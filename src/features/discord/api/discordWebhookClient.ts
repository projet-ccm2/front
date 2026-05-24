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

async function fetchGcpIdentityToken(audience: string): Promise<string> {
  const metadataUrl = `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=${encodeURIComponent(audience)}`
  const response = await fetch(metadataUrl, {
    headers: { 'Metadata-Flavor': 'Google' },
  })
  if (!response.ok) {
    throw new DiscordWebhookError(
      `Failed to fetch GCP identity token: ${response.status}`,
      response.status
    )
  }
  return response.text()
}

export const discordWebhookClient = {
  async register(channelId: string, webhookUrl: string | null): Promise<void> {
    const identityToken = await fetchGcpIdentityToken(USER_MANAGEMENT_URL)
    const response = await fetch(`${USER_MANAGEMENT_URL}/channels/me/discord-webhook`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${identityToken}`,
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
