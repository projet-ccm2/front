import { Trophy, Clock, TrendingUp, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useUserAchievements } from './hooks/useUserAchievements'
import type { UserAchievement } from '../achievements/api/achievementManagement.types'

interface UserProfileProps {
  readonly onOpenSidebar: () => void
}

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-[#ffd700] text-black'
    case 2:
      return 'bg-[#c0c0c0] text-black'
    case 3:
      return 'bg-[#cd7f32] text-black'
    default:
      return 'bg-[#4d4d51] dark:bg-gray-300 text-white dark:text-gray-900'
  }
}

interface LeaderboardEntry {
  rank: number
  title: string
  xp: number
  avatar: string
  status: string
  isUnlocked: boolean
}

function buildLeaderboardEntries(achievements: UserAchievement[]): LeaderboardEntry[] {
  return achievements
    .slice()
    .sort((left, right) => {
      const rewardDiff = right.reward - left.reward
      if (rewardDiff !== 0) {
        return rewardDiff
      }

      const finishedDiff = Number(right.userState.finished) - Number(left.userState.finished)
      if (finishedDiff !== 0) {
        return finishedDiff
      }

      const progressDiff = right.userState.progressCount - left.userState.progressCount
      if (progressDiff !== 0) {
        return progressDiff
      }

      return left.title.localeCompare(right.title)
    })
    .slice(0, 5)
    .map((achievement, index) => ({
      rank: index + 1,
      title: achievement.title,
      xp: achievement.reward,
      avatar:
        achievement.label.trim().charAt(0).toUpperCase() ||
        achievement.title.charAt(0).toUpperCase() ||
        'A',
      status: achievement.userState.finished
        ? 'Unlocked'
        : `${achievement.userState.progressCount}/${achievement.goal}`,
      isUnlocked: achievement.userState.finished,
    }))
}

export function UserProfile({ onOpenSidebar }: UserProfileProps) {
  const { user } = useAuth()
  const { achievements, isLoading, errorMessage } = useUserAchievements()
  const leaderboard = buildLeaderboardEntries(achievements)

  const unlockedCount = achievements.filter(achievement => achievement.userState.finished).length
  const totalCount = achievements.length
  const currentXP = achievements.reduce(
    (total, achievement) => total + (achievement.userState.finished ? achievement.reward : 0),
    0
  )
  const currentLevel = Math.max(1, Math.floor(currentXP / 250) + 1)
  const previousLevelXP = (currentLevel - 1) * 250
  const nextLevelXP = currentLevel * 250
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
                    {user?.username ?? 'Profile'}
                  </h1>
                </div>

                <div className="mb-2">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-white dark:text-gray-900">Level {currentLevel}</span>
                    <span className="text-white dark:text-gray-900">
                      {currentXP} / {nextLevelXP} XP
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
                  {nextLevelXP - currentXP} XP until next level.
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#9146FF]/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#9146FF]" />
                </div>
                <div className="text-sm text-gray-400 dark:text-gray-600">Total Watch Time</div>
              </div>
              <div className="text-2xl sm:text-3xl text-white dark:text-gray-900">--</div>
            </div>

            <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#00f593]/20 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-[#00f593]" />
                </div>
                <div className="text-sm text-gray-400 dark:text-gray-600">
                  Achievements Unlocked
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
                <div className="text-sm text-gray-400 dark:text-gray-600">Achievement XP</div>
              </div>
              <div className="text-2xl sm:text-3xl text-white dark:text-gray-900">{currentXP}</div>
            </div>
          </div>

          <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-8 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl text-white dark:text-gray-900 mb-4 sm:mb-6">
              Achievement Badges
            </h2>

            {isLoading && (
              <div className="text-gray-400 dark:text-gray-600">
                Loading achievement progress...
              </div>
            )}

            {!isLoading && errorMessage && (
              <div className="rounded-xl border border-[#ff4444]/40 bg-[#ff4444]/10 p-4 text-[#ff8080] dark:text-[#b42318]">
                {errorMessage}
              </div>
            )}

            {!isLoading && !errorMessage && achievements.length === 0 && (
              <div className="rounded-xl border border-dashed border-[#2d2d31] p-6 text-center text-gray-400 dark:border-gray-200 dark:text-gray-600">
                No profile achievements found yet.
              </div>
            )}

            {!isLoading && !errorMessage && achievements.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
                {achievements.map(achievement => (
                  <div
                    key={achievement.id}
                    className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 sm:p-4 transition-all ${
                      achievement.userState.finished
                        ? 'bg-gradient-to-br from-[#9146FF]/20 to-[#772ce8]/20 border-[#9146FF]'
                        : 'bg-[#2d2d31] dark:bg-gray-200 border-[#4d4d51] dark:border-gray-300 opacity-70'
                    }`}
                    title={achievement.title}
                  >
                    <div className="text-xl sm:text-2xl mb-1 sm:mb-2 text-center text-white dark:text-gray-900">
                      {achievement.label || achievement.title.slice(0, 2).toUpperCase()}
                    </div>
                    <div
                      className={`text-xs text-center line-clamp-2 ${
                        achievement.userState.finished
                          ? 'text-white dark:text-gray-900'
                          : 'text-gray-400 dark:text-gray-600'
                      }`}
                    >
                      {achievement.title}
                    </div>
                    <div className="mt-2 text-[10px] text-gray-400 dark:text-gray-600 text-center">
                      {achievement.userState.finished
                        ? 'Unlocked'
                        : `${achievement.userState.progressCount}/${achievement.goal}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-8 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
              <h2 className="text-xl sm:text-2xl text-white dark:text-gray-900">Leaderboard</h2>
              <button className="w-full sm:w-auto px-4 py-2 bg-[#2d2d31] dark:bg-gray-100 hover:bg-[#3d3d41] dark:hover:bg-gray-200 text-gray-300 dark:text-gray-700 rounded-lg transition-colors text-sm">
                View Full Rankings
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-400 dark:text-gray-600">
              Top achievements ranked from the data returned by achievement-management.
            </p>
            <div className="space-y-3">
              {leaderboard.map(entry => (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-colors ${
                    entry.isUnlocked
                      ? 'bg-[#9146FF]/20 border-2 border-[#9146FF]'
                      : 'bg-[#2d2d31] dark:bg-gray-100 hover:bg-[#3d3d41] dark:hover:bg-gray-200'
                  }`}
                >
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm ${getRankStyle(entry.rank)}`}
                  >
                    #{entry.rank}
                  </div>

                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#9146FF] to-[#772ce8] rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 text-white">
                    {entry.avatar}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-white dark:text-gray-900 text-sm sm:text-base truncate">
                      {entry.title}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400 dark:text-gray-600">
                      {entry.status}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[#ffd700] text-sm sm:text-base">
                      {entry.xp.toLocaleString()} XP
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
