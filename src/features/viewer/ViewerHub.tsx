import {
  CheckCircle2,
  ChevronRight,
  Lock,
  Medal,
  Menu,
  Star,
  Trophy,
  Zap,
} from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useViewerHub } from './hooks/useViewerHub'
import { buildViewerChannelSummaries } from './utils/viewerHub'
import type { ViewerChannelSummary } from './utils/viewerHub'
import type { UserAchievement } from '../achievements/api/achievementManagement.types'

interface ViewerHubProps {
  onOpenSidebar: () => void
}

type AchievementFilter = 'all' | 'progress' | 'completed'

export function ViewerHub({ onOpenSidebar }: Readonly<ViewerHubProps>) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { achievements, isLoading, errorMessage } = useViewerHub()
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)
  const [filter, setFilter] = useState<AchievementFilter>('all')

  useEffect(() => { setFilter('all') }, [selectedChannelId])

  const summaries = buildViewerChannelSummaries(achievements)
  const completedCount = achievements.filter(a => a.userState.finished).length
  const inProgressCount = achievements.filter(
    a => !a.userState.finished && a.userState.progressCount > 0
  ).length
  const totalXP = achievements.reduce(
    (sum, a) => sum + (a.userState.finished ? a.reward : 0),
    0
  )

  const selectedSummary = selectedChannelId
    ? (summaries.find(s => s.channelId === selectedChannelId) ?? null)
    : null

  const channelAchievements = selectedSummary?.achievements ?? achievements

  const filteredAchievements = useMemo(() => {
    const base =
      filter === 'progress'
        ? channelAchievements.filter(a => !a.userState.finished && a.userState.progressCount > 0)
        : filter === 'completed'
          ? channelAchievements.filter(a => a.userState.finished)
          : [...channelAchievements]

    return base.sort((a, b) => {
      const scoreA = a.userState.finished ? 0 : a.userState.progressCount > 0 ? 1 : 2
      const scoreB = b.userState.finished ? 0 : b.userState.progressCount > 0 ? 1 : 2
      return scoreA - scoreB
    })
  }, [channelAchievements, filter])

  const getChannelName = (channelId: string) =>
    getChannelDisplayName(channelId, user?.channel)

  return (
    <div className="flex min-h-screen flex-col bg-[#09090b] dark:bg-gray-100">
      {/* ── Hero Header ─────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/5 bg-gradient-to-br from-[#1a0533] via-[#0f0f15] to-[#09090b] dark:from-violet-50 dark:via-white dark:to-gray-100 dark:border-gray-200">
        {/* Decorative glow blobs */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#9146FF]/20 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-48 w-96 rounded-full bg-[#c084fc]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSidebar}
              data-testid="mobile-menu-btn"
              className="flex-shrink-0 rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white lg:hidden dark:text-gray-500 dark:hover:bg-gray-100 dark:hover:text-gray-900"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-3xl font-black tracking-tight text-transparent dark:from-gray-900 dark:to-gray-600">
                {t('viewerHub.title')}
              </h1>
              <p className="mt-0.5 text-sm text-white/40 dark:text-gray-500">
                {t('viewerHub.subtitle')}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard icon={<Trophy className="h-5 w-5" />} label={t('viewerHub.metrics.unlocked')} value={completedCount} accent="purple" />
            <StatCard icon={<Zap className="h-5 w-5" />} label={t('viewerHub.metrics.xp')} value={`${totalXP} XP`} accent="yellow" />
            <StatCard icon={<Star className="h-5 w-5" />} label={t('viewerHub.metrics.channels')} value={summaries.length} accent="blue" />
            <StatCard icon={<Medal className="h-5 w-5" />} label={t('viewerHub.metrics.total')} value={achievements.length} accent="default" />
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────── */}
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-16 sm:px-6">
        {isLoading && (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-16 text-sm text-white/40 dark:border-gray-200 dark:bg-white dark:text-gray-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#9146FF]/30 border-t-[#9146FF]" />
            {t('viewerHub.loading')}
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-400 dark:text-red-600">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && achievements.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center text-sm text-white/30 dark:border-gray-300 dark:text-gray-400">
            {t('viewerHub.empty')}
          </div>
        )}

        {!isLoading && !errorMessage && achievements.length > 0 && (
          <div className="flex gap-5 lg:items-start">

            {/* ── Left: channel sidebar (desktop) ── */}
            <div className="hidden w-64 flex-shrink-0 lg:block">
              <div className="sticky top-6 overflow-hidden rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm dark:border-gray-200 dark:bg-white">
                <div className="px-4 py-3">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-white/30 dark:text-gray-400">
                    Channels
                  </span>
                </div>

                {/* All channels */}
                <button
                  type="button"
                  onClick={() => setSelectedChannelId(null)}
                  className={[
                    'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-all',
                    selectedChannelId === null
                      ? 'bg-[#9146FF]/15'
                      : 'hover:bg-white/5 dark:hover:bg-gray-50',
                  ].join(' ')}
                >
                  <div className={[
                    'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl',
                    selectedChannelId === null
                      ? 'bg-[#9146FF] shadow-lg shadow-[#9146FF]/30'
                      : 'bg-white/8 dark:bg-gray-100',
                  ].join(' ')}>
                    <Trophy className={`h-4 w-4 ${selectedChannelId === null ? 'text-white' : 'text-white/50 dark:text-gray-500'}`} />
                  </div>
                  <span className={[
                    'flex-1 truncate text-sm font-semibold',
                    selectedChannelId === null ? 'text-white dark:text-violet-700' : 'text-white/60 dark:text-gray-600',
                  ].join(' ')}>
                    Vue d'ensemble
                  </span>
                  {selectedChannelId === null && (
                    <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-[#9146FF]" />
                  )}
                </button>

                <div className="mx-3 border-t border-white/8 dark:border-gray-100" />

                {/* Channel list */}
                <div className="space-y-0.5 p-2">
                  {summaries.map((summary, index) => {
                    const name = getChannelName(summary.channelId)
                    const pct = summary.totalAchievements > 0
                      ? Math.round((summary.unlockedAchievements / summary.totalAchievements) * 100)
                      : 0
                    const isSelected = selectedChannelId === summary.channelId

                    return (
                      <button
                        key={summary.channelId}
                        type="button"
                        onClick={() => setSelectedChannelId(summary.channelId)}
                        className={[
                          'flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-all',
                          isSelected ? 'bg-[#9146FF]/15' : 'hover:bg-white/5 dark:hover:bg-gray-50',
                        ].join(' ')}
                      >
                        <div className="relative flex-shrink-0">
                          <ChannelAvatar name={name} size="md" />
                          <RankBadge rank={index + 1} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className={[
                              'truncate text-sm font-semibold',
                              isSelected ? 'text-white dark:text-violet-700' : 'text-white/70 dark:text-gray-700',
                            ].join(' ')}>
                              {name}
                            </span>
                            <span className="flex-shrink-0 text-[10px] font-medium text-white/30 dark:text-gray-400">
                              {pct}%
                            </span>
                          </div>
                          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/8 dark:bg-gray-200">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#9146FF] to-[#c084fc]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {isSelected && (
                          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-[#9146FF]" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ── Main content ── */}
            <div className="min-w-0 flex-1 space-y-4">
              {/* Mobile: horizontal channel tabs */}
              <div className="lg:hidden">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setSelectedChannelId(null)}
                    className={[
                      'flex flex-shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all',
                      selectedChannelId === null
                        ? 'bg-[#9146FF] text-white shadow-lg shadow-[#9146FF]/30'
                        : 'border border-white/10 bg-white/5 text-white/50 hover:text-white dark:border-gray-200 dark:bg-white dark:text-gray-500',
                    ].join(' ')}
                  >
                    <Trophy className="h-3.5 w-3.5" />
                    Vue d'ensemble
                  </button>

                  {summaries.map((summary, index) => {
                    const name = getChannelName(summary.channelId)
                    const isSelected = selectedChannelId === summary.channelId
                    return (
                      <button
                        key={summary.channelId}
                        type="button"
                        onClick={() => setSelectedChannelId(summary.channelId)}
                        className={[
                          'flex flex-shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all',
                          isSelected
                            ? 'bg-[#9146FF] text-white shadow-lg shadow-[#9146FF]/30'
                            : 'border border-white/10 bg-white/5 text-white/50 hover:text-white dark:border-gray-200 dark:bg-white dark:text-gray-500',
                        ].join(' ')}
                      >
                        <ChannelAvatar name={name} size="sm" />
                        <span className="max-w-[100px] truncate">{name}</span>
                        {!isSelected && (
                          <span className="rounded-md bg-white/10 px-1 text-[9px] font-bold text-white/40 dark:bg-gray-100 dark:text-gray-400">
                            #{index + 1}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Content: overview or channel detail */}
              {selectedSummary === null ? (
                <OverviewPanel
                  summaries={summaries}
                  filter={filter}
                  setFilter={setFilter}
                  filteredAchievements={filteredAchievements}
                  completedCount={completedCount}
                  inProgressCount={inProgressCount}
                  totalCount={achievements.length}
                  getChannelName={getChannelName}
                  onSelectChannel={setSelectedChannelId}
                  t={t}
                />
              ) : (
                <ChannelDetailView
                  summary={selectedSummary}
                  filter={filter}
                  setFilter={setFilter}
                  filteredAchievements={filteredAchievements}
                  inProgressCount={selectedSummary.inProgressAchievements}
                  getChannelName={getChannelName}
                  t={t}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Overview panel ───────────────────────────────────────────

function OverviewPanel({
  summaries,
  filter,
  setFilter,
  filteredAchievements,
  completedCount,
  inProgressCount,
  totalCount,
  getChannelName,
  onSelectChannel,
  t,
}: Readonly<{
  summaries: ViewerChannelSummary[]
  filter: AchievementFilter
  setFilter: (f: AchievementFilter) => void
  filteredAchievements: UserAchievement[]
  completedCount: number
  inProgressCount: number
  totalCount: number
  getChannelName: (id: string) => string
  onSelectChannel: (id: string) => void
  t: (key: string, params?: Record<string, string | number>) => string
}>) {
  const tabs: { key: AchievementFilter; label: string; count: number }[] = [
    { key: 'all', label: 'Tous', count: totalCount },
    { key: 'progress', label: t('viewerHub.channelProgress'), count: inProgressCount },
    { key: 'completed', label: t('viewerHub.channelUnlocked'), count: completedCount },
  ]

  return (
    <div className="space-y-5">
      {/* Channel cards grid */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/30 dark:text-gray-400">
            Chaînes suivies
          </span>
          <div className="flex h-5 items-center justify-center rounded-full bg-white/8 px-2 text-[11px] font-bold text-white/40 dark:bg-gray-100 dark:text-gray-500">
            {summaries.length}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {summaries.map((summary, index) => {
            const rank = index + 1
            const name = getChannelName(summary.channelId)
            const pct = summary.totalAchievements > 0
              ? Math.round((summary.unlockedAchievements / summary.totalAchievements) * 100)
              : 0

            const rankStyle =
              rank === 1 ? { glow: 'shadow-[#ffd700]/20', bar: 'from-[#ffd700] to-[#f59e0b]', text: 'text-[#ffd700]', ring: 'ring-[#ffd700]/30' } :
              rank === 2 ? { glow: 'shadow-gray-400/10', bar: 'from-gray-400 to-gray-300', text: 'text-gray-400', ring: 'ring-gray-400/20' } :
              rank === 3 ? { glow: 'shadow-[#cd7f32]/10', bar: 'from-[#cd7f32] to-[#f59e0b]', text: 'text-[#cd7f32]', ring: 'ring-[#cd7f32]/20' } :
                           { glow: '', bar: 'from-[#9146FF] to-[#c084fc]', text: 'text-white/30', ring: '' }

            return (
              <button
                key={summary.channelId}
                type="button"
                onClick={() => onSelectChannel(summary.channelId)}
                className={`group relative overflow-hidden rounded-2xl border border-white/8 bg-white/4 text-left transition-all hover:border-white/15 hover:bg-white/6 hover:shadow-xl ${rankStyle.glow} dark:border-gray-200 dark:bg-white dark:hover:bg-gray-50`}
              >
                {/* Rank accent strip */}
                {rank <= 3 && (
                  <div className={`absolute left-0 top-0 h-0.5 w-full bg-gradient-to-r ${rankStyle.bar}`} />
                )}

                <div className="flex items-center gap-3.5 p-4">
                  <div className="relative flex-shrink-0">
                    <ChannelAvatar name={name} size="lg" />
                    <span className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#09090b] ring-2 ${rankStyle.ring || 'ring-white/10'} text-[10px] font-black dark:bg-white dark:ring-gray-200 ${rankStyle.text}`}>
                      {rank}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold text-white/90 transition-colors group-hover:text-white dark:text-gray-900">
                      {name}
                    </div>
                    <div className="mt-0.5 text-xs text-white/30 dark:text-gray-500">
                      {summary.totalAchievements} succès
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className={`text-lg font-black ${rankStyle.text}`}>{pct}%</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mx-4 h-1.5 overflow-hidden rounded-full bg-white/8 dark:bg-gray-200">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${rankStyle.bar} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Stats strip */}
                <div className="mt-3 grid grid-cols-3 divide-x divide-white/8 dark:divide-gray-100">
                  <div className="flex flex-col items-center py-3">
                    <span className="text-sm font-bold text-[#2dd4bf]">{summary.unlockedAchievements}</span>
                    <span className="mt-0.5 text-[10px] font-medium text-white/30 dark:text-gray-400">{t('viewerHub.channelUnlocked')}</span>
                  </div>
                  <div className="flex flex-col items-center py-3">
                    <span className="text-sm font-bold text-[#c084fc]">{summary.inProgressAchievements}</span>
                    <span className="mt-0.5 text-[10px] font-medium text-white/30 dark:text-gray-400">{t('viewerHub.channelProgress')}</span>
                  </div>
                  <div className="flex flex-col items-center py-3">
                    <span className="text-sm font-bold text-[#fbbf24]">{summary.xp}</span>
                    <span className="mt-0.5 text-[10px] font-medium text-white/30 dark:text-gray-400">XP</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <FilterTabs tabs={tabs} filter={filter} setFilter={setFilter} />

      {/* Achievements grid */}
      {filteredAchievements.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAchievements.map(achievement => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              channelName={getChannelName(achievement.channelId ?? '')}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Channel detail view ──────────────────────────────────────

function ChannelDetailView({
  summary,
  filter,
  setFilter,
  filteredAchievements,
  inProgressCount,
  getChannelName,
  t,
}: Readonly<{
  summary: ViewerChannelSummary
  filter: AchievementFilter
  setFilter: (f: AchievementFilter) => void
  filteredAchievements: UserAchievement[]
  inProgressCount: number
  getChannelName: (id: string) => string
  t: (key: string, params?: Record<string, string | number>) => string
}>) {
  const channelName = getChannelName(summary.channelId)
  const pct = summary.totalAchievements > 0
    ? Math.round((summary.unlockedAchievements / summary.totalAchievements) * 100)
    : 0

  const tabs: { key: AchievementFilter; label: string; count: number }[] = [
    { key: 'all', label: 'Tous', count: summary.totalAchievements },
    { key: 'progress', label: t('viewerHub.channelProgress'), count: inProgressCount },
    { key: 'completed', label: t('viewerHub.channelUnlocked'), count: summary.unlockedAchievements },
  ]

  return (
    <div className="space-y-4">
      {/* Channel header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/4 dark:border-gray-200 dark:bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#9146FF]/10 via-transparent to-transparent" />
        <div className="relative flex items-center gap-4 p-5">
          <ChannelAvatar name={channelName} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 dark:text-gray-400">
              {t('viewerHub.channelLabel', { channelName })}
            </p>
            <h2 className="truncate text-xl font-black text-white dark:text-gray-900">
              {channelName}
            </h2>
            <p className="mt-0.5 text-sm text-white/40 dark:text-gray-500">
              {t('viewerHub.channelDescription', {
                unlocked: summary.unlockedAchievements,
                total: summary.totalAchievements,
              })}
            </p>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="text-4xl font-black text-[#9146FF]">{pct}%</div>
            <div className="text-xs text-white/30 dark:text-gray-400">complété</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative mx-5 mb-0 h-2 overflow-hidden rounded-full bg-white/8 dark:bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#9146FF] to-[#c084fc] transition-all"
            style={{ width: `${pct}%` }}
          />
          {/* Glow */}
          <div
            className="absolute inset-y-0 rounded-full bg-gradient-to-r from-[#9146FF]/60 to-[#c084fc]/60 blur-sm"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 divide-x divide-white/8 border-t border-white/8 dark:divide-gray-100 dark:border-gray-100">
          <div className="flex flex-col items-center py-4">
            <div className="text-2xl font-black text-[#2dd4bf]">{summary.unlockedAchievements}</div>
            <div className="mt-0.5 text-[11px] font-medium text-white/30 dark:text-gray-400">{t('viewerHub.channelUnlocked')}</div>
          </div>
          <div className="flex flex-col items-center py-4">
            <div className="text-2xl font-black text-[#c084fc]">{inProgressCount}</div>
            <div className="mt-0.5 text-[11px] font-medium text-white/30 dark:text-gray-400">{t('viewerHub.channelProgress')}</div>
          </div>
          <div className="flex flex-col items-center py-4">
            <div className="text-2xl font-black text-[#fbbf24]">{summary.xp}</div>
            <div className="mt-0.5 text-[11px] font-medium text-white/30 dark:text-gray-400">XP</div>
          </div>
        </div>
      </div>

      <FilterTabs tabs={tabs} filter={filter} setFilter={setFilter} />

      {filteredAchievements.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAchievements.map(achievement => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              channelName={getChannelName(achievement.channelId ?? '')}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Shared sub-components ────────────────────────────────────

function FilterTabs({
  tabs,
  filter,
  setFilter,
}: Readonly<{
  tabs: { key: AchievementFilter; label: string; count: number }[]
  filter: AchievementFilter
  setFilter: (f: AchievementFilter) => void
}>) {
  return (
    <div className="flex items-center gap-1 rounded-2xl border border-white/8 bg-white/4 p-1.5 dark:border-gray-200 dark:bg-gray-50">
      {tabs.map(tab => (
        <button
          key={tab.key}
          type="button"
          onClick={() => setFilter(tab.key)}
          className={[
            'flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all',
            filter === tab.key
              ? 'bg-[#9146FF] text-white shadow-lg shadow-[#9146FF]/30'
              : 'text-white/40 hover:text-white/70 dark:text-gray-400 dark:hover:text-gray-600',
          ].join(' ')}
        >
          {tab.label}
          <span className={[
            'min-w-[1.5rem] rounded-lg px-1.5 py-0.5 text-[11px] font-bold tabular-nums',
            filter === tab.key
              ? 'bg-white/20 text-white'
              : 'bg-white/8 text-white/30 dark:bg-gray-200 dark:text-gray-500',
          ].join(' ')}>
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 p-14 text-center text-sm text-white/25 dark:border-gray-300 dark:text-gray-400">
      Aucun succès dans cette catégorie.
    </div>
  )
}

// ── Stat card ────────────────────────────────────────────────

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
  const config = {
    purple: { icon: 'bg-[#9146FF]/20 text-[#9146FF]', glow: 'shadow-[#9146FF]/15' },
    yellow: { icon: 'bg-[#fbbf24]/20 text-[#fbbf24]', glow: 'shadow-[#fbbf24]/10' },
    blue:   { icon: 'bg-[#60a5fa]/20 text-[#60a5fa]', glow: 'shadow-[#60a5fa]/10' },
    default:{ icon: 'bg-white/8 text-white/40 dark:bg-gray-100 dark:text-gray-400', glow: '' },
  }[accent]

  return (
    <div className={`flex items-center gap-3.5 rounded-2xl border border-white/8 bg-white/5 px-4 py-3.5 shadow-lg ${config.glow} dark:border-gray-200 dark:bg-white`}>
      <div className={`rounded-xl p-2.5 ${config.icon}`}>{icon}</div>
      <div className="min-w-0">
        <div className="text-xl font-black leading-none text-white dark:text-gray-900">{value}</div>
        <div className="mt-1 truncate text-xs font-medium text-white/35 dark:text-gray-400">{label}</div>
      </div>
    </div>
  )
}

// ── Channel avatar ───────────────────────────────────────────

function ChannelAvatar({ name, size = 'md' }: Readonly<{ name: string; size?: 'sm' | 'md' | 'lg' }>) {
  const initials = name
    .split(/[\s_\-./]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || '?'

  const hue = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360

  const sizeClass = {
    sm: 'h-5 w-5 text-[8px]',
    md: 'h-9 w-9 text-xs',
    lg: 'h-12 w-12 text-sm',
  }[size]

  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-xl font-black text-white ${sizeClass}`}
      style={{ background: `linear-gradient(135deg, hsl(${hue}, 60%, 40%), hsl(${(hue + 30) % 360}, 60%, 30%))` }}
    >
      {initials}
    </div>
  )
}

// ── Rank badge ───────────────────────────────────────────────

function RankBadge({ rank }: Readonly<{ rank: number }>) {
  const cls =
    rank === 1 ? 'text-[#ffd700] bg-[#09090b] ring-[#ffd700]/40 dark:bg-white dark:ring-[#ffd700]/40' :
    rank === 2 ? 'text-gray-400 bg-[#09090b] ring-gray-400/30 dark:bg-white dark:ring-gray-300' :
    rank === 3 ? 'text-[#cd7f32] bg-[#09090b] ring-[#cd7f32]/40 dark:bg-white dark:ring-[#cd7f32]/40' :
                 'text-white/30 bg-[#09090b] ring-white/10 dark:bg-white dark:text-gray-400 dark:ring-gray-200'

  return (
    <span className={`absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full ring-2 text-[9px] font-black ${cls}`}>
      {rank}
    </span>
  )
}

// ── Achievement card ─────────────────────────────────────────

function AchievementCard({
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

  const borderClass = isCompleted
    ? 'border-[#2dd4bf]/30'
    : isInProgress
      ? 'border-[#9146FF]/30'
      : 'border-white/8'

  const barClass = isCompleted
    ? 'from-[#1f8a70] to-[#2dd4bf]'
    : 'from-[#9146FF] to-[#c084fc]'

  const statusBadge = isCompleted ? (
    <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-[#1f8a70]/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
      <CheckCircle2 className="h-2.5 w-2.5" />
      {t('viewerHub.achievement.unlocked')}
    </div>
  ) : isInProgress ? (
    <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-[#9146FF]/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
      <Zap className="h-2.5 w-2.5" />
      En cours
    </div>
  ) : null

  return (
    <div className={`group overflow-hidden rounded-2xl border transition-all hover:border-white/15 hover:shadow-lg ${borderClass} dark:hover:border-gray-300`}>
      {/* Banner */}
      <div className="relative h-28 w-full overflow-hidden bg-[#0f0f12]">
        <img src={src} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* XP badge */}
        <div className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-[#c084fc] backdrop-blur-sm ring-1 ring-white/10">
          {achievement.reward} XP
        </div>

        {statusBadge}

        {/* Hidden overlay */}
        {hidden && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 backdrop-blur-sm">
            <Lock className="h-6 w-6 text-white/40" />
            <span className="text-[11px] font-semibold text-white/40">{t('viewerHub.achievement.locked')}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className={`px-3.5 pb-3.5 pt-3 ${isCompleted ? 'bg-[#1f8a70]/8' : isInProgress ? 'bg-[#9146FF]/8' : 'bg-[#0f0f12] dark:bg-white'}`}>
        <div className="mb-0.5 truncate text-sm font-bold text-white dark:text-gray-900">
          {hidden ? t('overlay.hiddenFallback') : achievement.title}
        </div>
        <div className="mb-3 text-xs font-medium text-white/30 dark:text-gray-400">{channelName}</div>

        {/* Progress bar */}
        <div className="relative h-2 overflow-hidden rounded-full bg-white/8 dark:bg-gray-200">
          <div
            className={`h-full rounded-full bg-gradient-to-r transition-all ${barClass}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[10px] font-medium text-white/25 dark:text-gray-400">
            {isCompleted
              ? t('viewerHub.achievement.unlocked')
              : hidden
                ? t('viewerHub.achievement.locked')
                : `${achievement.userState.progressCount} / ${achievement.goal}`}
          </span>
          <span className={`text-[11px] font-black ${isCompleted ? 'text-[#2dd4bf]' : isInProgress ? 'text-[#c084fc]' : 'text-white/25 dark:text-gray-400'}`}>
            {Math.round(pct)}%
          </span>
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
  if (trimmedImage && isRenderableImageSource(trimmedImage)) return trimmedImage
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
      ? ['#6d28d9', '#9146FF']
      : achievement.secret
        ? ['#1c1c24', '#2d2d3a']
        : ['#0d0d14', '#1a1a2e']

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" fill="none">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${colors[0]}" />
          <stop offset="100%" stop-color="${colors[1]}" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.15)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <rect width="640" height="480" fill="url(#bg)" />
      <rect width="640" height="480" fill="url(#glow)" />
      <circle cx="560" cy="80" r="120" fill="rgba(255,255,255,0.06)" />
      <circle cx="80" cy="400" r="160" fill="rgba(255,255,255,0.04)" />
      <text x="50%" y="46%" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="160" font-family="Arial, sans-serif" font-weight="900">${initials || 'SQ'}</text>
      <text x="50%" y="67%" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="26" font-family="Arial, sans-serif" font-weight="600" letter-spacing="4">STREAM QUEST</text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}
