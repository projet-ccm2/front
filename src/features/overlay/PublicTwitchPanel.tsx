import { Copy, ExternalLink, Menu, ShieldAlert, Trophy } from 'lucide-react'
import { useState, useRef, useEffect, type ReactNode } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useChannelAchievements } from '../achievements/hooks/useChannelAchievements'
import {
  buildPanelAchievementEntries,
  buildPublicPanelEntries,
} from '../achievements/utils/achievementLeaderboard'
import { buildPublicPanelUrl } from './utils/publicPanelLink'
import { AchievementThumbnail } from '../achievements/components/AchievementThumbnail'
import { usePublicViewerAchievements } from './hooks/usePublicViewerAchievements'

interface PublicTwitchPanelProps {
  channelId: string
  viewerId?: string | null
  onOpenSidebar?: () => void
}

interface PanelCardProps {
  title: string
  description: string
  avatar: string
  image?: string | null
  reward: number
  isHidden: boolean
  statusLabel?: string
  progressLabel?: string
  progressPercent?: number
}

interface SectionCardProps {
  label: string
  value: string | number
}

export function PublicTwitchPanel({
  channelId,
  viewerId = null,
  onOpenSidebar,
}: Readonly<PublicTwitchPanelProps>) {
  const { t } = useLanguage()
  const { achievements, isLoading, errorMessage } = useChannelAchievements(channelId)
  const {
    achievements: viewerAchievements,
    isLoading: isViewerLoading,
    errorMessage: viewerErrorMessage,
  } = usePublicViewerAchievements(channelId, viewerId)
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    },
    []
  )

  const panelUrl =
    typeof globalThis.window === 'undefined' ? '' : buildPublicPanelUrl(channelId, globalThis.location.origin)
  const entries = buildPublicPanelEntries(achievements, t)
  const viewerEntries = buildPanelAchievementEntries(viewerAchievements, t)
  const activeCount = achievements.filter(achievement => achievement.active).length
  const publicCount = achievements.filter(achievement => achievement.public).length
  const hiddenCount = achievements.filter(achievement => achievement.secret).length
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
          <SectionCard label={t('overlay.metric.achievements')} value={achievements.length} />
          <SectionCard label={t('marketplace.active')} value={activeCount} />
          <SectionCard label={t('marketplace.visible')} value={publicCount} />
          <SectionCard label={t('overlay.metric.hidden')} value={hiddenCount} />
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
                  <PanelAchievementCard
                    key={entry.id}
                    title={entry.title}
                    description={entry.description}
                    avatar={entry.avatar}
                    image={entry.image}
                    reward={entry.reward}
                    isHidden={entry.isHidden}
                    statusLabel={entry.status}
                  />
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
                <PanelNote>{t('overlay.public.step1')}</PanelNote>
                <PanelNote>{t('overlay.public.step2')}</PanelNote>
                <PanelNote>{t('overlay.public.step3')}</PanelNote>
              </div>
              <div className="mt-4 rounded-2xl border border-dashed border-[#2d2d31] p-4 text-xs text-gray-400 dark:border-gray-200 dark:text-gray-600">
                {t('overlay.public.note')}
              </div>
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-[#2d2d31] bg-[#18181b] p-4 dark:border-gray-200 dark:bg-white sm:p-6">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl text-white dark:text-gray-900">
              {t('overlay.viewer.title')}
            </h2>
            <p className="text-sm text-gray-400 dark:text-gray-600">
              {t('overlay.viewer.description')}
            </p>
          </div>

          {!viewerId && (
            <div className="rounded-2xl border border-dashed border-[#2d2d31] p-4 text-sm text-gray-400 dark:border-gray-200 dark:text-gray-600">
              {t('overlay.viewer.hint')}
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
              {t('overlay.viewer.empty')}
            </div>
          )}

          {viewerId && !isViewerLoading && !viewerErrorMessage && viewerEntries.length > 0 && (
            <div className="space-y-3">
              {viewerEntries.map(entry => (
                <PanelAchievementCard
                  key={entry.id}
                  title={entry.title}
                  description={entry.description}
                  avatar={entry.avatar}
                  image={entry.image}
                  reward={entry.reward}
                  isHidden={entry.isHidden}
                  statusLabel={entry.progressText}
                  progressLabel={entry.progressText}
                  progressPercent={entry.progressPercent}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionCard({ label, value }: Readonly<SectionCardProps>) {
  return (
    <div className="rounded-2xl border border-[#2d2d31] bg-[#18181b] p-4 sm:p-6 dark:border-gray-200 dark:bg-white">
      <div className="text-sm text-gray-400 dark:text-gray-600">{label}</div>
      <div className="mt-2 text-2xl text-white dark:text-gray-900">{value}</div>
    </div>
  )
}

function PanelNote({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="rounded-2xl border border-[#2d2d31] bg-[#0f0f12] p-4 dark:border-gray-200 dark:bg-gray-50">
      {children}
    </div>
  )
}

function PanelAchievementCard({
  title,
  description,
  avatar,
  image,
  reward,
  isHidden,
  statusLabel,
  progressLabel,
  progressPercent,
}: Readonly<PanelCardProps>) {
  const hasProgress = typeof progressPercent === 'number'
  const cardBorderClass =
    !hasProgress && isHidden
      ? 'border-[#2d2d31] bg-[#0f0f12] dark:bg-gray-50'
      : 'border-[#9146FF]/50 bg-[#9146FF]/10'

  return (
    <div className={`rounded-2xl border p-4 ${cardBorderClass}`}>
      <div className="flex items-start gap-4">
        {isHidden ? (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-xl font-semibold bg-[#2d2d31] text-white dark:bg-gray-200 dark:text-gray-900">
            {avatar}
          </div>
        ) : (
          <AchievementThumbnail title={title} image={image} className="h-12 w-12" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base text-white dark:text-gray-900">{title}</h3>
              <p className="text-sm text-gray-400 dark:text-gray-600">{description}</p>
            </div>
            {isHidden ? (
              <ShieldAlert className="h-5 w-5 flex-shrink-0 text-[#ffd700]" />
            ) : (
              <Trophy className="h-5 w-5 flex-shrink-0 text-[#ffd700]" />
            )}
          </div>

          {hasProgress ? (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-600">
                <span>{progressLabel}</span>
                <span>{reward} XP</span>
              </div>
              <div className="h-2 rounded-full bg-[#2d2d31] dark:bg-gray-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#9146FF] to-[#772ce8]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="mt-3 flex items-center justify-between text-xs text-gray-400 dark:text-gray-600">
              <span>{statusLabel}</span>
              <span>{reward} XP</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
