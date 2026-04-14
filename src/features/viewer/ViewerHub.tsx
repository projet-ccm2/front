import { Copy, ExternalLink, Eye, Menu, Trophy } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { buildPublicPanelUrl } from '../overlay/utils/publicPanelLink'
import { buildViewerChannelSummaries } from './utils/viewerHub'
import { useViewerHub } from './hooks/useViewerHub'

interface ViewerHubProps {
  onOpenSidebar: () => void
}

export function ViewerHub({ onOpenSidebar }: Readonly<ViewerHubProps>) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { achievements, isLoading, errorMessage } = useViewerHub()
  const [copyState, setCopyState] = useState<string | null>(null)

  const summaries = buildViewerChannelSummaries(achievements)
  const totalAchievements = achievements.length
  const unlockedAchievements = achievements.filter(
    achievement => achievement.userState.finished
  ).length
  const activeChannels = summaries.length
  const xp = achievements.reduce(
    (total, achievement) => total + (achievement.userState.finished ? achievement.reward : 0),
    0
  )

  const handleCopyLink = async (channelId: string) => {
    if (!user || !navigator.clipboard?.writeText || typeof window === 'undefined') {
      return
    }

    const url = `${buildPublicPanelUrl(channelId, window.location.origin)}?viewerId=${encodeURIComponent(
      user.userId
    )}`

    await navigator.clipboard.writeText(url)
    setCopyState(channelId)
    globalThis.setTimeout(() => setCopyState(null), 2000)
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 overflow-auto bg-[#0e0e10] dark:bg-gray-50">
        <div className="bg-[#18181b] dark:bg-white border-b border-[#2d2d31] dark:border-gray-200 px-4 sm:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={onOpenSidebar}
                data-testid="mobile-menu-btn"
                className="lg:hidden text-white dark:text-gray-900 flex-shrink-0"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl text-white dark:text-gray-900 mb-2">
                  {t('viewerHub.title')}
                </h1>
                <p className="text-gray-400 dark:text-gray-600 text-sm sm:text-base">
                  {t('viewerHub.subtitle')}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#2d2d31] bg-[#0e0e10] px-3 py-2 text-xs text-gray-300 dark:border-gray-200 dark:bg-white dark:text-gray-700">
              <Eye className="h-4 w-4 text-[#9146FF]" />
              {t('viewerHub.badge')}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard label={t('viewerHub.metrics.channels')} value={activeChannels} />
              <SummaryCard label={t('viewerHub.metrics.total')} value={totalAchievements} />
              <SummaryCard label={t('viewerHub.metrics.unlocked')} value={unlockedAchievements} />
              <SummaryCard label={t('viewerHub.metrics.xp')} value={xp} />
            </div>

            {isLoading && (
              <div className="rounded-2xl border border-[#2d2d31] bg-[#18181b] p-6 text-gray-400 dark:border-gray-200 dark:bg-white dark:text-gray-600">
                {t('viewerHub.loading')}
              </div>
            )}

            {!isLoading && errorMessage && (
              <div className="rounded-2xl border border-[#ff4444]/40 bg-[#ff4444]/10 p-4 text-[#ff8080] dark:text-[#b42318]">
                {errorMessage}
              </div>
            )}

            {!isLoading && !errorMessage && summaries.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#2d2d31] p-8 text-center text-gray-400 dark:border-gray-200 dark:text-gray-600">
                {t('viewerHub.empty')}
              </div>
            )}

            {!isLoading && !errorMessage && summaries.length > 0 && (
              <div className="grid gap-4">
                {summaries.map(summary => {
                  const panelUrl =
                    typeof window === 'undefined'
                      ? ''
                      : `${buildPublicPanelUrl(summary.channelId, window.location.origin)}?viewerId=${encodeURIComponent(
                          user?.userId ?? ''
                        )}`

                  return (
                    <section
                      key={summary.channelId}
                      className="rounded-3xl border border-[#2d2d31] bg-[#18181b] p-4 sm:p-6 dark:border-gray-200 dark:bg-white"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9146FF] to-[#772ce8] text-white">
                              <Trophy className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <h2 className="truncate text-xl text-white dark:text-gray-900">
                                {t('viewerHub.channelLabel', { channelId: summary.channelId })}
                              </h2>
                              <p className="text-sm text-gray-400 dark:text-gray-600">
                                {t('viewerHub.channelDescription', {
                                  unlocked: summary.unlockedAchievements,
                                  total: summary.totalAchievements,
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <MiniStat
                              label={t('viewerHub.channelUnlocked')}
                              value={summary.unlockedAchievements}
                            />
                            <MiniStat
                              label={t('viewerHub.channelProgress')}
                              value={summary.inProgressAchievements}
                            />
                            <MiniStat
                              label={t('viewerHub.channelHidden')}
                              value={summary.hiddenAchievements}
                            />
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {summary.achievements.slice(0, 4).map(achievement => (
                              <span
                                key={achievement.id}
                                className="inline-flex items-center rounded-full border border-[#2d2d31] bg-[#0f0f12] px-3 py-1 text-xs text-gray-300 dark:border-gray-200 dark:bg-gray-50 dark:text-gray-700"
                              >
                                {achievement.secret && !achievement.userState.finished
                                  ? '?'
                                  : achievement.title}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 lg:min-w-72">
                          <a
                            href={panelUrl}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#9146FF] px-4 py-2 text-sm text-white transition-colors hover:bg-[#772ce8]"
                          >
                            <ExternalLink className="h-4 w-4" />
                            {t('viewerHub.openPanel')}
                          </a>
                          <button
                            type="button"
                            onClick={() => void handleCopyLink(summary.channelId)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#2d2d31] bg-[#0f0f12] px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-[#18181b] dark:border-gray-200 dark:bg-gray-50 dark:text-gray-700 dark:hover:bg-gray-100"
                          >
                            <Copy className="h-4 w-4" />
                            {copyState === summary.channelId
                              ? t('viewerHub.copied')
                              : t('viewerHub.copyPanel')}
                          </button>
                          <div className="rounded-2xl border border-dashed border-[#2d2d31] p-4 text-xs text-gray-400 dark:border-gray-200 dark:text-gray-600">
                            {t('viewerHub.panelHint')}
                          </div>
                        </div>
                      </div>
                    </section>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <div className="rounded-2xl border border-[#2d2d31] bg-[#18181b] p-4 sm:p-6 dark:border-gray-200 dark:bg-white">
      <div className="text-sm text-gray-400 dark:text-gray-600">{label}</div>
      <div className="mt-2 text-2xl text-white dark:text-gray-900">{value}</div>
    </div>
  )
}

function MiniStat({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <div className="rounded-2xl border border-[#2d2d31] bg-[#0f0f12] p-4 dark:border-gray-200 dark:bg-gray-50">
      <div className="text-xs text-gray-400 dark:text-gray-600">{label}</div>
      <div className="mt-2 text-lg text-white dark:text-gray-900">{value}</div>
    </div>
  )
}
