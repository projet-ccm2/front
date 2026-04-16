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
    <div className="flex min-h-screen flex-col bg-[#0e0e10] dark:bg-gray-50">
      {/* ── Header ─────────────────────────────────── */}
      <div className="border-b border-[#2d2d31] bg-[#18181b] dark:border-gray-200 dark:bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSidebar}
              data-testid="mobile-menu-btn"
              className="flex-shrink-0 text-white lg:hidden dark:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-white dark:text-gray-900">
                {t('viewerHub.title')}
              </h1>
              <p className="mt-0.5 text-sm text-gray-400 dark:text-gray-600">
                {t('viewerHub.subtitle')}
              </p>
            </div>
          </div>

          {/* Global stats */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard icon={<Trophy className="h-4 w-4" />} label={t('viewerHub.metrics.unlocked')} value={completedCount} accent="purple" />
            <StatCard icon={<Zap className="h-4 w-4" />} label={t('viewerHub.metrics.xp')} value={`${totalXP} XP`} accent="yellow" />
            <StatCard icon={<Star className="h-4 w-4" />} label={t('viewerHub.metrics.channels')} value={summaries.length} accent="blue" />
            <StatCard icon={<Medal className="h-4 w-4" />} label={t('viewerHub.metrics.total')} value={achievements.length} accent="default" />
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────── */}
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-12 sm:px-6">
        {isLoading && (
          <div className="rounded-xl border border-[#2d2d31] bg-[#18181b] p-10 text-center text-sm text-gray-400 dark:border-gray-200 dark:bg-white dark:text-gray-600">
            {t('viewerHub.loading')}
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="rounded-xl border border-[#ff4444]/30 bg-[#ff4444]/10 p-4 text-sm text-[#ff8080] dark:text-[#b42318]">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && achievements.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#2d2d31] p-14 text-center text-sm text-gray-500 dark:border-gray-300 dark:text-gray-400">
            {t('viewerHub.empty')}
          </div>
        )}

        {!isLoading && !errorMessage && achievements.length > 0 && (
          <div className="rounded-2xl border border-[#2d2d31] bg-[#18181b]/40 p-4 dark:border-gray-200 dark:bg-white/40">
          <div className="flex gap-5 lg:items-start">

            {/* ── Left: channel sidebar (desktop) ── */}
            <div className="hidden w-60 flex-shrink-0 lg:block">
              <div className="sticky top-6 overflow-hidden rounded-xl border border-[#2d2d31] bg-[#18181b] dark:border-gray-200 dark:bg-white">
                <div className="border-b border-[#2d2d31] px-4 py-3 dark:border-gray-200">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Channels
                  </span>
                </div>

                {/* "All channels" option */}
                <button
                  type="button"
                  onClick={() => setSelectedChannelId(null)}
                  className={[
                    'flex w-full items-center gap-3 border-b border-[#2d2d31] px-4 py-3 text-left transition-colors dark:border-gray-200',
                    selectedChannelId === null
                      ? 'bg-[#9146FF]/10'
                      : 'hover:bg-white/5 dark:hover:bg-gray-100',
                  ].join(' ')}
                >
                  <div className={[
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
                    selectedChannelId === null
                      ? 'bg-[#9146FF]/20 text-[#9146FF]'
                      : 'bg-[#2d2d31] text-gray-400 dark:bg-gray-200',
                  ].join(' ')}>
                    <Trophy className="h-4 w-4" />
                  </div>
                  <span className={[
                    'flex-1 truncate text-sm font-medium',
                    selectedChannelId === null ? 'text-[#9146FF]' : 'text-gray-300 dark:text-gray-700',
                  ].join(' ')}>
                    Vue d'ensemble
                  </span>
                  {selectedChannelId === null && (
                    <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-[#9146FF]" />
                  )}
                </button>

                {/* Channel list */}
                <div className="divide-y divide-[#2d2d31] dark:divide-gray-200">
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
                          'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                          isSelected ? 'bg-[#9146FF]/10' : 'hover:bg-white/5 dark:hover:bg-gray-100',
                        ].join(' ')}
                      >
                        {/* Avatar with rank overlay */}
                        <div className="relative flex-shrink-0">
                          <ChannelAvatar name={name} size="md" />
                          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#18181b] text-[9px] font-bold ring-1 ring-[#2d2d31] dark:bg-white dark:ring-gray-200">
                            <RankNumber rank={index + 1} />
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className={[
                              'truncate text-sm font-medium',
                              isSelected ? 'text-[#9146FF]' : 'text-white dark:text-gray-900',
                            ].join(' ')}>
                              {name}
                            </span>
                            <span className="flex-shrink-0 text-[11px] text-gray-500">
                              {summary.unlockedAchievements}/{summary.totalAchievements}
                            </span>
                          </div>
                          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#2d2d31] dark:bg-gray-200">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#9146FF] to-[#c084fc] transition-all"
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
                      'flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      selectedChannelId === null
                        ? 'bg-[#9146FF] text-white'
                        : 'border border-[#2d2d31] bg-[#18181b] text-gray-400 hover:text-white dark:border-gray-200 dark:bg-white dark:text-gray-600',
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
                          'flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          isSelected
                            ? 'bg-[#9146FF] text-white'
                            : 'border border-[#2d2d31] bg-[#18181b] text-gray-400 hover:text-white dark:border-gray-200 dark:bg-white dark:text-gray-600',
                        ].join(' ')}
                      >
                        <ChannelAvatar name={name} size="sm" />
                        <span className="max-w-[120px] truncate">{name}</span>
                        {!isSelected && (
                          <span className="text-[10px] text-gray-500">#{index + 1}</span>
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
    <div className="space-y-4">
      {/* Channel cards grid */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-[#9146FF]" />
          <span className="font-medium text-white dark:text-gray-900">Chaînes suivies</span>
          <span className="ml-1 text-sm text-gray-500">
            — {summaries.length} chaîne{summaries.length > 1 ? 's' : ''}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {summaries.map((summary, index) => {
            const rank = index + 1
            const name = getChannelName(summary.channelId)
            const pct = summary.totalAchievements > 0
              ? Math.round((summary.unlockedAchievements / summary.totalAchievements) * 100)
              : 0

            const rankAccent =
              rank === 1 ? { border: 'border-t-[#ffd700]', text: 'text-[#ffd700]' } :
              rank === 2 ? { border: 'border-t-gray-400', text: 'text-gray-400' } :
              rank === 3 ? { border: 'border-t-[#cd7f32]', text: 'text-[#cd7f32]' } :
                           { border: 'border-t-[#2d2d31]', text: 'text-gray-600' }

            return (
              <button
                key={summary.channelId}
                type="button"
                onClick={() => onSelectChannel(summary.channelId)}
                className={[
                  'group flex flex-col overflow-hidden rounded-xl border border-t-2 bg-[#18181b] text-left transition-colors hover:bg-[#1f1f23] hover:ring-1 hover:ring-[#9146FF]/40 dark:bg-white dark:hover:bg-gray-50',
                  rankAccent.border,
                  'border-[#2d2d31] dark:border-gray-200',
                ].join(' ')}
              >
                {/* Card header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="relative flex-shrink-0">
                    <ChannelAvatar name={name} size="lg" />
                    <span className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#18181b] text-[10px] font-black ring-1 ring-[#2d2d31] dark:bg-white dark:ring-gray-200 ${rankAccent.text}`}>
                      {rank}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-white group-hover:text-[#c084fc] dark:text-gray-900 dark:group-hover:text-[#7c3aed] transition-colors">
                      {name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {summary.totalAchievements} succès au total
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-600 transition-transform group-hover:translate-x-0.5 group-hover:text-[#9146FF]" />
                </div>

                {/* Progress bar */}
                <div className="mx-4 h-2 overflow-hidden rounded-full bg-[#3a3a3f] dark:bg-gray-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#9146FF] to-[#c084fc]"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Stats strip */}
                <div className="mt-3 grid grid-cols-3 divide-x divide-[#2d2d31] border-t border-[#2d2d31] dark:divide-gray-200 dark:border-gray-200">
                  <div className="flex flex-col items-center py-2.5">
                    <span className="text-sm font-bold text-[#2dd4bf]">{summary.unlockedAchievements}</span>
                    <span className="text-[10px] text-gray-500">{t('viewerHub.channelUnlocked')}</span>
                  </div>
                  <div className="flex flex-col items-center py-2.5">
                    <span className="text-sm font-bold text-[#c084fc]">{summary.inProgressAchievements}</span>
                    <span className="text-[10px] text-gray-500">{t('viewerHub.channelProgress')}</span>
                  </div>
                  <div className="flex flex-col items-center py-2.5">
                    <span className="text-sm font-bold text-[#ffd700]">{summary.xp}</span>
                    <span className="text-[10px] text-gray-500">XP</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-[#2d2d31] bg-[#18181b] p-1 dark:border-gray-200 dark:bg-white">
        {tabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={[
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              filter === tab.key
                ? 'bg-[#9146FF] text-white'
                : 'text-gray-400 hover:text-white dark:hover:text-gray-900',
            ].join(' ')}
          >
            {tab.label}
            <span className={[
              'min-w-[1.25rem] rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums',
              filter === tab.key
                ? 'bg-white text-[#9146FF]'
                : 'bg-[#0e0e10] text-gray-400 ring-1 ring-[#3a3a3f] dark:bg-gray-100 dark:text-gray-600 dark:ring-gray-300',
            ].join(' ')}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* All achievements grid */}
      {filteredAchievements.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#2d2d31] p-10 text-center text-sm text-gray-500 dark:border-gray-300">
          Aucun succès dans cette catégorie.
        </div>
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
      <div className="overflow-hidden rounded-xl border border-[#2d2d31] bg-[#18181b] dark:border-gray-200 dark:bg-white">
        <div className="flex items-center gap-4 px-5 py-4">
          <ChannelAvatar name={channelName} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {t('viewerHub.channelLabel', { channelName })}
            </p>
            <h2 className="truncate text-xl font-bold text-white dark:text-gray-900">
              {channelName}
            </h2>
            <p className="mt-0.5 text-sm text-gray-400 dark:text-gray-600">
              {t('viewerHub.channelDescription', {
                unlocked: summary.unlockedAchievements,
                total: summary.totalAchievements,
              })}
            </p>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="text-3xl font-black text-[#9146FF]">{pct}%</div>
            <div className="text-xs text-gray-500">complété</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mx-5 mb-0 h-2 overflow-hidden rounded-full bg-[#2d2d31] dark:bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#9146FF] to-[#c084fc] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Stats strip */}
        <div className="mt-0 grid grid-cols-3 divide-x divide-[#2d2d31] border-t border-[#2d2d31] dark:divide-gray-200 dark:border-gray-200">
          <div className="flex flex-col items-center gap-0.5 py-3">
            <div className="text-xl font-bold text-[#2dd4bf]">{summary.unlockedAchievements}</div>
            <div className="text-[11px] text-gray-500">{t('viewerHub.channelUnlocked')}</div>
          </div>
          <div className="flex flex-col items-center gap-0.5 py-3">
            <div className="text-xl font-bold text-[#c084fc]">{inProgressCount}</div>
            <div className="text-[11px] text-gray-500">{t('viewerHub.channelProgress')}</div>
          </div>
          <div className="flex flex-col items-center gap-0.5 py-3">
            <div className="text-xl font-bold text-[#ffd700]">{summary.xp}</div>
            <div className="text-[11px] text-gray-500">XP</div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-[#2d2d31] bg-[#18181b] p-1 dark:border-gray-200 dark:bg-white">
        {tabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={[
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              filter === tab.key
                ? 'bg-[#9146FF] text-white'
                : 'text-gray-400 hover:text-white dark:hover:text-gray-900',
            ].join(' ')}
          >
            {tab.label}
            <span className={[
              'min-w-[1.25rem] rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums',
              filter === tab.key
                ? 'bg-white text-[#9146FF]'
                : 'bg-[#0e0e10] text-gray-400 ring-1 ring-[#3a3a3f] dark:bg-gray-100 dark:text-gray-600 dark:ring-gray-300',
            ].join(' ')}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Achievement grid */}
      {filteredAchievements.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#2d2d31] p-10 text-center text-sm text-gray-500 dark:border-gray-300">
          Aucun succès dans cette catégorie.
        </div>
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
  const config = {
    purple: { icon: 'bg-[#9146FF]/15 text-[#9146FF]', border: 'border-t-[#9146FF]' },
    yellow: { icon: 'bg-[#ffd700]/15 text-[#ffd700]', border: 'border-t-[#ffd700]' },
    blue:   { icon: 'bg-[#60a5fa]/15 text-[#60a5fa]', border: 'border-t-[#60a5fa]' },
    default:{ icon: 'bg-[#2d2d31] text-gray-400 dark:bg-gray-200', border: 'border-t-transparent' },
  }[accent]

  return (
    <div className={`flex items-center gap-3 rounded-xl border border-[#2d2d31] border-t-2 bg-[#0f0f12] px-4 py-3 dark:border-gray-200 dark:bg-gray-50 ${config.border}`}>
      <div className={`rounded-lg p-2 ${config.icon}`}>{icon}</div>
      <div className="min-w-0">
        <div className="text-lg font-semibold leading-none text-white dark:text-gray-900">{value}</div>
        <div className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">{label}</div>
      </div>
    </div>
  )
}

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
    md: 'h-8 w-8 text-xs',
    lg: 'h-11 w-11 text-sm',
  }[size]

  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-full font-bold text-white ${sizeClass}`}
      style={{ background: `hsl(${hue}, 50%, 38%)` }}
    >
      {initials}
    </div>
  )
}

function RankNumber({ rank }: Readonly<{ rank: number }>) {
  const cls =
    rank === 1 ? 'text-[#ffd700]' :
    rank === 2 ? 'text-gray-400' :
    rank === 3 ? 'text-[#cd7f32]' :
                 'text-gray-500 dark:text-gray-400'

  return <span className={`font-bold ${cls}`}>{rank}</span>
}

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
    ? 'border-[#1f8a70]/70'
    : isInProgress
      ? 'border-[#9146FF]/60'
      : 'border-[#2d2d31]'

  const bodyClass = isCompleted
    ? 'bg-[#1f8a70]/15'
    : isInProgress
      ? 'bg-[#9146FF]/10'
      : 'bg-[#18181b] dark:bg-white'

  return (
    <div className={`overflow-hidden rounded-xl border transition-colors ${borderClass}`}>
      {/* Banner image */}
      <div className="relative h-24 w-full overflow-hidden bg-[#0f0f12]">
        <img src={src} alt="" className="h-full w-full object-cover" />

        {/* XP badge — top left */}
        <div className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-[#c084fc] backdrop-blur-sm">
          {achievement.reward} XP
        </div>

        {/* Status badge — top right */}
        {isCompleted && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-[#1f8a70]/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
            <CheckCircle2 className="h-2.5 w-2.5" />
            {t('viewerHub.achievement.unlocked')}
          </div>
        )}

        {/* Hidden overlay */}
        {hidden && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/75 backdrop-blur-sm">
            <Lock className="h-5 w-5 text-white/50" />
            <span className="text-[11px] font-medium text-white/50">{t('viewerHub.achievement.locked')}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className={`px-3 pb-3 pt-2.5 ${bodyClass}`}>
        <div className="mb-0.5 truncate text-sm font-semibold text-white dark:text-gray-900">
          {hidden ? t('overlay.hiddenFallback') : achievement.title}
        </div>
        <div className="mb-2 text-xs text-gray-500">{channelName}</div>

        {/* Progress */}
        <div className="h-3 overflow-hidden rounded-full bg-[#3a3a3f] dark:bg-gray-200">
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
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[10px] text-gray-500 dark:text-gray-400">
            {isCompleted
              ? t('viewerHub.achievement.unlocked')
              : hidden
                ? t('viewerHub.achievement.locked')
                : `${achievement.userState.progressCount} / ${achievement.goal}`}
          </span>
          {!isCompleted && !hidden && (
            <span className={`text-xs font-bold ${isInProgress ? 'text-[#c084fc]' : 'text-gray-500'}`}>
              {Math.round(pct)}%
            </span>
          )}
          {isCompleted && (
            <span className="text-xs font-bold text-[#2dd4bf]">100%</span>
          )}
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
