import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Lock,
  Medal,
  Menu,
  Star,
  Trophy,
  Zap,
} from 'lucide-react'
import { useState, useRef, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { buildPublicPanelUrl } from '../overlay/utils/publicPanelLink'
import { useViewerHub } from './hooks/useViewerHub'
import { buildViewerChannelSummaries } from './utils/viewerHub'
import type { UserAchievement } from '../achievements/api/achievementManagement.types'

interface ViewerHubProps {
  onOpenSidebar: () => void
}

type AchievementFilter = 'all' | 'progress' | 'completed'

export function ViewerHub({ onOpenSidebar }: Readonly<ViewerHubProps>) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { achievements, isLoading, errorMessage } = useViewerHub()
  const [filter, setFilter] = useState<AchievementFilter>('all')
  const [copyState, setCopyState] = useState<string | null>(null)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (copyTimerRef.current) clearTimeout(copyTimerRef.current) }, [])

  const summaries = buildViewerChannelSummaries(achievements)
  const completedCount = achievements.filter(a => a.userState.finished).length
  const inProgressCount = achievements.filter(
    a => !a.userState.finished && a.userState.progressCount > 0
  ).length
  const totalXP = achievements.reduce(
    (sum, a) => sum + (a.userState.finished ? a.reward : 0),
    0
  )

  const filteredAchievements = useMemo(() => {
    const base =
      filter === 'progress'
        ? achievements.filter(a => !a.userState.finished && a.userState.progressCount > 0)
        : filter === 'completed'
          ? achievements.filter(a => a.userState.finished)
          : [...achievements]

    return base.sort((a, b) => {
      const scoreA = a.userState.finished ? 1 : a.userState.progressCount > 0 ? 0 : 2
      const scoreB = b.userState.finished ? 1 : b.userState.progressCount > 0 ? 0 : 2
      return scoreA - scoreB
    })
  }, [achievements, filter])

  const handleCopyLink = async (channelId: string) => {
    if (!user || !navigator.clipboard?.writeText || typeof window === 'undefined') return
    const url = `${buildPublicPanelUrl(channelId, window.location.origin)}?viewerId=${encodeURIComponent(user.userId)}`
    try {
      await navigator.clipboard.writeText(url)
      setCopyState(channelId)
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = globalThis.setTimeout(() => setCopyState(null), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0e10] dark:bg-gray-50">
      {/* ── Header ─────────────────────────────────── */}
      <div className="border-b border-[#2d2d31] bg-[#18181b] dark:border-gray-200 dark:bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenSidebar}
              data-testid="mobile-menu-btn"
              className="flex-shrink-0 text-white lg:hidden dark:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold text-white sm:text-3xl dark:text-gray-900">
                {t('viewerHub.title')}
              </h1>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-600">
                {t('viewerHub.subtitle')}
              </p>
            </div>
          </div>

          {/* My stats */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={<Trophy className="h-4 w-4" />}
              label={t('viewerHub.metrics.unlocked')}
              value={completedCount}
              accent="purple"
            />
            <StatCard
              icon={<Zap className="h-4 w-4" />}
              label={t('viewerHub.metrics.xp')}
              value={`${totalXP} XP`}
              accent="yellow"
            />
            <StatCard
              icon={<Star className="h-4 w-4" />}
              label={t('viewerHub.metrics.channels')}
              value={summaries.length}
              accent="blue"
            />
            <StatCard
              icon={<Medal className="h-4 w-4" />}
              label={t('viewerHub.metrics.total')}
              value={achievements.length}
              accent="default"
            />
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Loading */}
        {isLoading && (
          <div className="rounded-xl border border-[#2d2d31] bg-[#18181b] p-8 text-center text-sm text-gray-400 dark:border-gray-200 dark:bg-white dark:text-gray-600">
            {t('viewerHub.loading')}
          </div>
        )}

        {/* Error */}
        {!isLoading && errorMessage && (
          <div className="rounded-xl border border-[#ff4444]/30 bg-[#ff4444]/10 p-4 text-sm text-[#ff8080] dark:text-[#b42318]">
            {errorMessage}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !errorMessage && achievements.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#2d2d31] p-12 text-center text-sm text-gray-500 dark:border-gray-300 dark:text-gray-400">
            {t('viewerHub.empty')}
          </div>
        )}

        {/* Main content */}
        {!isLoading && !errorMessage && achievements.length > 0 && (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* ── Left: achievement list ── */}
            <div className="min-w-0 flex-1 space-y-4">
              {/* Filter tabs */}
              <div className="flex items-center gap-1 rounded-xl border border-[#2d2d31] bg-[#18181b] p-1 dark:border-gray-200 dark:bg-white">
                {(
                  [
                    { key: 'all', label: 'Tous', count: achievements.length },
                    { key: 'progress', label: 'En cours', count: inProgressCount },
                    { key: 'completed', label: t('viewerHub.metrics.unlocked'), count: completedCount },
                  ] as const
                ).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={[
                      'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      filter === tab.key
                        ? 'bg-[#9146FF] text-white'
                        : 'text-gray-400 hover:text-white dark:hover:text-gray-900',
                    ].join(' ')}
                  >
                    {tab.label}
                    <span
                      className={[
                        'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                        filter === tab.key
                          ? 'bg-white/20 text-white'
                          : 'bg-[#2d2d31] text-gray-400 dark:bg-gray-200 dark:text-gray-600',
                      ].join(' ')}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Achievement rows */}
              <div className="space-y-2">
                {filteredAchievements.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#2d2d31] p-8 text-center text-sm text-gray-500 dark:border-gray-300">
                    Aucun achievement dans cette catégorie.
                  </div>
                ) : (
                  filteredAchievements.map(achievement => (
                    <AchievementItem
                      key={achievement.id}
                      achievement={achievement}
                      channelName={getChannelDisplayName(achievement.channelId, user?.channel)}
                      t={t}
                    />
                  ))
                )}
              </div>
            </div>

            {/* ── Right: ranking + panel links ── */}
            <div className="w-full flex-shrink-0 space-y-4 lg:w-72">
              {/* Channel ranking */}
              {summaries.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-[#2d2d31] bg-[#18181b] dark:border-gray-200 dark:bg-white">
                  <div className="flex items-center justify-between border-b border-[#2d2d31] px-4 py-3 dark:border-gray-200">
                    <div className="flex items-center gap-2 text-sm font-medium text-white dark:text-gray-900">
                      <Trophy className="h-4 w-4 text-[#9146FF]" />
                      Classement
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {summaries.length} chaîne{summaries.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="divide-y divide-[#2d2d31] dark:divide-gray-200">
                    {summaries.map((summary, index) => {
                      const channelName = getChannelDisplayName(summary.channelId, user?.channel)
                      const pct =
                        summary.totalAchievements > 0
                          ? Math.round(
                              (summary.unlockedAchievements / summary.totalAchievements) * 100
                            )
                          : 0

                      return (
                        <div key={summary.channelId} className="flex items-center gap-3 px-4 py-3">
                          <RankBadge rank={index + 1} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate text-sm text-white dark:text-gray-900">
                                {channelName}
                              </span>
                              <span className="flex-shrink-0 text-xs text-gray-400 dark:text-gray-600">
                                {summary.unlockedAchievements}/{summary.totalAchievements}
                              </span>
                            </div>
                            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#2d2d31] dark:bg-gray-200">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#9146FF] to-[#c084fc]"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          <span className="flex-shrink-0 text-xs font-medium text-[#c084fc]">
                            {summary.xp} XP
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Panel share per channel */}
              {summaries.map(summary => {
                const channelName = getChannelDisplayName(summary.channelId, user?.channel)
                const panelUrl =
                  typeof window === 'undefined'
                    ? ''
                    : `${buildPublicPanelUrl(summary.channelId, window.location.origin)}?viewerId=${encodeURIComponent(user?.userId ?? '')}`

                return (
                  <div
                    key={summary.channelId}
                    className="rounded-xl border border-[#2d2d31] bg-[#18181b] p-4 dark:border-gray-200 dark:bg-white"
                  >
                    <p className="mb-3 truncate text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Panel — {channelName}
                    </p>
                    <div className="flex gap-2">
                      <a
                        href={panelUrl}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#9146FF] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#772ce8]"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {t('viewerHub.openPanel')}
                      </a>
                      <button
                        type="button"
                        onClick={() => void handleCopyLink(summary.channelId)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#2d2d31] bg-[#0f0f12] px-3 py-2 text-xs font-medium text-gray-300 transition-colors hover:bg-[#2d2d31] dark:border-gray-200 dark:bg-gray-50 dark:text-gray-700 dark:hover:bg-gray-100"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {copyState === summary.channelId
                          ? t('viewerHub.copied')
                          : t('viewerHub.copyPanel')}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  accent,
}: Readonly<{
  icon: ReactNode
  label: string
  value: string | number
  accent: 'purple' | 'yellow' | 'blue' | 'default'
}>) {
  const iconClass = {
    purple: 'bg-[#9146FF]/15 text-[#9146FF]',
    yellow: 'bg-[#ffd700]/15 text-[#ffd700]',
    blue: 'bg-[#60a5fa]/15 text-[#60a5fa]',
    default: 'bg-[#2d2d31] text-gray-400 dark:bg-gray-200',
  }[accent]

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#2d2d31] bg-[#0f0f12] px-4 py-3 dark:border-gray-200 dark:bg-gray-50">
      <div className={`rounded-lg p-2 ${iconClass}`}>{icon}</div>
      <div className="min-w-0">
        <div className="text-lg font-semibold leading-none text-white dark:text-gray-900">
          {value}
        </div>
        <div className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">{label}</div>
      </div>
    </div>
  )
}

function RankBadge({ rank }: Readonly<{ rank: number }>) {
  const cls =
    rank === 1
      ? 'bg-[#ffd700]/15 text-[#ffd700]'
      : rank === 2
        ? 'bg-gray-400/15 text-gray-300'
        : rank === 3
          ? 'bg-[#cd7f32]/15 text-[#cd7f32]'
          : 'bg-[#2d2d31] text-gray-500 dark:bg-gray-200 dark:text-gray-400'

  return (
    <span
      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${cls}`}
    >
      {rank}
    </span>
  )
}

function AchievementItem({
  achievement,
  channelName,
  t,
}: Readonly<{
  achievement: UserAchievement
  channelName: string
  t: (key: string, params?: Record<string, string | number>) => string
}>) {
  const hidden = achievement.secret && !achievement.userState.finished
  const isCompleted = achievement.userState.finished
  const isInProgress = !isCompleted && achievement.userState.progressCount > 0
  const pct = isCompleted
    ? 100
    : Math.min(100, (achievement.userState.progressCount / Math.max(achievement.goal, 1)) * 100)
  const src = getAchievementVisualSource(achievement)

  return (
    <div
      className={[
        'flex items-start gap-3 rounded-xl border p-3 transition-colors',
        isCompleted
          ? 'border-[#1f8a70]/40 bg-[#1f8a70]/5 dark:border-[#1f8a70]/30 dark:bg-[#1f8a70]/5'
          : isInProgress
            ? 'border-[#9146FF]/30 bg-[#9146FF]/5'
            : 'border-[#2d2d31] bg-[#18181b] dark:border-gray-200 dark:bg-white',
      ].join(' ')}
    >
      {/* Thumbnail */}
      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl">
        <img src={src} alt="" className="h-full w-full object-cover" />
        {hidden && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Lock className="h-4 w-4 text-white/50" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-medium text-white dark:text-gray-900">
                {hidden ? t('overlay.hiddenFallback') : achievement.title}
              </span>
              {isCompleted && (
                <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-[#2dd4bf]" />
              )}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{channelName}</span>
          </div>
          <span className="flex-shrink-0 rounded-full bg-[#2d2d31] px-2 py-0.5 text-[11px] text-[#c084fc] dark:bg-gray-200 dark:text-[#7c3aed]">
            {achievement.reward} XP
          </span>
        </div>

        {/* Progress */}
        <div className="mt-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-[#2d2d31] dark:bg-gray-200">
            <div
              className={[
                'h-full rounded-full transition-all',
                isCompleted
                  ? 'bg-gradient-to-r from-[#1f8a70] to-[#2dd4bf]'
                  : 'bg-gradient-to-r from-[#9146FF] to-[#c084fc]',
              ].join(' ')}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
            <span>
              {isCompleted
                ? t('viewerHub.achievement.unlocked')
                : hidden
                  ? t('viewerHub.achievement.locked')
                  : `${achievement.userState.progressCount} / ${achievement.goal}`}
            </span>
            {!isCompleted && !hidden && <span>{Math.round(pct)}%</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Utilities ───────────────────────────────────────────────

function getChannelDisplayName(
  channelId: string | undefined,
  channel?: { id: string; name: string }
): string {
  if (!channelId || channelId === 'unknown') return 'Unknown channel'
  if (channel && channel.id === channelId) return channel.name
  return channelId
}

function getAchievementVisualSource(achievement: {
  title: string
  image: string | null
  secret: boolean
  userState: { progressCount: number; finished: boolean }
}) {
  const trimmedImage = achievement.image?.trim()
  if (trimmedImage && isRenderableImageSource(trimmedImage)) {
    return trimmedImage
  }
  return buildFallbackAchievementArtwork(achievement)
}

function isRenderableImageSource(source: string) {
  return (
    source.startsWith('data:') ||
    source.startsWith('blob:') ||
    source.startsWith('http://') ||
    source.startsWith('https://') ||
    source.startsWith('/')
  )
}

function buildFallbackAchievementArtwork(achievement: {
  title: string
  secret: boolean
  userState: { progressCount: number; finished: boolean }
}) {
  const initials = achievement.title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2)

  const colors = achievement.userState.finished
    ? ['#1f8a70', '#2dd4bf']
    : achievement.userState.progressCount > 0
      ? ['#9146FF', '#c084fc']
      : achievement.secret
        ? ['#3f3f46', '#6b7280']
        : ['#0f172a', '#334155']

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" fill="none">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${colors[0]}" />
          <stop offset="100%" stop-color="${colors[1]}" />
        </linearGradient>
      </defs>
      <rect width="640" height="480" rx="40" fill="url(#bg)" />
      <circle cx="530" cy="90" r="110" fill="rgba(255,255,255,0.12)" />
      <circle cx="120" cy="360" r="130" fill="rgba(255,255,255,0.08)" />
      <text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="140" font-family="Arial, sans-serif" font-weight="700">${initials || 'SQ'}</text>
      <text x="50%" y="67%" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.82)" font-size="28" font-family="Arial, sans-serif">Stream Quest</text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}
