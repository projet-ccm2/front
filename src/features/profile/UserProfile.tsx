import { Trophy, Clock, TrendingUp, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useUserAchievements } from './hooks/useUserAchievements'
import { useUserBadges } from '../badges/hooks/useUserBadges'
import { BadgeThumbnail } from '../badges/components/BadgeThumbnail'

const XP_PER_LEVEL = 250

interface UserProfileProps {
  readonly onOpenSidebar: () => void
}

export function UserProfile({ onOpenSidebar }: UserProfileProps) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { achievements, isLoading, errorMessage } = useUserAchievements()
  const {
    badges,
    isLoading: areBadgesLoading,
    errorMessage: badgesErrorMessage,
  } = useUserBadges(user?.userId ?? null)

  const unlockedCount = achievements.filter(achievement => achievement.userState.finished).length
  const totalCount = achievements.length
  const currentXP = achievements.reduce(
    (total, achievement) => total + (achievement.userState.finished ? achievement.reward : 0),
    0
  )
  const currentLevel = Math.max(1, Math.floor(currentXP / XP_PER_LEVEL) + 1)
  const previousLevelXP = (currentLevel - 1) * XP_PER_LEVEL
  const nextLevelXP = currentLevel * XP_PER_LEVEL
  const progress =
    nextLevelXP === previousLevelXP
      ? 0
      : ((currentXP - previousLevelXP) / (nextLevelXP - previousLevelXP)) * 100

  return (
    <div className="flex flex-col">
      <div className="flex-1 overflow-auto bg-[#0e0e10] dark:bg-gray-50">
        <div className="relative h-32 sm:h-48 bg-gradient-to-r from-[#9146FF] via-[#772ce8] to-[#9146FF] border-b border-[#2d2d31] dark:border-gray-200">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
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
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-[#9146FF] to-[#772ce8] rounded-2xl border-4 border-[#0e0e10] dark:border-gray-50 flex items-center justify-center text-5xl sm:text-6xl text-white overflow-hidden">
                  {user?.channel.profileImageUrl ? (
                    <img
                      src={user.channel.profileImageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{user?.username?.charAt(0).toUpperCase() ?? 'U'}</span>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 sm:w-12 sm:h-12 bg-[#ffd700] rounded-full border-4 border-[#0e0e10] dark:border-gray-50 flex items-center justify-center">
                  <span className="text-base sm:text-lg">{currentLevel}</span>
                </div>
              </div>

              <div className="flex-1 pb-4 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-3">
                  <h1 className="text-3xl sm:text-4xl text-white dark:text-gray-900">
                    {user?.username ?? t('profile.titleFallback')}
                  </h1>
                </div>

                <div className="mb-2">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-white dark:text-gray-900">
                      {t('profile.level', { level: currentLevel })}
                    </span>
                    <span className="text-white dark:text-gray-900">
                      {t('profile.xpProgress', { currentXp: currentXP, nextLevelXp: nextLevelXP })}
                    </span>
                  </div>
                  <div className="h-4 bg-[#1a1a1d] dark:bg-gray-200 rounded-full overflow-hidden border border-[#2d2d31] dark:border-gray-300">
                    <div
                      className="h-full bg-gradient-to-r from-[#9146FF] via-[#b366ff] to-[#772ce8] shadow-lg shadow-[#9146FF]/50"
                      style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
                    />
                  </div>
                </div>
                <p className="text-gray-300 dark:text-gray-700">
                  {t('profile.untilNextLevel', { xp: nextLevelXP - currentXP })}
                </p>
              </div>
            </div>
          </div>

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

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#9146FF]/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#9146FF]" />
                </div>
                <div className="text-sm text-gray-400 dark:text-gray-600">
                  {t('profile.totalWatchTime')}
                </div>
              </div>
              <div className="text-2xl sm:text-3xl text-white dark:text-gray-900">--</div>
            </div>

            <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#00f593]/20 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-[#00f593]" />
                </div>
                <div className="text-sm text-gray-400 dark:text-gray-600">
                  {t('profile.achievementsUnlocked')}
                </div>
              </div>
              <div className="text-2xl sm:text-3xl text-white dark:text-gray-900">
                {unlockedCount} / {totalCount}
              </div>
            </div>

            <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#ffd700]/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#ffd700]" />
                </div>
                <div className="text-sm text-gray-400 dark:text-gray-600">
                  {t('profile.achievementXp')}
                </div>
              </div>
              <div className="text-2xl sm:text-3xl text-white dark:text-gray-900">{currentXP}</div>
            </div>
          </div>

          <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-8 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl text-white dark:text-gray-900 mb-4 sm:mb-6">
              {t('profile.section.badges')}
            </h2>

            {areBadgesLoading && (
              <div className="text-gray-400 dark:text-gray-600">{t('profile.badges.loading')}</div>
            )}

            {!areBadgesLoading && badgesErrorMessage && (
              <div className="rounded-xl border border-[#ff4444]/40 bg-[#ff4444]/10 p-4 text-[#ff8080] dark:text-[#b42318]">
                {badgesErrorMessage}
              </div>
            )}

            {!areBadgesLoading && !badgesErrorMessage && badges.length === 0 && (
              <div className="rounded-xl border border-dashed border-[#2d2d31] p-6 text-center text-gray-400 dark:border-gray-200 dark:text-gray-600">
                {t('profile.badges.empty')}
              </div>
            )}

            {!areBadgesLoading && !badgesErrorMessage && badges.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {badges.map(badge => (
                  <article
                    key={badge.id}
                    className="rounded-2xl border border-[#2d2d31] bg-[#0f0f12] p-3 transition-transform hover:-translate-y-0.5 hover:border-[#9146FF] dark:border-gray-200 dark:bg-gray-50"
                    title={badge.title}
                  >
                    <BadgeThumbnail title={badge.title} image={badge.image} className="h-24 w-full" />
                    <div className="mt-3 space-y-1 text-center">
                      <div className="text-sm font-medium text-white dark:text-gray-900">
                        {badge.title}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-600">
                        {t('profile.badges.item')}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-8 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
              <h2 className="text-xl sm:text-2xl text-white dark:text-gray-900">
                {t('profile.leaderboard')}
              </h2>
              <button className="w-full sm:w-auto px-4 py-2 bg-[#2d2d31] dark:bg-gray-100 hover:bg-[#3d3d41] dark:hover:bg-gray-200 text-gray-300 dark:text-gray-700 rounded-lg transition-colors text-sm">
                {t('profile.leaderboardAction')}
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-400 dark:text-gray-600">
              {t('profile.leaderboardDescription')}
            </p>
            <div className="rounded-xl border border-[#2d2d31] bg-[#0f0f12] p-4 dark:border-gray-200 dark:bg-gray-50 sm:p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#9146FF] to-[#772ce8] rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 text-white">
                  {user?.username?.charAt(0).toUpperCase() ?? 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-white dark:text-gray-900 text-sm sm:text-base truncate">
                    {user?.username ?? t('profile.titleFallback')}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400 dark:text-gray-600">
                    {t('profile.level', { level: currentLevel })} • {currentXP.toLocaleString()} XP
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[#ffd700] text-sm sm:text-base">
                    {t('profile.leaderboardPending')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
