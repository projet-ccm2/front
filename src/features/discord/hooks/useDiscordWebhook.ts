import { useState } from 'react'
import { discordWebhookClient, DiscordWebhookError } from '../api/discordWebhookClient'

function getAccessToken(): string | null {
  try {
    const raw = localStorage.getItem('twitch_tokens')
    if (!raw) return null
    return (JSON.parse(raw) as { accessToken: string }).accessToken ?? null
  } catch {
    return null
  }
}

export function useDiscordWebhook() {
  const [isSaving, setIsSaving] = useState(false)
  const [successKey, setSuccessKey] = useState<string | null>(null)
  const [errorKey, setErrorKey] = useState<string | null>(null)

  const register = async (webhookUrl: string | null) => {
    const token = getAccessToken()
    if (!token) return
    setIsSaving(true)
    setSuccessKey(null)
    setErrorKey(null)
    try {
      await discordWebhookClient.register(token, webhookUrl)
      setSuccessKey(webhookUrl === null ? 'discord.webhook.removed' : 'discord.webhook.saved')
    } catch (err) {
      if (err instanceof DiscordWebhookError) {
        if (err.status === 403) setErrorKey('discord.webhook.error.forbidden')
        else if (err.status === 400) setErrorKey('discord.webhook.error.validation')
        else if (err.status === 401) setErrorKey('discord.webhook.error.auth')
        else setErrorKey('discord.webhook.error.service')
      } else {
        setErrorKey('discord.webhook.error.service')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return { register, isSaving, successKey, errorKey }
}
