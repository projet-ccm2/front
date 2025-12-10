import { useState } from 'react'
import { Sidebar } from '../../components/layout/Sidebar'
import { ChannelSelector } from '../../components/ui/ChannelSelector'
import { Search, Edit, Trash2, TrendingUp, Menu } from 'lucide-react'

interface SuccessManagementProps {
  onNavigate: (page: string) => void
}

const achievements = [
  {
    id: 1,
    title: 'First Steps',
    description: 'Watch your first stream',
    xp: 50,
    enabled: true,
    completion: 89,
    icon: '🎯',
  },
  {
    id: 2,
    title: 'Chat Master',
    description: 'Send 100 messages in chat',
    xp: 250,
    enabled: true,
    completion: 45,
    icon: '💬',
  },
  {
    id: 3,
    title: 'Loyal Viewer',
    description: 'Watch 10 streams in a row',
    xp: 500,
    enabled: true,
    completion: 23,
    icon: '👑',
  },
  {
    id: 4,
    title: 'Week Warrior',
    description: 'Watch streams every day for a week',
    xp: 750,
    enabled: false,
    completion: 12,
    icon: '⚔️',
  },
  {
    id: 5,
    title: 'Supporter',
    description: 'Subscribe to the channel',
    xp: 1000,
    enabled: true,
    completion: 67,
    icon: '💎',
  },
  {
    id: 6,
    title: 'Night Owl',
    description: 'Watch a stream past midnight',
    xp: 200,
    enabled: true,
    completion: 34,
    icon: '🦉',
  },
  {
    id: 7,
    title: 'Early Bird',
    description: 'Be one of the first 10 viewers',
    xp: 300,
    enabled: false,
    completion: 8,
    icon: '🐦',
  },
  {
    id: 8,
    title: 'Community Leader',
    description: 'Help 5 new viewers',
    xp: 600,
    enabled: true,
    completion: 15,
    icon: '🌟',
  },
]

export function SuccessManagement({ onNavigate }: SuccessManagementProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen">
      <Sidebar
        currentPage="management"
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 overflow-auto bg-[#0e0e10] dark:bg-gray-50">
        {/* Header */}
        <div className="bg-[#18181b] dark:bg-white border-b border-[#2d2d31] dark:border-gray-200 px-4 sm:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-white dark:text-gray-900 flex-shrink-0"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl text-white dark:text-gray-900 mb-2">
                  Manage Achievements
                </h1>
                <p className="text-gray-400 dark:text-gray-600 text-sm sm:text-base">
                  Enable, disable, and edit your quests
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="hidden sm:block">
                <ChannelSelector />
              </div>
              <button
                onClick={() => onNavigate('creator')}
                className="hidden sm:block px-6 py-3 bg-[#9146FF] hover:bg-[#772ce8] text-white rounded-lg transition-colors whitespace-nowrap"
              >
                Create New
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-[#18181b] dark:bg-white border-b border-[#2d2d31] dark:border-gray-200 px-4 sm:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search achievements..."
                className="w-full pl-10 pr-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none placeholder:text-gray-500"
              />
            </div>
            <select className="px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none">
              <option>All Achievements</option>
              <option>Enabled Only</option>
              <option>Disabled Only</option>
              <option>High Completion</option>
              <option>Low Completion</option>
            </select>
          </div>
        </div>

        {/* Achievements List */}
        <div className="p-4 sm:p-8">
          <div className="space-y-4">
            {achievements.map(achievement => (
              <div
                key={achievement.id}
                className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-6 hover:border-[#9146FF] transition-colors"
              >
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-[#9146FF] to-[#772ce8] rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                    {achievement.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl text-white dark:text-gray-900 mb-1">
                          {achievement.title}
                        </h3>
                        <p className="text-gray-400 dark:text-gray-600 text-sm sm:text-base">
                          {achievement.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="p-2 bg-[#2d2d31] dark:bg-gray-100 hover:bg-[#3d3d41] dark:hover:bg-gray-200 text-gray-300 dark:text-gray-700 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-[#ff4444]/20 hover:bg-[#ff4444]/30 text-[#ff4444] rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 dark:text-gray-600">XP:</span>
                        <span className="text-[#ffd700]">{achievement.xp}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#00f593]" />
                        <span className="text-gray-400 dark:text-gray-600">Completion:</span>
                        <span className="text-white dark:text-gray-900">
                          {achievement.completion}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="h-2 bg-[#2d2d31] dark:bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#9146FF] to-[#772ce8]"
                          style={{ width: `${achievement.completion}%` }}
                        />
                      </div>
                    </div>

                    {/* Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            achievement.enabled ? 'bg-[#00f593]' : 'bg-gray-500'
                          }`}
                        />
                        <span className="text-sm text-gray-400">
                          {achievement.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <button
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          achievement.enabled ? 'bg-[#9146FF]' : 'bg-[#4d4d51]'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                            achievement.enabled ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
