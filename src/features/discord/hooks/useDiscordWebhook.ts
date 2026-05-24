import { useState } from 'react'
import { discordWebhookClient, DiscordWebhookError } from '../api/discordWebhookClient'
import { useChannel } from '../../../context/ChannelContext'

export function useDiscordWebhook() {
  const { selectedChannel } = useChannel()
  const [isSaving, setIsSaving] = useState(false)
  const [successKey, setSuccessKey] = useState<string | null>(null)
  const [errorKey, setErrorKey] = useState<string | null>(null)

  const register = async (webhookUrl: string | null) => {
    if (!selectedChannel) return
    setIsSaving(true)
    setSuccessKey(null)
    setErrorKey(null)
    try {
      await discordWebhookClient.register(selectedChannel.id, webhookUrl)
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
