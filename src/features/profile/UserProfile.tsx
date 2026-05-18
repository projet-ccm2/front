import { Trophy, TrendingUp, Menu } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useChannel } from '../../context/ChannelContext'
import { useLanguage } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'
import { useUserAchievements } from './hooks/useUserAchievements'
import { useChannelLeaderboard } from './hooks/useChannelLeaderboard'
import { getRealChannelId } from '../achievements/utils/achievementManagementChannel'

const XP_PER_LEVEL = 250

interface ProfileAppearanceStyles {
  readonly page: CSSProperties
  readonly hero: CSSProperties
  readonly profileCard: CSSProperties
  readonly avatar: CSSProperties
  readonly levelBadge: CSSProperties
  readonly title: CSSProperties
  readonly metadata: CSSProperties
  readonly progressTrack: CSSProperties
  readonly description: CSSProperties
  readonly statCard: CSSProperties
  readonly statLabel: CSSProperties
  readonly statValue: CSSProperties
  readonly leaderboardCard: CSSProperties
  readonly leaderboardEmpty: CSSProperties
}

const LIGHT_PROFILE_STYLES: ProfileAppearanceStyles = {
  page: { backgroundColor: '#f8fafc' },
  hero: { borderBottom: '1px solid #e5e7eb' },
  profileCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '24px',
    boxShadow: '0 18px 48px rgba(15, 23, 42, 0.08)',
    padding: '1rem 1rem 1.25rem',
  },
  avatar: {
    border: '4px solid #ffffff',
    boxShadow: '0 18px 36px rgba(15, 23, 42, 0.18)',
  },
  levelBadge: {
    backgroundColor: '#ffd700',
    border: '4px solid #ffffff',
    boxShadow: '0 8px 18px rgba(0, 0, 0, 0.22)',
  },
  title: { color: '#111827' },
  metadata: { color: '#475569' },
  progressTrack: {
    backgroundColor: '#e5e7eb',
    border: '1px solid #d1d5db',
    height: '12px',
  },
  description: { color: '#334155' },
  statCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    boxShadow: '0 12px 32px rgba(15, 23, 42, 0.06)',
  },
  statLabel: { color: '#334155' },
  statValue: { color: '#111827' },
  leaderboardCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    boxShadow: '0 12px 32px rgba(15, 23, 42, 0.06)',
  },
  leaderboardEmpty: {
    backgroundColor: '#f8fafc',
    border: '1px dashed #cbd5e1',
    color: '#475569',
  },
}

const DARK_PROFILE_STYLES: ProfileAppearanceStyles = {
  page: { backgroundColor: '#0e0e10' },
  hero: { borderBottom: '1px solid #2d2d31' },
  profileCard: {
    backgroundColor: 'transparent',
    border: '1px solid transparent',
    borderRadius: 0,
    boxShadow: 'none',
    padding: 0,
  },
  avatar: {
    border: '4px solid #0e0e10',
    boxShadow: '0 18px 36px rgba(0, 0, 0, 0.35)',
  },
  levelBadge: {
    backgroundColor: '#ffd700',
    border: '4px solid #0e0e10',
    boxShadow: '0 8px 18px rgba(0, 0, 0, 0.22)',
  },
  title: { color: '#ffffff' },
  metadata: { color: '#ffffff' },
  progressTrack: {
    backgroundColor: '#1a1a1d',
    border: '1px solid #2d2d31',
    height: '12px',
  },
  description: { color: '#d1d5db' },
  statCard: {
    backgroundColor: '#18181b',
    border: '1px solid #2d2d31',
    boxShadow: 'none',
  },
  statLabel: { color: '#9ca3af' },
  statValue: { color: '#ffffff' },
  leaderboardCard: {
    backgroundColor: '#18181b',
    border: '1px solid #2d2d31',
    boxShadow: 'none',
  },
  leaderboardEmpty: {
    backgroundColor: 'transparent',
    border: '1px dashed #2d2d31',
    color: '#9ca3af',
  },
}

function getProfileAppearanceStyles(isLightAppearance: boolean) {
  return isLightAppearance ? LIGHT_PROFILE_STYLES : DARK_PROFILE_STYLES
}

