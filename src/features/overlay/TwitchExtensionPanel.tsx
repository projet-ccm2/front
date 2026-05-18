import { Copy, ExternalLink, Menu, Puzzle } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { PublicTwitchPanel } from './PublicTwitchPanel'
import { buildTwitchExtensionPanelUrl } from './utils/twitchExtensionLink'
import { FRONT_URL } from '../../config/environment'

interface TwitchExtensionPanelProps {
  onOpenSidebar?: () => void
}

function getPreviewChannelId(search: string) {
  const params = new URLSearchParams(search)
  const channelId = params.get('channelId')
  return channelId?.trim() ? channelId.trim() : null
}

function getPreviewViewerId(search: string) {
  const params = new URLSearchParams(search)
  const viewerId = params.get('viewerId')
  return viewerId?.trim() ? viewerId.trim() : null
}

export function TwitchExtensionPanel({ onOpenSidebar }: Readonly<TwitchExtensionPanelProps>) {
  const { t } = useLanguage()
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    },
    []
  )

  const previewChannelId = getPreviewChannelId(globalThis.location.search)
  const previewViewerId = getPreviewViewerId(globalThis.location.search)
  const extensionUrl =
    globalThis.window === undefined ? '' : buildTwitchExtensionPanelUrl(FRONT_URL)

  const handleCopyLink = async () => {
    if (!extensionUrl || !navigator.clipboard?.writeText) {
      return
    }

    try {
      await navigator.clipboard.writeText(extensionUrl)
      setCopyState('copied')
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = globalThis.setTimeout(() => setCopyState('idle'), 2000)
    } catch {
      // clipboard unavailable — no feedback change
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0e0e10] text-[#efeff1] dark:bg-gray-50 dark:text-gray-900">
      <div className="border-b border-[#2d2d31] bg-[#18181b] px-4 py-6 dark:border-gray-200 dark:bg-white sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {onOpenSidebar && (
              <button
                onClick={onOpenSidebar}
                data-testid="mobile-menu-btn"
                className="lg:hidden text-white dark:text-gray-900"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-gray-400 dark:text-gray-600">
                {t('overlay.extension.title')}
              </div>
              <h1 className="mt-2 text-2xl text-white dark:text-gray-900">
                {t('overlay.extension.title')}
              </h1>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-600">
                {t('overlay.extension.subtitle')}
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-[#2d2d31] px-3 py-2 text-xs text-gray-300 dark:border-gray-200 dark:text-gray-700 sm:flex">
            <Puzzle className="h-4 w-4 text-[#9146FF]" />
            Extension ready
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-8">
        <div className="rounded-3xl border border-[#2d2d31] bg-[#18181b] p-4 sm:p-6 dark:border-gray-200 dark:bg-white">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl text-white dark:text-gray-900">
                {t('overlay.extension.section')}
              </h2>
              <p className="text-sm text-gray-400 dark:text-gray-600">
                {t('overlay.extension.description')}
              </p>
            </div>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#9146FF] px-4 py-2 text-sm text-white transition-colors hover:bg-[#772ce8]"
            >
              <Copy className="h-4 w-4" />
              {copyState === 'copied' ? t('overlay.extension.copied') : t('overlay.extension.copy')}
            </button>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#2d2d31] bg-[#0f0f12] px-4 py-3 text-sm text-gray-300 dark:border-gray-200 dark:bg-gray-50 dark:text-gray-700">
            <ExternalLink className="h-4 w-4 flex-shrink-0 text-[#9146FF]" />
            <span className="min-w-0 break-all">{extensionUrl}</span>
          </div>
        </div>

        {previewChannelId ? (
          <PublicTwitchPanel channelId={previewChannelId} viewerId={previewViewerId} />
        ) : (
          <div className="rounded-3xl border border-dashed border-[#2d2d31] bg-[#18181b] p-6 text-sm text-gray-400 dark:border-gray-200 dark:bg-white dark:text-gray-600">
            {t('overlay.extension.note')}
          </div>
        )}
      </div>
    </div>
  )
}
