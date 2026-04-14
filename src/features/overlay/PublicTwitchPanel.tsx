import { Copy, ExternalLink, Menu, ShieldAlert, Trophy } from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useChannelAchievements } from '../achievements/hooks/useChannelAchievements'
import {
  buildPanelAchievementEntries,
  buildPublicPanelEntries,
} from '../achievements/utils/achievementLeaderboard'
import { buildPublicPanelUrl } from './utils/publicPanelLink'
import { usePublicViewerAchievements } from './hooks/usePublicViewerAchievements'

interface PublicTwitchPanelProps {
  channelId: string
  viewerId?: string | null
  onOpenSidebar?: () => void
}

export function PublicTwitchPanel({
  channelId,
  viewerId = null,
  onOpenSidebar,
}: Readonly<PublicTwitchPanelProps>) {
  const { t, language } = useLanguage()
  const { achievements, isLoading, errorMessage } = useChannelAchievements(channelId)
  const {
    achievements: viewerAchievements,
    isLoading: isViewerLoading,
    errorMessage: viewerErrorMessage,
  } = usePublicViewerAchievements(channelId, viewerId)
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')

  const panelUrl =
    typeof window === 'undefined' ? '' : buildPublicPanelUrl(channelId, window.location.origin)
  const entries = buildPublicPanelEntries(achievements, t)
  const viewerEntries = buildPanelAchievementEntries(viewerAchievements, t)
  const activeCount = achievements.filter(achievement => achievement.active).length
  const publicCount = achievements.filter(achievement => achievement.public).length
  const hiddenCount = achievements.filter(achievement => achievement.secret).length
  const viewerTitle = language === 'fr' ? 'Progression du viewer' : 'Viewer Progress'
  const viewerDescription =
    language === 'fr'
      ? 'Quand lâ€™identitÃ© du viewer est disponible, le panneau peut afficher sa progression personnelle.'
      : 'When the viewer identity is available, the panel can show personal progress for the connected Twitch user.'
  const viewerHint =
    language === 'fr'
      ? 'Ce panneau a besoin dâ€™un viewerId ou dâ€™un contexte dâ€™extension Twitch pour personnaliser la progression.'
      : 'This browser panel needs a viewer id or Twitch extension context to personalize progress.'
  const viewerEmpty =
    language === 'fr'
      ? 'Aucune progression de viewer nâ€™est disponible pour le moment.'
      : 'No viewer progress is available yet.'

  const handleCopyLink = async () => {
    if (!panelUrl || !navigator.clipboard?.writeText) {
      return
    }

    await navigator.clipboard.writeText(panelUrl)
    setCopyState('copied')
    globalThis.setTimeout(() => setCopyState('idle'), 2000)
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
                {t('overlay.public.badge')}
              </div>
              <h1 className="mt-2 text-2xl text-white dark:text-gray-900">
                {t('overlay.public.title')}
              </h1>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-600">
                {t('overlay.public.subtitle')}
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-[#2d2d31] px-3 py-2 text-xs text-gray-300 dark:border-gray-200 dark:text-gray-700 sm:flex">
            <ExternalLink className="h-4 w-4 text-[#9146FF]" />
            {t('overlay.public.copyHint')}
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#2d2d31] bg-[#18181b] p-4 sm:p-6 dark:border-gray-200 dark:bg-white">
            <div className="text-sm text-gray-400 dark:text-gray-600">
              {t('overlay.metric.achievements')}
            </div>
            <div className="mt-2 text-2xl text-white dark:text-gray-900">{achievements.length}</div>
          </div>
          <div className="rounded-2xl border border-[#2d2d31] bg-[#18181b] p-4 sm:p-6 dark:border-gray-200 dark:bg-white">
            <div className="text-sm text-gray-400 dark:text-gray-600">
              {t('marketplace.active')}
            </div>
            <div className="mt-2 text-2xl text-white dark:text-gray-900">{activeCount}</div>
          </div>
          <div className="rounded-2xl border border-[#2d2d31] bg-[#18181b] p-4 sm:p-6 dark:border-gray-200 dark:bg-white">
            <div className="text-sm text-gray-400 dark:text-gray-600">
              {t('marketplace.visible')}
            </div>
            <div className="mt-2 text-2xl text-white dark:text-gray-900">{publicCount}</div>
          </div>
          <div className="rounded-2xl border border-[#2d2d31] bg-[#18181b] p-4 sm:p-6 dark:border-gray-200 dark:bg-white">
            <div className="text-sm text-gray-400 dark:text-gray-600">
              {t('overlay.metric.hidden')}
            </div>
            <div className="mt-2 text-2xl text-white dark:text-gray-900">{hiddenCount}</div>
          </div>
        </div>

        <div className="rounded-3xl border border-[#2d2d31] bg-[#18181b] p-4 dark:border-gray-200 dark:bg-white sm:p-6">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl text-white dark:text-gray-900">
                {t('overlay.public.linkSection')}
              </h2>
              <p className="text-sm text-gray-400 dark:text-gray-600">
                {t('overlay.public.linkDescription')}
              </p>
            </div>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#9146FF] px-4 py-2 text-sm text-white transition-colors hover:bg-[#772ce8]"
            >
              <Copy className="h-4 w-4" />
              {copyState === 'copied' ? t('overlay.public.copied') : t('overlay.public.copy')}
            </button>
          </div>

          <div className="rounded-2xl border border-[#2d2d31] bg-[#0f0f12] px-4 py-3 text-sm text-gray-300 dark:border-gray-200 dark:bg-gray-50 dark:text-gray-700">
            {panelUrl}
          </div>
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-[#2d2d31] bg-[#18181b] p-6 text-gray-400 dark:border-gray-200 dark:bg-white dark:text-gray-600">
            {t('overlay.loading')}
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="rounded-2xl border border-[#ff4444]/40 bg-[#ff4444]/10 p-4 text-[#ff8080] dark:text-[#b42318]">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && entries.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#2d2d31] p-8 text-center text-gray-400 dark:border-gray-200 dark:text-gray-600">
            {t('overlay.public.empty')}
          </div>
        )}

        {!isLoading && !errorMessage && entries.length > 0 && (
          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            <div className="rounded-3xl border border-[#2d2d31] bg-[#18181b] p-4 dark:border-gray-200 dark:bg-white sm:p-6">
              <div className="mb-4">
                <h2 className="text-xl sm:text-2xl text-white dark:text-gray-900">
                  {t('overlay.public.achievements')}
                </h2>
                <p className="text-sm text-gray-400 dark:text-gray-600">
                  {t('overlay.public.achievementsDescription')}
                </p>
              </div>

              <div className="space-y-3">
                {entries.map(entry => (
                  <div
                    key={entry.id}
                    className={`rounded-2xl border p-4 ${
                      entry.isHidden
                        ? 'border-[#2d2d31] bg-[#0f0f12] dark:bg-gray-50'
                        : 'border-[#9146FF]/50 bg-[#9146FF]/10'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-xl font-semibold ${
                          entry.isHidden
                            ? 'bg-[#2d2d31] text-white dark:bg-gray-200 dark:text-gray-900'
                            : 'bg-gradient-to-br from-[#9146FF] to-[#772ce8] text-white'
                        }`}
                      >
                        {entry.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-base text-white dark:text-gray-900">
                              {entry.title}
                            </h3>
                            <p className="text-sm text-gray-400 dark:text-gray-600">
                              {entry.description}
                            </p>
                          </div>
                          {entry.isHidden ? (
                            <ShieldAlert className="h-5 w-5 flex-shrink-0 text-[#ffd700]" />
                          ) : (
                            <Trophy className="h-5 w-5 flex-shrink-0 text-[#ffd700]" />
                          )}
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-gray-400 dark:text-gray-600">
                          <span>{entry.status}</span>
                          <span>{entry.reward} XP</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#2d2d31] bg-[#18181b] p-4 dark:border-gray-200 dark:bg-white sm:p-6">
              <div className="mb-4">
                <h2 className="text-xl sm:text-2xl text-white dark:text-gray-900">
                  {t('overlay.public.howToTitle')}
                </h2>
                <p className="text-sm text-gray-400 dark:text-gray-600">
                  {t('overlay.public.howToDescription')}
                </p>
              </div>

              <div className="space-y-3 text-sm text-gray-300 dark:text-gray-700">
                <div className="rounded-2xl border border-[#2d2d31] bg-[#0f0f12] p-4 dark:border-gray-200 dark:bg-gray-50">
                  {t('overlay.public.step1')}
                </div>
                <div className="rounded-2xl border border-[#2d2d31] bg-[#0f0f12] p-4 dark:border-gray-200 dark:bg-gray-50">
                  {t('overlay.public.step2')}
                </div>
                <div className="rounded-2xl border border-[#2d2d31] bg-[#0f0f12] p-4 dark:border-gray-200 dark:bg-gray-50">
                  {t('overlay.public.step3')}
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-dashed border-[#2d2d31] p-4 text-xs text-gray-400 dark:border-gray-200 dark:text-gray-600">
                {t('overlay.public.note')}
              </div>
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-[#2d2d31] bg-[#18181b] p-4 dark:border-gray-200 dark:bg-white sm:p-6">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl text-white dark:text-gray-900">{viewerTitle}</h2>
            <p className="text-sm text-gray-400 dark:text-gray-600">{viewerDescription}</p>
          </div>

          {!viewerId && (
            <div className="rounded-2xl border border-dashed border-[#2d2d31] p-4 text-sm text-gray-400 dark:border-gray-200 dark:text-gray-600">
              {viewerHint}
            </div>
          )}

          {viewerId && isViewerLoading && (
            <div className="rounded-2xl border border-[#2d2d31] bg-[#0f0f12] p-4 text-gray-400 dark:border-gray-200 dark:bg-gray-50 dark:text-gray-600">
              {t('overlay.loading')}
            </div>
          )}

          {viewerId && !isViewerLoading && viewerErrorMessage && (
            <div className="rounded-2xl border border-[#ff4444]/40 bg-[#ff4444]/10 p-4 text-[#ff8080] dark:text-[#b42318]">
              {viewerErrorMessage}
            </div>
          )}

          {viewerId && !isViewerLoading && !viewerErrorMessage && viewerEntries.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#2d2d31] p-4 text-sm text-gray-400 dark:border-gray-200 dark:text-gray-600">
              {viewerEmpty}
            </div>
          )}

          {viewerId && !isViewerLoading && !viewerErrorMessage && viewerEntries.length > 0 && (
            <div className="space-y-3">
              {viewerEntries.map(entry => (
                <div
                  key={entry.id}
                  className={`rounded-2xl border p-4 ${
                    entry.isUnlocked
                      ? 'border-[#9146FF]/50 bg-[#9146FF]/10'
                      : 'border-[#2d2d31] bg-[#0f0f12] dark:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-xl font-semibold ${
                        entry.isHidden
                          ? 'bg-[#2d2d31] text-white dark:bg-gray-200 dark:text-gray-900'
                          : 'bg-gradient-to-br from-[#9146FF] to-[#772ce8] text-white'
                      }`}
                    >
                      {entry.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-base text-white dark:text-gray-900">
                            {entry.title}
                          </h3>
                          <p className="text-sm text-gray-400 dark:text-gray-600">
                            {entry.description}
                          </p>
                        </div>
                        {entry.isHidden ? (
                          <ShieldAlert className="h-5 w-5 flex-shrink-0 text-[#ffd700]" />
                        ) : (
                          <Trophy className="h-5 w-5 flex-shrink-0 text-[#ffd700]" />
                        )}
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-600">
                          <span>{entry.progressText}</span>
                          <span>{entry.reward} XP</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#2d2d31] dark:bg-gray-200">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#9146FF] to-[#772ce8]"
                            style={{ width: `${entry.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