function getLeaderboardChannelId(
  selectedChannel: { id: string } | null,
  userChannelId: string | undefined
) {
  if (selectedChannel) {
    return getRealChannelId(selectedChannel.id)
  }

  return userChannelId ?? null
}

function getLevelProgress(currentXP: number) {
  const currentLevel = Math.max(1, Math.floor(currentXP / XP_PER_LEVEL) + 1)
  const previousLevelXP = (currentLevel - 1) * XP_PER_LEVEL
  const nextLevelXP = currentLevel * XP_PER_LEVEL
  const progress =
    nextLevelXP === previousLevelXP
      ? 0
      : ((currentXP - previousLevelXP) / (nextLevelXP - previousLevelXP)) * 100

  return { currentLevel, nextLevelXP, progress }
}

interface UserProfileProps {
  readonly onOpenSidebar: () => void
}

type ProfileUser = ReturnType<typeof useAuth>['user']

interface ProfileHeroProps {
  readonly currentLevel: number
  readonly currentXP: number
  readonly nextLevelXP: number
  readonly onOpenSidebar: () => void
  readonly progress: number
  readonly styles: ProfileAppearanceStyles
  readonly t: (key: string, params?: Record<string, string | number>) => string
  readonly user: ProfileUser
}

function ProfileAvatar({
  currentLevel,
  styles,
  user,
}: Readonly<{
  currentLevel: number
  styles: ProfileAppearanceStyles
  user: ProfileUser
}>) {
  return (
    <div className="relative">
      <div
        className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-[#9146FF] to-[#772ce8] rounded-2xl border-4 border-[#0e0e10] dark:border-gray-50 flex items-center justify-center text-5xl sm:text-6xl text-white overflow-hidden"
        style={styles.avatar}
      >
        {user?.channel.profileImageUrl ? (
          <img src={user.channel.profileImageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span>{user?.username?.charAt(0).toUpperCase() ?? 'U'}</span>
        )}
      </div>
      <div
        className="absolute -bottom-2 -right-2 w-10 h-10 sm:w-12 sm:h-12 bg-[#ffd700] rounded-full border-4 border-[#0e0e10] dark:border-gray-50 flex items-center justify-center"
        style={styles.levelBadge}
      >
        <span className="text-base sm:text-lg" style={{ color: '#111827' }}>
          {currentLevel}
        </span>
      </div>
    </div>
  )
}

function ProfileHero({
  currentLevel,
  currentXP,
  nextLevelXP,
  onOpenSidebar,
  progress,
  styles,
  t,
  user,
}: ProfileHeroProps) {
  return (
    <>
      <div
        className="relative h-32 sm:h-48 bg-gradient-to-r from-[#9146FF] via-[#772ce8] to-[#9146FF] border-b border-[#2d2d31] dark:border-gray-200"
        style={{
          background:
            'radial-gradient(circle at 14% 18%, rgba(255,255,255,0.22), transparent 25%), linear-gradient(135deg, #9146FF 0%, #772ce8 52%, #a855f7 100%)',
          ...styles.hero,
          minHeight: '190px',
        }}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
        <button
          onClick={onOpenSidebar}
          data-testid="mobile-menu-btn"
          className="lg:hidden absolute top-4 left-4 text-white z-10"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="relative -mt-16 sm:-mt-20 mb-8">
          <div
            className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6"
            style={styles.profileCard}
          >
            <ProfileAvatar currentLevel={currentLevel} styles={styles} user={user} />

            <div className="flex-1 pb-4 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-3">
                <h1 className="text-3xl sm:text-4xl text-white dark:text-gray-900" style={styles.title}>
                  {user?.username ?? t('profile.titleFallback')}
                </h1>
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-white dark:text-gray-900" style={styles.metadata}>
                    {t('profile.level', { level: currentLevel })}
                  </span>
                  <span className="text-white dark:text-gray-900" style={styles.metadata}>
                    {t('profile.xpProgress', { currentXp: currentXP, nextLevelXp: nextLevelXP })}
                  </span>
                </div>
                <div
                  className="h-4 bg-[#1a1a1d] dark:bg-gray-200 rounded-full overflow-hidden border border-[#2d2d31] dark:border-gray-300"
                  style={styles.progressTrack}
                >
                  <div
                    className="h-full bg-gradient-to-r from-[#9146FF] via-[#b366ff] to-[#772ce8] shadow-lg shadow-[#9146FF]/50"
                    style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
                  />
                </div>
              </div>
              <p className="text-gray-300 dark:text-gray-700" style={styles.description}>
                {t('profile.untilNextLevel', { xp: nextLevelXP - currentXP })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

interface ProfileStatCardProps {
  readonly icon: ReactNode
  readonly label: string
  readonly styles: ProfileAppearanceStyles
  readonly value: ReactNode
}

function ProfileStatCard({ icon, label, styles, value }: ProfileStatCardProps) {
  return (
    <div
      className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-6"
      style={styles.statCard}
    >
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <div className="text-sm text-gray-400 dark:text-gray-600" style={styles.statLabel}>
          {label}
        </div>
      </div>
      <div className="text-2xl sm:text-3xl text-white dark:text-gray-900" style={styles.statValue}>
        {value}
      </div>
    </div>
  )
}

interface LeaderboardEntry {
  readonly userId: string
  readonly username: string
  readonly xp: number
}

interface LeaderboardSectionProps {
  readonly entries: readonly LeaderboardEntry[]
  readonly errorMessage: string | null
  readonly isLoading: boolean
  readonly styles: ProfileAppearanceStyles
  readonly t: (key: string) => string
  readonly userId: string | undefined
}

function TopLeaderboardEntry({
  entry,
  index,
  isCurrentUser,
  t,
}: Readonly<{
  entry: LeaderboardEntry
  index: number
  isCurrentUser: boolean
  t: (key: string) => string
}>) {
  const ranks = ['#1', '#2', '#3']
  const borderColors = ['border-[#ffd700]/50', 'border-[#c0c0c0]/50', 'border-[#cd7f32]/50']
  const bgColors = ['bg-[#ffd700]/10', 'bg-[#c0c0c0]/10', 'bg-[#cd7f32]/10']

  return (
    <div
      className={`rounded-xl border p-3 text-center ${borderColors[index]} ${bgColors[index]} ${isCurrentUser ? 'ring-2 ring-[#9146FF]' : ''}`}
    >
      <div className="mb-1 text-sm font-bold text-[#9146FF]">{ranks[index]}</div>
      <div className="truncate text-sm font-medium text-white dark:text-gray-900">
        {entry.username}
      </div>
      {isCurrentUser && <div className="text-xs text-[#9146FF]">({t('profile.leaderboard.you')})</div>}
      <div className="mt-1 text-xs text-gray-400 dark:text-gray-600">
        {entry.xp.toLocaleString()} XP
      </div>
    </div>
  )
}

function RemainingLeaderboardEntry({
  entry,
  index,
  isCurrentUser,
  t,
}: Readonly<{
  entry: LeaderboardEntry
  index: number
  isCurrentUser: boolean
  t: (key: string) => string
}>) {
  const rowClassName = isCurrentUser
    ? 'border border-[#9146FF]/40 bg-[#9146FF]/10'
    : 'border border-[#2d2d31] bg-[#0f0f12] dark:border-gray-200 dark:bg-gray-50'

  return (
    <div className={`flex items-center gap-3 rounded-lg px-4 py-3 ${rowClassName}`}>
      <span className="w-8 text-sm font-medium text-gray-400 dark:text-gray-600">
        #{index + 4}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-white dark:text-gray-900">
        {entry.username}
        {isCurrentUser && (
          <span className="ml-2 text-xs text-[#9146FF]">({t('profile.leaderboard.you')})</span>
        )}
      </span>
      <span className="text-sm text-gray-400 dark:text-gray-600">
        {entry.xp.toLocaleString()} XP
      </span>
    </div>
  )
}

function LeaderboardSection({
  entries,
  errorMessage,
  isLoading,
  styles,
  t,
  userId,
}: LeaderboardSectionProps) {
  const topEntries = entries.slice(0, 3)
  const remainingEntries = entries.slice(3)

  return (
    <div
      className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-8 mb-6 sm:mb-8"
      style={styles.leaderboardCard}
    >
      <h2 className="text-xl sm:text-2xl text-white dark:text-gray-900 mb-4 sm:mb-6" style={styles.title}>
        {t('profile.leaderboard')}
      </h2>

      {isLoading && (
        <div className="text-sm text-gray-400 dark:text-gray-600">
          {t('profile.leaderboard.loading')}
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="rounded-xl border border-[#ff4444]/40 bg-[#ff4444]/10 p-4 text-sm text-[#ff8080] dark:text-[#b42318]">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && entries.length === 0 && (
        <div
          className="rounded-xl border border-dashed border-[#2d2d31] p-6 text-center text-gray-400 dark:border-gray-200 dark:text-gray-600"
          style={styles.leaderboardEmpty}
        >
          {t('profile.leaderboard.empty')}
        </div>
      )}

      {!isLoading && !errorMessage && entries.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {topEntries.map((entry, index) => (
              <TopLeaderboardEntry
                key={entry.userId}
                entry={entry}
                index={index}
                isCurrentUser={entry.userId === userId}
                t={t}
              />
            ))}
          </div>

          {remainingEntries.length > 0 && (
            <div className="space-y-2">
              {remainingEntries.map((entry, index) => (
                <RemainingLeaderboardEntry
                  key={entry.userId}
                  entry={entry}
                  index={index}
                  isCurrentUser={entry.userId === userId}
                  t={t}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function UserProfile({ onOpenSidebar }: UserProfileProps) {
  const { user } = useAuth()
  const { selectedChannel } = useChannel()
  const { t } = useLanguage()
  const { theme } = useTheme()
  const isLightAppearance = theme === 'dark'
  const styles = getProfileAppearanceStyles(isLightAppearance)
  const { achievements, isLoading, errorMessage } = useUserAchievements()
  const leaderboardChannelId = getLeaderboardChannelId(selectedChannel, user?.channel.id)
  const {
    entries: leaderboardEntries,
    isLoading: isLeaderboardLoading,
    errorMessage: leaderboardError,
  } = useChannelLeaderboard(leaderboardChannelId)

  const unlockedCount = achievements.filter(achievement => achievement.userState.finished).length
  const totalCount = achievements.length
  const currentXP = achievements.reduce(
    (total, achievement) => total + (achievement.userState.finished ? achievement.reward : 0),
    0
  )
  const { currentLevel, nextLevelXP, progress } = getLevelProgress(currentXP)

  return (
    <div className="flex flex-col">
      <div className="flex-1 overflow-auto bg-[#0e0e10] dark:bg-gray-50" style={styles.page}>
        <ProfileHero
          currentLevel={currentLevel}
          currentXP={currentXP}
          nextLevelXP={nextLevelXP}
          onOpenSidebar={onOpenSidebar}
          progress={progress}
          styles={styles}
          t={t}
          user={user}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          {isLoading && (
            <div className="mb-4 rounded-xl border border-dashed border-[#2d2d31] bg-[#18181b] p-4 text-sm text-gray-400 dark:border-gray-200 dark:bg-white dark:text-gray-600">
              {t('profile.loading')}
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="mb-4 rounded-xl border border-[#ff4444]/40 bg-[#ff4444]/10 p-4 text-[#ff8080] dark:text-[#b42318]">
              {errorMessage}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <ProfileStatCard
              icon={
                <div className="w-10 h-10 bg-[#00f593]/20 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-[#00f593]" />
                </div>
              }
              label={t('profile.achievementsUnlocked')}
              styles={styles}
              value={`${unlockedCount} / ${totalCount}`}
            />
            <ProfileStatCard
              icon={
                <div className="w-10 h-10 bg-[#ffd700]/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#ffd700]" />
                </div>
              }
              label={t('profile.achievementXp')}
              styles={styles}
              value={currentXP}
            />
          </div>

          <LeaderboardSection
            entries={leaderboardEntries}
            errorMessage={leaderboardError}
            isLoading={isLeaderboardLoading}
            styles={styles}
            t={t}
            userId={user?.userId}
          />
        </div>
      </div>
    </div>
  )
}
