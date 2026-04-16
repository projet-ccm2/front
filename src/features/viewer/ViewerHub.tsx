import { Crown, Eye, Lock, Menu, Sparkles, Trophy } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useViewerHub } from './hooks/useViewerHub'
import { buildViewerChannelSummaries } from './utils/viewerHub'

interface ViewerHubProps {
  onOpenSidebar: () => void
}

export function ViewerHub({ onOpenSidebar }: Readonly<ViewerHubProps>) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { achievements, isLoading, errorMessage } = useViewerHub()

  const summaries = buildViewerChannelSummaries(achievements)
  const primarySummary = summaries[0] ?? null
  const primaryFeaturedAchievement = primarySummary ? getFeaturedAchievement(primarySummary) : null
  const totalAchievements = achievements.length
  const unlockedAchievements = achievements.filter(
    achievement => achievement.userState.finished
  ).length
  const activeChannels = summaries.length
  const xp = achievements.reduce(
    (total, achievement) => total + (achievement.userState.finished ? achievement.reward : 0),
    0
  )

  return (
    <div className="flex flex-col">
      <div className="flex-1 overflow-auto bg-[#0e0e10] dark:bg-gray-50">
        <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(145,70,255,0.24),_transparent_28%),linear-gradient(180deg,_#1b1b20_0%,_#101014_100%)] px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-4">
                <button
                  onClick={onOpenSidebar}
                  data-testid="mobile-menu-btn"
                  className="mt-1 flex-shrink-0 text-white lg:hidden dark:text-gray-900"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div className="min-w-0 space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">
                    <Sparkles className="h-4 w-4 text-[#c084fc]" />
                    {t('viewerHub.badge')}
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                      {t('viewerHub.title')}
                    </h1>
                    <p className="max-w-3xl text-sm leading-6 text-gray-300 sm:text-base">
                      {t('viewerHub.subtitle')}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <HeroStat
                      label={t('viewerHub.hero.connectedChannel')}
                      value={user?.channel.name ?? t('viewerHub.unknownChannel')}
                    />
                    <HeroStat label={t('viewerHub.metrics.channels')} value={activeChannels} />
                    <HeroStat label={t('viewerHub.metrics.xp')} value={xp} />
                  </div>
                </div>
              </div>

              <div className="hidden shrink-0 items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-gray-200 backdrop-blur sm:flex">
                <Eye className="h-4 w-4 text-[#c084fc]" />
                {t('viewerHub.badge')}
              </div>
            </div>

            {primarySummary && primaryFeaturedAchievement && (
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
                <section className="rounded-[2rem] border border-white/10 bg-black/20 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                          <Crown className="h-3.5 w-3.5 text-[#c084fc]" />
                          {t('viewerHub.featured.title')}
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                          {t('viewerHub.featured.subtitle')}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
                        <AchievementArtwork achievement={primaryFeaturedAchievement} />

                        <div className="min-w-0 space-y-4">
                          <div>
                            <div className="text-xs uppercase tracking-[0.2em] text-gray-400">
                              {t('viewerHub.channelLabel', {
                                channelName: getChannelDisplayName(
                                  primarySummary.channelId,
                                  user?.channel,
                                  t('viewerHub.unknownChannel')
                                ),
                              })}
                            </div>
                            <h2 className="mt-2 text-2xl font-semibold text-white dark:text-gray-900">
                              {primaryFeaturedAchievement.secret &&
                              !primaryFeaturedAchievement.userState.finished
                                ? t('achievements.hidden.title')
                                : primaryFeaturedAchievement.title}
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-gray-300 dark:text-gray-600">
                              {primaryFeaturedAchievement.secret &&
                              !primaryFeaturedAchievement.userState.finished
                                ? t('achievements.hidden.description')
                                : primaryFeaturedAchievement.description}
                            </p>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-3">
                            <MetricTile
                              label={t('viewerHub.channelUnlocked')}
                              value={primarySummary.unlockedAchievements}
                            />
                            <MetricTile
                              label={t('viewerHub.channelProgress')}
                              value={primarySummary.inProgressAchievements}
                            />
                            <MetricTile
                              label={t('viewerHub.channelHidden')}
                              value={primarySummary.hiddenAchievements}
                            />
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="text-sm font-medium text-white">
                                  {t('viewerHub.featured.current')}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {t('viewerHub.featured.currentHint')}
                                </div>
                              </div>
                              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-gray-200">
                                {getAchievementStatusLabel(primaryFeaturedAchievement, t)}
                              </span>
                            </div>

                            <div className="mt-4">
                              <div className="flex items-center justify-between text-xs text-gray-400">
                                <span>{t('viewerHub.featured.progress')}</span>
                                <span>
                                  {getAchievementProgressLabel(primaryFeaturedAchievement, t)}
                                </span>
                              </div>
                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/30">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#9146FF] to-[#c084fc]"
                                  style={{
                                    width: `${getAchievementProgressPercent(primaryFeaturedAchievement)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <aside className="rounded-[2rem] border border-white/10 bg-black/20 p-5 backdrop-blur">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {t('viewerHub.featured.listTitle')}
                      </div>
                      <div className="text-xs text-gray-400">
                        {t('viewerHub.featured.listSubtitle')}
                      </div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
                      {primarySummary.totalAchievements}
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {primarySummary.achievements.map(achievement => (
                      <AchievementRow
                        key={achievement.id}
                        achievement={achievement}
                        hiddenDescription={t('achievements.hidden.description')}
                      />
                    ))}
                  </div>
                </aside>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
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
                  const featuredAchievement = getFeaturedAchievement(summary)
                  if (!featuredAchievement) return null
                  const channelDisplayName = getChannelDisplayName(
                    summary.channelId,
                    user?.channel,
                    t('viewerHub.unknownChannel')
                  )

                  return (
                    <section
                      key={summary.channelId}
                      className="rounded-[2rem] border border-[#2d2d31] bg-[#18181b] p-4 sm:p-6 dark:border-gray-200 dark:bg-white"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9146FF] to-[#772ce8] text-white shadow-lg shadow-[#9146FF]/20">
                              <Trophy className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <h2 className="truncate text-xl font-semibold text-white dark:text-gray-900">
                                {t('viewerHub.channelLabel', { channelName: channelDisplayName })}
                              </h2>
                              <p className="text-sm text-gray-400 dark:text-gray-600">
                                {t('viewerHub.channelDescription', {
                                  unlocked: summary.unlockedAchievements,
                                  total: summary.totalAchievements,
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
                            <div className="rounded-3xl border border-[#2d2d31] bg-[#0f0f12] p-4 dark:border-gray-200 dark:bg-gray-50">
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                <AchievementArtwork achievement={featuredAchievement} />

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-[#9146FF]/20 px-3 py-1 text-xs font-medium text-[#cfa8ff]">
                                      {t('viewerHub.featured.current')}
                                    </span>
                                    <span className="rounded-full border border-[#2d2d31] bg-black/20 px-3 py-1 text-xs text-gray-300 dark:border-gray-200 dark:bg-white dark:text-gray-600">
                                      {getAchievementStatusLabel(featuredAchievement, t)}
                                    </span>
                                    {featuredAchievement.secret &&
                                      !featuredAchievement.userState.finished && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-[#2d2d31] bg-black/20 px-3 py-1 text-xs text-gray-300 dark:border-gray-200 dark:bg-white dark:text-gray-600">
                                          <Lock className="h-3.5 w-3.5" />
                                          {t('viewerHub.achievement.secret')}
                                        </span>
                                      )}
                                  </div>

                                  <h3 className="mt-3 text-2xl font-semibold text-white dark:text-gray-900">
                                    {featuredAchievement.secret &&
                                    !featuredAchievement.userState.finished
                                      ? t('achievements.hidden.title')
                                      : featuredAchievement.title}
                                  </h3>
                                  <p className="mt-2 text-sm leading-6 text-gray-300 dark:text-gray-600">
                                    {featuredAchievement.secret &&
                                    !featuredAchievement.userState.finished
                                      ? t('achievements.hidden.description')
                                      : featuredAchievement.description}
                                  </p>

                                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                    <MetricTile
                                      label={t('viewerHub.achievement.reward')}
                                      value={`${featuredAchievement.reward} XP`}
                                    />
                                    <MetricTile
                                      label={t('viewerHub.achievement.progress')}
                                      value={getAchievementProgressLabel(featuredAchievement, t)}
                                    />
                                    <MetricTile
                                      label={t('viewerHub.channelUnlocked')}
                                      value={summary.unlockedAchievements}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="rounded-3xl border border-[#2d2d31] bg-[#0f0f12] p-4 dark:border-gray-200 dark:bg-gray-50">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <div className="text-sm font-medium text-white dark:text-gray-900">
                                    {t('viewerHub.featured.listTitle')}
                                  </div>
                                  <div className="text-xs text-gray-400 dark:text-gray-600">
                                    {t('viewerHub.featured.listSubtitle')}
                                  </div>
                                </div>
                                <div className="rounded-full border border-[#2d2d31] bg-black/20 px-3 py-1 text-xs text-gray-300 dark:border-gray-200 dark:bg-white dark:text-gray-600">
                                  {summary.totalAchievements}
                                </div>
                              </div>
                              <div className="mt-4 space-y-3">
                                {summary.achievements.map(achievement => (
                                  <AchievementRow
                                    key={achievement.id}
                                    achievement={achievement}
                                    hiddenDescription={t('achievements.hidden.description')}
                                  />
                                ))}
                              </div>
                            </div>
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

function HeroStat({ label, value }: Readonly<{ label: string; value: string | number }>) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur">
      <div className="text-[11px] uppercase tracking-[0.2em] text-gray-400">{label}</div>
      <div className="mt-1 text-sm font-medium text-white">{value}</div>
    </div>
  )
}

function MetricTile({ label, value }: Readonly<{ label: string; value: string | number }>) {
  return (
    <div className="rounded-2xl border border-[#2d2d31] bg-[#0f0f12] p-4 dark:border-gray-200 dark:bg-gray-50">
      <div className="text-xs text-gray-400 dark:text-gray-600">{label}</div>
      <div className="mt-2 text-lg text-white dark:text-gray-900">{value}</div>
    </div>
  )
}

function AchievementRow({
  achievement,
  hiddenDescription,
}: Readonly<{
  achievement: {
    title: string
    description: string
    reward: number
    goal: number
    image: string | null
    secret: boolean
    userState: { progressCount: number; finished: boolean }
  }
  hiddenDescription: string
}>) {
  const hidden = achievement.secret && !achievement.userState.finished
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#2d2d31] bg-[#18181b] p-3 dark:border-gray-200 dark:bg-white">
      <AchievementArtwork achievement={achievement} compact />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <h4 className="truncate text-sm font-medium text-white dark:text-gray-900">
            {hidden ? '?' : achievement.title}
          </h4>
          <span className="shrink-0 rounded-full border border-[#2d2d31] bg-[#0f0f12] px-2.5 py-1 text-[11px] text-gray-300 dark:border-gray-200 dark:bg-gray-50 dark:text-gray-700">
            {achievement.reward} XP
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-400 dark:text-gray-600">
          {hidden ? hiddenDescription : achievement.description}
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#2d2d31] dark:bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#9146FF] to-[#c084fc]"
            style={{ width: `${getAchievementProgressPercent(achievement)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function AchievementArtwork({
  achievement,
  compact = false,
}: Readonly<{
  achievement: {
    title: string
    reward: number
    image: string | null
    secret: boolean
    userState: { progressCount: number; finished: boolean }
  }
  compact?: boolean
}>) {
  const { t } = useLanguage()
  const src = getAchievementVisualSource(achievement)
  const hidden = achievement.secret && !achievement.userState.finished

  return (
    <div
      className={[
        'relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f12] shadow-[0_18px_40px_rgba(0,0,0,0.22)]',
        compact ? 'h-16 w-16 flex-shrink-0 rounded-2xl' : 'h-44 w-full sm:w-44',
      ].join(' ')}
    >
      <img
        src={src}
        alt={hidden ? 'Hidden achievement artwork' : achievement.title}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
      <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[11px] text-white/90 backdrop-blur">
        {achievement.reward} XP
      </div>
      {hidden && (
        <div className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur">
          <Lock className="h-4 w-4" />
        </div>
      )}
      {!compact && (
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="text-xs uppercase tracking-[0.2em] text-white/70">
            {achievement.userState.finished
              ? t('viewerHub.achievement.unlocked')
              : t('viewerHub.achievement.inProgress')}
          </div>
        </div>
      )}
    </div>
  )
}

function getAchievementStatusLabel(
  achievement: {
    secret: boolean
    userState: { progressCount: number; finished: boolean }
  },
  t: (key: string, params?: Record<string, string | number>) => string
) {
  if (achievement.userState.finished) {
    return t('viewerHub.achievement.unlocked')
  }
  if (achievement.userState.progressCount > 0) {
    return t('viewerHub.achievement.inProgress')
  }
  return achievement.secret
    ? t('viewerHub.achievement.locked')
    : t('viewerHub.achievement.inProgress')
}

function getAchievementProgressLabel(
  achievement: {
    goal: number
    userState: { progressCount: number; finished: boolean }
  },
  t: (key: string, params?: Record<string, string | number>) => string
) {
  return achievement.userState.finished
    ? t('achievements.status.unlocked')
    : t('achievements.status.progress', {
        current: achievement.userState.progressCount,
        goal: achievement.goal,
      })
}

function getAchievementProgressPercent(achievement: {
  goal: number
  userState: { progressCount: number; finished: boolean }
}) {
  return achievement.userState.finished
    ? 100
    : Math.min(100, (achievement.userState.progressCount / Math.max(achievement.goal, 1)) * 100)
}

function getFeaturedAchievement(summary: {
  achievements: Array<{
    title: string
    description: string
    reward: number
    goal: number
    image: string | null
    secret: boolean
    userState: { progressCount: number; finished: boolean }
  }>
}):
  | {
      title: string
      description: string
      reward: number
      goal: number
      image: string | null
      secret: boolean
      userState: { progressCount: number; finished: boolean }
    }
  | undefined {
  return (
    summary.achievements.find(
      achievement => !achievement.userState.finished && achievement.userState.progressCount > 0
    ) ??
    summary.achievements.find(achievement => achievement.userState.finished) ??
    summary.achievements[0]
  )
}

function getChannelDisplayName(
  channelId: string,
  channel: { id: string; name: string } | undefined,
  unknownChannelLabel = 'Unknown channel'
) {
  if (channel && channel.id === channelId) {
    return channel.name
  }
  return channelId === 'unknown' ? unknownChannelLabel : channelId
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
