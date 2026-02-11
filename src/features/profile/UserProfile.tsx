import { Trophy, Clock, TrendingUp, Menu } from 'lucide-react'

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

const unlockedBadges = [
  { id: 1, title: 'First Steps', icon: '🎯', unlocked: true },
  { id: 2, title: 'Chat Master', icon: '💬', unlocked: true },
  { id: 3, title: 'Loyal Viewer', icon: '👑', unlocked: true },
  { id: 4, title: 'Week Warrior', icon: '⚔️', unlocked: true },
  { id: 5, title: 'Supporter', icon: '💎', unlocked: true },
  { id: 6, title: 'Night Owl', icon: '🦉', unlocked: true },
  { id: 7, title: 'Early Bird', icon: '🐦', unlocked: false },
  { id: 8, title: 'Community Leader', icon: '🌟', unlocked: false },
  { id: 9, title: 'Speed Runner', icon: '⚡', unlocked: false },
  { id: 10, title: 'Marathon Viewer', icon: '🏃', unlocked: false },
  { id: 11, title: 'Emote Master', icon: '😎', unlocked: true },
  { id: 12, title: 'Clip Creator', icon: '🎬', unlocked: false },
]

const leaderboard = [
  { rank: 1, username: 'ProGamer99', level: 52, xp: 12450, avatar: '🔥' },
  { rank: 2, username: 'StreamFan42', level: 48, xp: 11280, avatar: '⭐' },
  { rank: 3, username: 'xXGamerXx', level: 42, xp: 9830, avatar: '👑', isCurrentUser: true },
  { rank: 4, username: 'NightOwl', level: 39, xp: 8920, avatar: '🦉' },
  { rank: 5, username: 'CasualVibes', level: 35, xp: 7650, avatar: '🎮' },
]

export function UserProfile({ onOpenSidebar }: UserProfileProps) {
  const currentLevel = 42
  const currentXP = 9830
  const nextLevelXP = 10000
  const progress = ((currentXP % 1000) / 1000) * 100

  return (
    <div className="flex flex-col">
      <div className="flex-1 overflow-auto bg-[#0e0e10] dark:bg-gray-50">
        {/* Header Banner */}
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

        {/* Profile Header */}
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="relative -mt-16 sm:-mt-20 mb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-[#9146FF] to-[#772ce8] rounded-2xl border-4 border-[#0e0e10] dark:border-gray-50 flex items-center justify-center text-5xl sm:text-6xl">
                  👑
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 sm:w-12 sm:h-12 bg-[#ffd700] rounded-full border-4 border-[#0e0e10] dark:border-gray-50 flex items-center justify-center">
                  <span className="text-base sm:text-lg">{currentLevel}</span>
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 pb-4 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-3">
                  <h1 className="text-3xl sm:text-4xl text-white dark:text-gray-900">xXGamerXx</h1>
                </div>

                {/* Level Progress */}
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
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <p className="text-gray-300 dark:text-gray-700">
                  Just {nextLevelXP - currentXP} XP until next level!
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#9146FF]/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#9146FF]" />
                </div>
                <div className="text-sm text-gray-400 dark:text-gray-600">Total Watch Time</div>
              </div>
              <div className="text-2xl sm:text-3xl text-white dark:text-gray-900">247h</div>
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
              <div className="text-2xl sm:text-3xl text-white dark:text-gray-900">7 / 12</div>
            </div>

            <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#ffd700]/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#ffd700]" />
                </div>
                <div className="text-sm text-gray-400 dark:text-gray-600">Global Rank</div>
              </div>
              <div className="text-2xl sm:text-3xl text-white dark:text-gray-900">#3</div>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-8 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl text-white dark:text-gray-900 mb-4 sm:mb-6">
              Achievement Badges
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
              {unlockedBadges.map(badge => (
                <div
                  key={badge.id}
                  className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 sm:p-4 transition-all ${
                    badge.unlocked
                      ? 'bg-gradient-to-br from-[#9146FF]/20 to-[#772ce8]/20 border-[#9146FF] hover:scale-105 cursor-pointer'
                      : 'bg-[#2d2d31] dark:bg-gray-200 border-[#4d4d51] dark:border-gray-300 opacity-40'
                  }`}
                  title={badge.title}
                >
                  <div
                    className={`text-2xl sm:text-4xl mb-1 sm:mb-2 ${!badge.unlocked && 'grayscale'}`}
                  >
                    {badge.icon}
                  </div>
                  <div
                    className={`text-xs text-center line-clamp-2 ${badge.unlocked ? 'text-white dark:text-gray-900' : 'text-gray-500'}`}
                  >
                    {badge.title}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-8 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
              <h2 className="text-xl sm:text-2xl text-white dark:text-gray-900">Leaderboard</h2>
              <button className="w-full sm:w-auto px-4 py-2 bg-[#2d2d31] dark:bg-gray-100 hover:bg-[#3d3d41] dark:hover:bg-gray-200 text-gray-300 dark:text-gray-700 rounded-lg transition-colors text-sm">
                View Full Rankings
              </button>
            </div>
            <div className="space-y-3">
              {leaderboard.map(user => (
                <div
                  key={user.rank}
                  className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-colors ${
                    user.isCurrentUser
                      ? 'bg-[#9146FF]/20 border-2 border-[#9146FF]'
                      : 'bg-[#2d2d31] dark:bg-gray-100 hover:bg-[#3d3d41] dark:hover:bg-gray-200'
                  }`}
                >
                  {/* Rank */}
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm ${getRankStyle(user.rank)}`}
                  >
                    #{user.rank}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#9146FF] to-[#772ce8] rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                    {user.avatar}
                  </div>

                  {/* Username */}
                  <div className="flex-1 min-w-0">
                    <div className="text-white dark:text-gray-900 text-sm sm:text-base truncate">
                      {user.username}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400 dark:text-gray-600">
                      Level {user.level}
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right">
                    <div className="text-[#ffd700] text-sm sm:text-base">
                      {user.xp.toLocaleString()} XP
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
