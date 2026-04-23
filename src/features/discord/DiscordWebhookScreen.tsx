import { useState } from 'react'
import { Menu, MessageSquare } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useDiscordWebhook } from './hooks/useDiscordWebhook'

interface DiscordWebhookScreenProps {
  onOpenSidebar?: () => void
}

const DISCORD_WEBHOOK_PREFIX = 'https://discord.com/api/webhooks/'

export function DiscordWebhookScreen({ onOpenSidebar }: Readonly<DiscordWebhookScreenProps>) {
  const { t } = useLanguage()
  const { register, isSaving, successKey, errorKey } = useDiscordWebhook()
  const [webhookUrl, setWebhookUrl] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSave = async () => {
    const trimmed = webhookUrl.trim()
    if (trimmed === '') {
      await register(null)
      return
    }
    if (!trimmed.startsWith(DISCORD_WEBHOOK_PREFIX)) {
      setValidationError('discord.webhook.error.validation')
      return
    }
    setValidationError(null)
    await register(trimmed)
  }

  const handleRemove = async () => {
    setWebhookUrl('')
    setValidationError(null)
    await register(null)
  }

  const displayErrorKey = validationError ?? errorKey

  return (
    <div className="flex min-h-screen flex-col bg-[#0e0e10] text-[#efeff1] dark:bg-gray-50 dark:text-gray-900">
      <div className="border-b border-[#2d2d31] bg-[#18181b] px-4 py-6 dark:border-gray-200 dark:bg-white sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          {onOpenSidebar && (
            <button
              onClick={onOpenSidebar}
              data-testid="mobile-menu-btn"
              className="lg:hidden text-white dark:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9146FF] to-[#772ce8] text-white">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-gray-400 dark:text-gray-600">
                {t('discord.webhook.title')}
              </div>
              <h1 className="mt-1 text-2xl text-white dark:text-gray-900">
                {t('discord.webhook.title')}
              </h1>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-600">
                {t('discord.webhook.description')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-8">
        <div className="rounded-3xl border border-[#2d2d31] bg-[#18181b] p-5 sm:p-6 dark:border-gray-200 dark:bg-white">
          <label
            htmlFor="discord-webhook-url"
            className="mb-2 block text-sm text-gray-300 dark:text-gray-700"
          >
            {t('discord.webhook.label')}
          </label>
          <div className="flex gap-2">
            <input
              id="discord-webhook-url"
              type="url"
              value={webhookUrl}
              onChange={e => {
                setWebhookUrl(e.target.value)
                setValidationError(null)
              }}
              placeholder={t('discord.webhook.placeholder')}
              disabled={isSaving}
              className="flex-1 rounded-xl border border-[#2d2d31] bg-[#0f0f12] px-4 py-2 text-sm text-gray-300 placeholder:text-gray-600 focus:border-[#9146FF] focus:outline-none dark:border-gray-200 dark:bg-gray-50 dark:text-gray-700 disabled:opacity-50"
            />
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-xl bg-[#9146FF] px-4 py-2 text-sm text-white transition-colors hover:bg-[#772ce8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? t('discord.webhook.saving') : t('discord.webhook.save')}
            </button>
          </div>

          {webhookUrl && (
            <button
              onClick={handleRemove}
              disabled={isSaving}
              className="mt-2 text-xs text-gray-500 hover:text-gray-300 dark:hover:text-gray-600 disabled:opacity-50"
            >
              {t('discord.webhook.remove')}
            </button>
          )}

          <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">
            {t('discord.webhook.hint')}
          </p>

          {displayErrorKey && (
            <p className="mt-3 rounded-xl border border-[#ff4444]/40 bg-[#ff4444]/10 px-4 py-3 text-sm text-[#ff8080] dark:text-[#b42318]">
              {t(displayErrorKey)}
            </p>
          )}

          {!displayErrorKey && successKey && (
            <p className="mt-3 rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-400 dark:text-green-700">
              {t(successKey)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
