import { Copy, ExternalLink, CircleHelp, Menu, Trophy, Zap } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useUserAchievements } from '../profile/hooks/useUserAchievements'
import {
  buildLeaderboardEntries,
  buildPanelAchievementEntries,
} from '../achievements/utils/achievementLeaderboard'
import { useChannel } from '../../context/ChannelContext'
import { buildPublicPanelUrl } from './utils/publicPanelLink'
import { buildTwitchExtensionPanelUrl } from './utils/twitchExtensionLink'

interface TwitchOverlayProps {
  onOpenSidebar: () => void
}

function clampProgress(value: number) {
  return Math.max(0, Math.min(value, 100))
}

export function TwitchOverlay({ onOpenSidebar }: Readonly<TwitchOverlayProps>) {
  const { selectedChannel } = useChannel()
  const { t } = useLanguage()
  const { achievements, isLoading, errorMessage } = useUserAchievements()
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    },
    []
  )

  const leaderboard = buildLeaderboardEntries(achievements, t)
  const panelAchievements = buildPanelAchievementEntries(achievements, t)
  const panelUrl =
    selectedChannel && typeof window !== 'undefined'
      ? buildPublicPanelUrl(selectedChannel.id, window.location.origin)
      : ''
  const extensionUrl =
    typeof window === 'undefined'
      ? ''
      : buildTwitchExtensionPanelUrl(
          globalThis._env_?.FRONT_URL || import.meta.env.FRONT_URL || window.location.origin
        )

  const handleCopyLink = async () => {
    if (!panelUrl || !navigator.clipboard?.writeText) {
      return
    }

    try {
      await navigator.clipboard.writeText(panelUrl)
      setCopyState('copied')
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = globalThis.setTimeout(() => setCopyState('idle'), 2000)
    } catch {
      // clipboard unavailable — no feedback change
    }
  }

  const unlockedCount = achievements.filter(achievement => achievement.userState.finished).length
  const hiddenCount = achievements.filter(
    achievement => achievement.secret && !achievement.userState.finished
  ).length
  const currentXP = achievements.reduce(
    (total, achievement) => total + (achievement.userState.finished ? achievement.reward : 0),
    0
  )

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
                  {t('overlay.title')}
                </h1>
                <p className="text-gray-400 dark:text-gray-600 text-sm sm:text-base">
                  {selectedChannel
                    ? t('overlay.subtitle.channel', { channel: selectedChannel.name })
                    : t('overlay.subtitle.connected')}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#2d2d31] bg-[#0e0e10] px-3 py-2 text-xs text-gray-300 dark:border-gray-200 dark:bg-white dark:text-gray-700">
              <div className="h-2.5 w-2.5 rounded-full bg-[#ff4444] shadow-[0_0_0_4px_rgba(255,68,68,0.15)]" />
              {t('overlay.liveBadge')}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-[#2d2d31] bg-[#18181b] p-4 sm:p-6 dark:border-gray-200 dark:bg-white">
                <div className="text-sm text-gray-400 dark:text-gray-600">
                  {t('overlay.metric.achievements')}
                </div>
                <div className="mt-2 text-2xl text-white dark:text-gray-900">
                  {unlockedCount} / {achievements.length}
                </div>
              </div>
              <div className="rounded-2xl border border-[#2d2d31] bg-[#18181b] p-4 sm:p-6 dark:border-gray-200 dark:bg-white">
                <div className="text-sm text-gray-400 dark:text-gray-600">
                  {t('overlay.metric.hidden')}
                </div>
                <div className="mt-2 text-2xl text-white dark:text-gray-900">{hiddenCount}</div>
              </div>
              <div className="rounded-2xl border border-[#2d2d31] bg-[#18181b] p-4 sm:p-6 dark:border-gray-200 dark:bg-white">
                <div className="text-sm text-gray-400 dark:text-gray-600">
                  {t('overlay.metric.xp')}
                </div>
                <div className="mt-2 text-2xl text-white dark:text-gray-900">{currentXP}</div>
              </div>
              <div className="rounded-2xl border border-[#2d2d31] bg-[#18181b] p-4 sm:p-6 dark:border-gray-200 dark:bg-white">
                <div className="text-sm text-gray-400 dark:text-gray-600">
                  {t('overlay.metric.rank')}
                </div>
                <div className="mt-2 flex items-center gap-2 text-2xl text-white dark:text-gray-900">
                  <Zap className="h-5 w-5 text-[#9146FF]" />
                  {t('overlay.status.live')}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#2d2d31] bg-[#18181b] p-4 sm:p-6 dark:border-gray-200 dark:bg-white">
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
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

              <div className="flex items-center gap-3 rounded-2xl border border-[#2d2d31] bg-[#0f0f12] px-4 py-3 text-sm text-gray-300 dark:border-gray-200 dark:bg-gray-50 dark:text-gray-700">
                <ExternalLink className="h-4 w-4 flex-shrink-0 text-[#9146FF]" />
                <span className="min-w-0 break-all">{panelUrl}</span>
              </div>
            </div>

            <div className="rounded-3xl border border-[#2d2d31] bg-[#18181b] p-4 sm:p-6 dark:border-gray-200 dark:bg-white">
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h2 className="text-xl text-white dark:text-gray-900">
                    {t('overlay.extension.section')}
                  </h2>
                  <p className="text-sm text-gray-400 dark:text-gray-600">
                    {t('overlay.extension.description')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[#2d2d31] bg-[#0f0f12] px-4 py-3 text-sm text-gray-300 dark:border-gray-200 dark:bg-gray-50 dark:text-gray-700">
                <ExternalLink className="h-4 w-4 flex-shrink-0 text-[#9146FF]" />
                <span className="min-w-0 break-all">{extensionUrl}</span>
              </div>
              <div className="mt-3 text-xs text-gray-400 dark:text-gray-600">
                {t('overlay.extension.note')}
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

            {!isLoading && !errorMessage && achievements.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#2d2d31] p-8 text-center text-gray-400 dark:border-gray-200 dark:text-gray-600">
                {t('overlay.empty')}
              </div>
            )}

            {!isLoading && !errorMessage && achievements.length > 0 && (
              <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
                <div className="rounded-3xl border border-[#2d2d31] bg-[#18181b] p-4 sm:p-6 dark:border-gray-200 dark:bg-white">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl text-white dark:text-gray-900">
                        {t('overlay.section.viewerAchievements')}
                      </h2>
                      <p className="text-sm text-gray-400 dark:text-gray-600">
                        {t('overlay.section.viewerDescription')}
                      </p>
                    </div>
                    <div className="rounded-full border border-[#2d2d31] px-3 py-1 text-xs text-gray-300 dark:border-gray-200 dark:text-gray-700">
                      {t('overlay.totalSuffix', { count: achievements.length })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {panelAchievements.map(achievement => (
                      <div
                        key={achievement.id}
                        className={`rounded-2xl border p-4 transition-colors ${
                          achievement.isUnlocked
                            ? 'border-[#9146FF]/50 bg-[#9146FF]/10'
                            : 'border-[#2d2d31] bg-[#0f0f12] dark:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-xl font-semibold ${
                              achievement.isHidden
                                ? 'bg-[#2d2d31] text-white dark:bg-gray-200 dark:text-gray-900'
                                : 'bg-gradient-to-br from-[#9146FF] to-[#772ce8] text-white'
                            }`}
                          >
                            {achievement.avatar}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="truncate text-base text-white dark:text-gray-900">
                                  {achievement.title}
                                </h3>
                                <p className="text-sm text-gray-400 dark:text-gray-600">
                                  {achievement.description}
                                </p>
                              </div>
                              {achievement.isHidden ? (
                                <CircleHelp className="h-5 w-5 flex-shrink-0 text-[#ffd700]" />
                              ) : (
                                <Trophy className="h-5 w-5 flex-shrink-0 text-[#ffd700]" />
                              )}
                            </div>

                            <div className="mt-3 space-y-2">
                              <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-600">
                                <span>{achievement.progressText}</span>
                                <span>{achievement.reward} XP</span>
                              </div>
                              <div className="h-2 rounded-full bg-[#2d2d31] dark:bg-gray-200">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#9146FF] to-[#772ce8]"
                                  style={{
                                    width: `${clampProgress(achievement.progressPercent)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-[#2d2d31] bg-[#18181b] p-4 sm:p-6 dark:border-gray-200 dark:bg-white">
                  <div className="mb-4">
                    <h2 className="text-xl sm:text-2xl text-white dark:text-gray-900">
                      {t('overlay.leaderboard')}
                    </h2>
                    <p className="text-sm text-gray-400 dark:text-gray-600">
                      {t('overlay.leaderboardDescription')}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {leaderboard.map(entry => (
                      <div
                        key={entry.rank}
                        className={`flex items-center gap-3 rounded-2xl border p-3 ${
                          entry.isUnlocked
                            ? 'border-[#9146FF]/50 bg-[#9146FF]/10'
                            : 'border-[#2d2d31] bg-[#0f0f12] dark:bg-gray-50'
                        }`}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2d2d31] text-sm text-white dark:bg-gray-200 dark:text-gray-900">
                          #{entry.rank}
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#9146FF] to-[#772ce8] text-sm text-white">
                          {entry.avatar}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm text-white dark:text-gray-900">
                            {entry.title}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-600">
                            {entry.status}
                          </div>
                        </div>
                        <div className="text-right text-sm text-[#ffd700]">{entry.xp} XP</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
