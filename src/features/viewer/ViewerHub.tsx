import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Lock,
  Medal,
  Menu,
  Star,
  Trophy,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useChannel } from '../../context/ChannelContext'
import { useLanguage } from '../../context/LanguageContext'
import { useUserBadges } from '../badges/hooks/useUserBadges'
import { BadgeThumbnail } from '../badges/components/BadgeThumbnail'
import { useViewerHub } from './hooks/useViewerHub'
import { buildViewerChannelSummaries } from './utils/viewerHub'
import type { ViewerChannelSummary } from './utils/viewerHub'
import type { UserAchievement, Badge } from '../achievements/api/achievementManagement.types'

function sortScore(a: UserAchievement): number {
  if (a.userState.finished) return 0
  if (a.userState.progressCount > 0) return 1
  return 2
}

interface ViewerHubProps {
  onOpenSidebar: () => void
}

type AchievementFilter = 'all' | 'progress' | 'completed'

export function ViewerHub({ onOpenSidebar }: Readonly<ViewerHubProps>) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { availableChannels } = useChannel()
  const { achievements, channelInfoById, isLoading, errorMessage } = useViewerHub()
  const {
    badges,
    isLoading: areBadgesLoading,
    errorMessage: badgesErrorMessage,
  } = useUserBadges(user?.userId ?? null)
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)
  const [filter, setFilter] = useState<AchievementFilter>('all')

  const summaries = buildViewerChannelSummaries(achievements)
  const completedCount = achievements.filter(a => a.userState.finished).length
  const inProgressCount = achievements.filter(
    a => !a.userState.finished && a.userState.progressCount > 0
  ).length
  const totalXP = achievements.reduce((sum, a) => sum + (a.userState.finished ? a.reward : 0), 0)

  const selectedSummary = selectedChannelId
    ? (summaries.find(s => s.channelId === selectedChannelId) ?? null)
    : null

  const channelAchievements = selectedSummary?.achievements ?? achievements

  const filteredAchievements = (() => {
    const base =
      filter === 'progress'
        ? channelAchievements.filter(a => !a.userState.finished && a.userState.progressCount > 0)
        : filter === 'completed'
          ? channelAchievements.filter(a => a.userState.finished)
          : [...channelAchievements]

    return base.sort((a, b) => sortScore(a) - sortScore(b))
  })()

  const getChannelName = (channelId: string): string => {
    const helixInfo = channelInfoById[channelId]
    if (helixInfo) return helixInfo.name
    const direct = availableChannels.find(c => c.id === channelId)
    if (direct) return direct.name
    const asMod = availableChannels.find(c => c.id === `mod-${channelId}`)
    if (asMod) return asMod.name
    return getChannelDisplayName(channelId, user?.channel)
  }

  const getChannelAvatar = (channelId: string): string | undefined => {
    const helixInfo = channelInfoById[channelId]
    if (helixInfo?.avatarUrl) return helixInfo.avatarUrl
    const candidates = [
      availableChannels.find(c => c.id === channelId),
      availableChannels.find(c => c.id === `mod-${channelId}`),
    ]
    for (const channel of candidates) {
      if (channel && isRenderableImageSource(channel.avatar)) return channel.avatar
    }
    return undefined
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0e0e10] dark:bg-gray-50">
      {/* Header */}
      <div className="border-b border-[#2d2d31] bg-[#18181b] px-4 py-6 dark:border-gray-200 dark:bg-white sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenSidebar}
              data-testid="mobile-menu-btn"
              className="flex-shrink-0 text-white lg:hidden dark:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl text-white dark:text-gray-900 sm:text-3xl">
                {t('viewerHub.title')}
              </h1>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-600">
                {t('viewerHub.subtitle')}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              icon={<Trophy className="h-5 w-5 text-[#9146FF]" />}
              label={t('viewerHub.metrics.unlocked')}
              value={completedCount}
              iconBg="bg-[#9146FF]/20"
            />
            <StatCard
              icon={<Zap className="h-5 w-5 text-[#ffd700]" />}
              label={t('viewerHub.metrics.xp')}
              value={`${totalXP} XP`}
              iconBg="bg-[#ffd700]/20"
            />
            <StatCard
              icon={<Star className="h-5 w-5 text-[#60a5fa]" />}
              label={t('viewerHub.metrics.channels')}
              value={summaries.length}
              iconBg="bg-[#60a5fa]/20"
            />
            <StatCard
              icon={<Medal className="h-5 w-5 text-gray-400 dark:text-gray-500" />}
              label={t('viewerHub.metrics.total')}
              value={achievements.length}
              iconBg="bg-[#2d2d31] dark:bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {isLoading && (
          <div className="rounded-xl border border-[#2d2d31] bg-[#18181b] p-10 text-center text-sm text-gray-400 dark:border-gray-200 dark:bg-white dark:text-gray-600">
            {t('viewerHub.loading')}
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="rounded-xl border border-[#ff4444]/40 bg-[#ff4444]/10 p-4 text-sm text-[#ff8080] dark:text-[#b42318]">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && achievements.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#2d2d31] p-14 text-center text-sm text-gray-500 dark:border-gray-300 dark:text-gray-400">
            {t('viewerHub.empty')}
          </div>
        )}

        {!isLoading && !errorMessage && achievements.length > 0 && (
          <div className="flex gap-6 lg:items-start">
            {/* Sidebar channels — desktop */}
            <div className="hidden w-56 flex-shrink-0 lg:block">
              <div className="sticky top-6 overflow-hidden rounded-xl border border-[#2d2d31] bg-[#18181b] dark:border-gray-200 dark:bg-white">
                <div className="border-b border-[#2d2d31] px-4 py-3 dark:border-gray-200">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Channels
                  </span>
                </div>

                {/* All channels */}
                <button
                  type="button"
                  onClick={() => setSelectedChannelId(null)}
                  className={[
                    'flex w-full items-center gap-3 border-b border-[#2d2d31] px-4 py-3 text-left transition-colors dark:border-gray-200',
                    selectedChannelId === null
                      ? 'bg-[#9146FF]/10'
                      : 'hover:bg-[#0e0e10] dark:hover:bg-gray-50',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
                      selectedChannelId === null
                        ? 'bg-[#9146FF]/20 text-[#9146FF]'
                        : 'bg-[#2d2d31] text-gray-400 dark:bg-gray-100',
                    ].join(' ')}
                  >
                    <Trophy className="h-4 w-4" />
                  </div>
                  <span
                    className={[
                      'flex-1 truncate text-sm font-medium',
                      selectedChannelId === null
                        ? 'text-[#9146FF]'
                        : 'text-gray-300 dark:text-gray-700',
                    ].join(' ')}
                  >
                    {t('viewerHub.overview')}
                  </span>
                  {selectedChannelId === null && (
                    <ChevronRight className="h-3.5 w-3.5 text-[#9146FF]" />
                  )}
                </button>

                <div className="divide-y divide-[#2d2d31] dark:divide-gray-200">
                  {summaries.map((summary, index) => {
                    const name = getChannelName(summary.channelId)
                    const pct =
                      summary.totalAchievements > 0
                        ? Math.round(
                            (summary.unlockedAchievements / summary.totalAchievements) * 100
                          )
                        : 0
                    const isSelected = selectedChannelId === summary.channelId

                    return (
                      <button
                        key={summary.channelId}
                        type="button"
                        onClick={() => setSelectedChannelId(summary.channelId)}
                        className={[
                          'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                          isSelected
                            ? 'bg-[#9146FF]/10'
                            : 'hover:bg-[#0e0e10] dark:hover:bg-gray-50',
                        ].join(' ')}
                      >
                        <div className="relative flex-shrink-0">
                          <ChannelAvatar
                            name={name}
                            size="md"
                            profileImageUrl={getChannelAvatar(summary.channelId)}
                          />
                          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#18181b] text-[9px] font-bold ring-1 ring-[#2d2d31] dark:bg-white dark:ring-gray-200">
                            <RankNumber rank={index + 1} />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={[
                                'truncate text-sm font-medium',
                                isSelected ? 'text-[#9146FF]' : 'text-white dark:text-gray-900',
                              ].join(' ')}
                            >
                              {name}
                            </span>
                            <span className="flex-shrink-0 text-[11px] text-gray-500">{pct}%</span>
                          </div>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#2d2d31] dark:bg-gray-200">
                            <div
                              className="h-full rounded-full bg-[#9146FF]"
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

            {/* Main content */}
            <div className="min-w-0 flex-1 space-y-4">
              {/* Mobile: horizontal tabs */}
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
                    {t('viewerHub.overview')}
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
                        <ChannelAvatar
                          name={name}
                          size="sm"
                          profileImageUrl={getChannelAvatar(summary.channelId)}
                        />
                        <span className="max-w-[120px] truncate">{name}</span>
                        {!isSelected && (
                          <span className="text-[10px] text-gray-500">#{index + 1}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

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
                  getChannelAvatar={getChannelAvatar}
                  onSelectChannel={setSelectedChannelId}
                  badges={badges}
                  areBadgesLoading={areBadgesLoading}
                  badgesErrorMessage={badgesErrorMessage}
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
                  getChannelAvatar={getChannelAvatar}
                  onBack={() => setSelectedChannelId(null)}
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
  getChannelAvatar,
  onSelectChannel,
  badges,
  areBadgesLoading,
  badgesErrorMessage,
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
  getChannelAvatar: (id: string) => string | undefined
  onSelectChannel: (id: string) => void
  badges: Badge[]
  areBadgesLoading: boolean
  badgesErrorMessage: string | null
  t: (key: string, params?: Record<string, string | number>) => string
}>) {
  const tabs: { key: AchievementFilter; label: string; count: number }[] = [
    { key: 'all', label: t('viewerHub.all'), count: totalCount },
    { key: 'progress', label: t('viewerHub.channelProgress'), count: inProgressCount },
    { key: 'completed', label: t('viewerHub.channelUnlocked'), count: completedCount },
  ]

  return (
    <div className="space-y-4">
      {/* Badges */}
      <BadgesSection
        badges={badges}
        isLoading={areBadgesLoading}
        errorMessage={badgesErrorMessage}
        t={t}
      />

      {/* Channel cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {summaries.map((summary, index) => {
          const rank = index + 1
          const name = getChannelName(summary.channelId)
          const pct =
            summary.totalAchievements > 0
              ? Math.round((summary.unlockedAchievements / summary.totalAchievements) * 100)
              : 0

          let rankColor: string
          if (rank === 1) rankColor = 'text-[#ffd700]'
          else if (rank === 2) rankColor = 'text-gray-400'
          else if (rank === 3) rankColor = 'text-[#cd7f32]'
          else rankColor = 'text-gray-500'

          return (
            <button
              key={summary.channelId}
              type="button"
              onClick={() => onSelectChannel(summary.channelId)}
              className="group flex flex-col overflow-hidden rounded-xl border border-[#2d2d31] bg-[#18181b] text-left transition-colors hover:border-[#9146FF] dark:border-gray-200 dark:bg-white dark:hover:border-[#9146FF]"
            >
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <ChannelAvatar
                      name={name}
                      size="lg"
                      profileImageUrl={getChannelAvatar(summary.channelId)}
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#18181b] text-[10px] font-bold ring-1 ring-[#2d2d31] dark:bg-white dark:ring-gray-200 ${rankColor}`}
                    >
                      {rank}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-white transition-colors group-hover:text-[#9146FF] dark:text-gray-900">
                      {name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {t('viewerHub.channelTotal', { n: summary.totalAchievements })}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-lg font-bold text-white dark:text-gray-900">{pct}%</div>
                    <div className="text-[11px] text-gray-500">
                      {t('viewerHub.channelCompleted')}
                    </div>
                  </div>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#2d2d31] dark:bg-gray-200">
                  <div className="h-full rounded-full bg-[#9146FF]" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-[#2d2d31] border-t border-[#2d2d31] dark:divide-gray-200 dark:border-gray-200">
                <div className="flex flex-col items-center py-3.5">
                  <span className="text-sm font-bold text-[#00f593]">
                    {summary.unlockedAchievements}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {t('viewerHub.channelUnlocked')}
                  </span>
                </div>
                <div className="flex flex-col items-center py-3.5">
                  <span className="text-sm font-bold text-[#9146FF]">
                    {summary.inProgressAchievements}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {t('viewerHub.channelProgress')}
                  </span>
                </div>
                <div className="flex flex-col items-center py-3.5">
                  <span className="text-sm font-bold text-[#ffd700]">{summary.xp}</span>
                  <span className="text-[10px] text-gray-500">XP</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <FilterTabs tabs={tabs} filter={filter} setFilter={setFilter} />

      {filteredAchievements.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          {filteredAchievements.map(achievement => (
            <AchievementRow
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
  getChannelAvatar,
  onBack,
  t,
}: Readonly<{
  summary: ViewerChannelSummary
  filter: AchievementFilter
  setFilter: (f: AchievementFilter) => void
  filteredAchievements: UserAchievement[]
  inProgressCount: number
  getChannelName: (id: string) => string
  getChannelAvatar: (id: string) => string | undefined
  onBack: () => void
  t: (key: string, params?: Record<string, string | number>) => string
}>) {
  const channelName = getChannelName(summary.channelId)
  const pct =
    summary.totalAchievements > 0
      ? Math.round((summary.unlockedAchievements / summary.totalAchievements) * 100)
      : 0

  const tabs: { key: AchievementFilter; label: string; count: number }[] = [
    { key: 'all', label: t('viewerHub.all'), count: summary.totalAchievements },
    { key: 'progress', label: t('viewerHub.channelProgress'), count: inProgressCount },
    {
      key: 'completed',
      label: t('viewerHub.channelUnlocked'),
      count: summary.unlockedAchievements,
    },
  ]

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button
        type="button"
        data-testid="back-btn"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white dark:text-gray-600 dark:hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('viewerHub.back')}
      </button>

      {/* Channel header card */}
      <div className="overflow-hidden rounded-xl border border-[#2d2d31] bg-[#18181b] dark:border-gray-200 dark:bg-white">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <ChannelAvatar
              name={channelName}
              size="lg"
              profileImageUrl={getChannelAvatar(summary.channelId)}
            />
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
              <div className="text-3xl font-bold text-[#9146FF]">{pct}%</div>
              <div className="text-xs text-gray-500">{t('viewerHub.channelCompleted')}</div>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#2d2d31] dark:bg-gray-200">
            <div className="h-full rounded-full bg-[#9146FF]" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-[#2d2d31] border-t border-[#2d2d31] dark:divide-gray-200 dark:border-gray-200">
          <div className="flex flex-col items-center gap-0.5 py-4">
            <div className="text-xl font-bold text-[#00f593]">{summary.unlockedAchievements}</div>
            <div className="text-[11px] text-gray-500">{t('viewerHub.channelUnlocked')}</div>
          </div>
          <div className="flex flex-col items-center gap-0.5 py-4">
            <div className="text-xl font-bold text-[#9146FF]">{inProgressCount}</div>
            <div className="text-[11px] text-gray-500">{t('viewerHub.channelProgress')}</div>
          </div>
          <div className="flex flex-col items-center gap-0.5 py-4">
            <div className="text-xl font-bold text-[#ffd700]">{summary.xp}</div>
            <div className="text-[11px] text-gray-500">XP</div>
          </div>
        </div>
      </div>

      <FilterTabs tabs={tabs} filter={filter} setFilter={setFilter} />

      {filteredAchievements.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          {filteredAchievements.map(achievement => (
            <AchievementRow
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

// ── Badges section ──────────────────────────────────────────

function BadgesSection({
  badges,
  isLoading,
  errorMessage,
  t,
}: Readonly<{
  badges: Badge[]
  isLoading: boolean
  errorMessage: string | null
  t: (key: string, params?: Record<string, string | number>) => string
}>) {
  return (
    <div
      data-testid="badges-section"
      className="overflow-hidden rounded-xl border border-[#2d2d31] bg-[#18181b] dark:border-gray-200 dark:bg-white"
    >
      <div className="border-b border-[#2d2d31] px-4 py-3 dark:border-gray-200">
        <span className="text-sm font-semibold text-white dark:text-gray-900">
          {t('viewerHub.badges.title')}
        </span>
      </div>

      <div className="p-4">
        {isLoading && (
          <p className="text-sm text-gray-400 dark:text-gray-600">{t('profile.badges.loading')}</p>
        )}

        {!isLoading && errorMessage && (
          <div className="rounded-lg border border-[#ff4444]/40 bg-[#ff4444]/10 p-3 text-sm text-[#ff8080] dark:text-[#b42318]">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && badges.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.badges.empty')}</p>
        )}

        {!isLoading && !errorMessage && badges.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {badges.map(badge => (
              <div key={badge.id} className="flex flex-col items-center gap-2" title={badge.title}>
                <BadgeThumbnail title={badge.title} image={badge.image} className="h-14 w-14" />
                <span className="max-w-full truncate text-center text-[11px] text-gray-400 dark:text-gray-600">
                  {badge.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

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
    <div className="flex items-center gap-1 rounded-xl border border-[#2d2d31] bg-[#18181b] p-1 dark:border-gray-200 dark:bg-white">
      {tabs.map(tab => (
        <button
          key={tab.key}
          type="button"
          onClick={() => setFilter(tab.key)}
          className={[
            'flex flex-1 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            filter === tab.key
              ? 'bg-[#9146FF] text-white'
              : 'text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-900',
          ].join(' ')}
        >
          {tab.label} — {tab.count}
        </button>
      ))}
    </div>
  )
}

function EmptyState() {
  const { t } = useLanguage()
  return (
    <div className="rounded-xl border border-dashed border-[#2d2d31] p-10 text-center text-sm text-gray-500 dark:border-gray-300 dark:text-gray-400">
      {t('viewerHub.emptyFilter')}
    </div>
  )
}

// ── Stat card ────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  iconBg,
}: Readonly<{
  icon: ReactNode
  label: string
  value: string | number
  iconBg: string
}>) {
  return (
    <div className="rounded-xl border border-[#2d2d31] bg-[#18181b] p-4 dark:border-gray-200 dark:bg-white sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl text-white dark:text-gray-900 sm:text-3xl">{value}</div>
      <div className="mt-1 text-xs text-gray-400 dark:text-gray-600 sm:text-sm">{label}</div>
    </div>
  )
}

// ── Achievement row (horizontal) ─────────────────────────────

function AchievementRow({
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

  let borderClass: string
  if (isCompleted) borderClass = 'border-[#00f593]/30'
  else if (isInProgress) borderClass = 'border-[#9146FF]/30'
  else borderClass = 'border-[#2d2d31] dark:border-gray-200'

  const barColor = isCompleted ? 'bg-[#00f593]' : 'bg-[#9146FF]'

  let progressLabel: string
  if (isCompleted) progressLabel = '100%'
  else if (hidden) progressLabel = t('viewerHub.achievement.locked')
  else progressLabel = `${achievement.userState.progressCount} / ${achievement.goal}`

  return (
    <div
      className={`flex items-center gap-4 rounded-xl border bg-[#18181b] p-3 transition-colors dark:bg-white ${borderClass}`}
    >
      {/* Thumbnail */}
      <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-md bg-[#0e0e10] dark:bg-gray-100">
        <img src={src} alt="" className="h-full w-full object-cover" />
        {hidden && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <Lock className="h-3 w-3 text-white/50" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-white dark:text-gray-900">
            {hidden ? t('overlay.hiddenFallback') : achievement.title}
          </span>
          {isCompleted && (
            <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-[#00f593]/15 px-2 py-0.5 text-[10px] font-semibold text-[#00f593]">
              <CheckCircle2 className="h-2.5 w-2.5" />
              {t('viewerHub.achievement.unlocked')}
            </span>
          )}
        </div>
        <div className="mt-0.5 text-xs text-gray-500">{channelName}</div>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#2d2d31] dark:bg-gray-200">
            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="flex-shrink-0 text-[11px] text-gray-500">
            {progressLabel}
          </span>
        </div>
      </div>

      {/* XP */}
      <div className="flex-shrink-0 text-right">
        <div className="text-sm font-bold text-[#ffd700]">{achievement.reward}</div>
        <div className="text-[10px] text-gray-500">XP</div>
      </div>
    </div>
  )
}

// ── Channel avatar ───────────────────────────────────────────

function ChannelAvatar({
  name,
  size = 'md',
  profileImageUrl,
}: Readonly<{ name: string; size?: 'sm' | 'md' | 'lg'; profileImageUrl?: string }>) {
  const sizeClass = {
    sm: 'h-5 w-5 text-[8px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
  }[size]

  if (profileImageUrl) {
    return (
      <img
        src={profileImageUrl}
        alt={name}
        className={`flex-shrink-0 rounded-full object-cover ${sizeClass}`}
      />
    )
  }

  const initials =
    name
      .split(/[\s_\-./]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 2) || '?'

  const hue = name.split('').reduce((acc, c) => acc + (c.codePointAt(0) ?? 0), 0) % 360

  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-full font-bold text-white ${sizeClass}`}
      style={{ background: `hsl(${hue}, 50%, 35%)` }}
    >
      {initials}
    </div>
  )
}

// ── Rank number ──────────────────────────────────────────────

function RankNumber({ rank }: Readonly<{ rank: number }>) {
  let cls: string
  if (rank === 1) cls = 'text-[#ffd700]'
  else if (rank === 2) cls = 'text-gray-400'
  else if (rank === 3) cls = 'text-[#cd7f32]'
  else cls = 'text-gray-500 dark:text-gray-400'
  return <span className={`font-bold ${cls}`}>{rank}</span>
}

// ── Utilities ───────────────────────────────────────────────

function getChannelDisplayName(
  channelId: string | undefined,
  channel?: { id: string; name: string }
): string {
  if (!channelId || channelId === 'unknown') return 'Unknown channel'
  if (channel?.id === channelId) return channel.name
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

  let colors: string[]
  if (achievement.userState.finished) colors = ['#0a2e25', '#00f593']
  else if (achievement.userState.progressCount > 0) colors = ['#1a0a33', '#9146FF']
  else if (achievement.secret) colors = ['#1c1c1f', '#3a3a3f']
  else colors = ['#0e0e10', '#2d2d31']

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" fill="none">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${colors[0]}" />
          <stop offset="100%" stop-color="${colors[1]}" />
        </linearGradient>
      </defs>
      <rect width="640" height="480" fill="url(#bg)" />
      <circle cx="530" cy="90" r="110" fill="rgba(255,255,255,0.05)" />
      <circle cx="120" cy="360" r="130" fill="rgba(255,255,255,0.03)" />
      <text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="140" font-family="Arial, sans-serif" font-weight="700">${initials || 'SQ'}</text>
      <text x="50%" y="67%" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="28" font-family="Arial, sans-serif">Stream Quest</text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}
