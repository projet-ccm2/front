import { ChannelSelector } from '../../components/ui/ChannelSelector'
import { TrendingUp, Users, Award, Activity, Menu, Plus, Store, ChevronRight } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useLanguage } from '../../context/LanguageContext'
import { useDashboardData } from './hooks/useDashboardData'

interface DashboardProps {
  onNavigate: (page: string) => void
  onOpenSidebar: () => void
}

export function Dashboard({ onNavigate, onOpenSidebar }: Readonly<DashboardProps>) {
  const { t } = useLanguage()
  const { engagementData, recentActivity, stats, loading, errorMessage, contextMessage } =
    useDashboardData()

  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 overflow-auto bg-[#0e0e10] dark:bg-gray-50">
          <div className="bg-[#18181b] dark:bg-white border-b border-[#2d2d31] dark:border-gray-200 px-4 sm:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <button
                  onClick={onOpenSidebar}
                  data-testid="mobile-menu-btn"
                  className="lg:hidden text-white dark:text-gray-900 flex-shrink-0"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl text-white dark:text-gray-900 mb-2">
                    {t('dashboard.title')}
                  </h1>
                  <p className="text-gray-400 dark:text-gray-600 text-sm sm:text-base">
                    {t('dashboard.subtitle')}
                  </p>
                </div>
              </div>

              <div className="relative hidden sm:block flex-shrink-0">
                <ChannelSelector />
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-8">
            <div className="rounded-xl border border-[#2d2d31] bg-[#18181b] p-6 text-gray-400 dark:border-gray-200 dark:bg-white dark:text-gray-600">
              {t('dashboard.loading')}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 overflow-auto bg-[#0e0e10] dark:bg-gray-50">
        {/* Header */}
        <div className="bg-[#18181b] dark:bg-white border-b border-[#2d2d31] dark:border-gray-200 px-4 sm:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={onOpenSidebar}
                data-testid="mobile-menu-btn"
                className="lg:hidden text-white dark:text-gray-900 flex-shrink-0"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl text-white dark:text-gray-900 mb-2">
                  {t('dashboard.title')}
                </h1>
                <p className="text-gray-400 dark:text-gray-600 text-sm sm:text-base">
                  {t('dashboard.subtitle')}
                </p>
              </div>
            </div>

            {/* Channel Selector */}
            <div className="relative hidden sm:block flex-shrink-0">
              <ChannelSelector />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 sm:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#9146FF]/20 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-[#9146FF]" />
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-600">
                  {t('dashboard.stats.totalSuffix', { count: stats.totalAchievements })}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl text-white dark:text-gray-900 mb-1">
                {stats.activeAchievements}
              </div>
              <div className="text-xs sm:text-sm text-gray-400 dark:text-gray-600">
                {t('dashboard.stats.activeAchievements')}
              </div>
            </div>

            <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#00f593]/20 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#00f593]" />
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-600">
                  {t('dashboard.stats.channelReady')}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl text-white dark:text-gray-900 mb-1">
                {stats.publicTemplates}
              </div>
              <div className="text-xs sm:text-sm text-gray-400 dark:text-gray-600">
                {t('dashboard.stats.publicTemplates')}
              </div>
            </div>

            <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#ffd700]/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#ffd700]" />
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-600">
                  {t('dashboard.stats.yourProgress')}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl text-white dark:text-gray-900 mb-1">
                {stats.completedAchievements}
              </div>
              <div className="text-xs sm:text-sm text-gray-400 dark:text-gray-600">
                {t('dashboard.stats.completedAchievements')}
              </div>
            </div>

            <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#ff4444]/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff4444]" />
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-600">
                  {t('dashboard.stats.earned')}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl text-white dark:text-gray-900 mb-1">
                {stats.totalXpEarned}
              </div>
              <div className="text-xs sm:text-sm text-gray-400 dark:text-gray-600">
                {t('dashboard.stats.achievementXp')}
              </div>
            </div>
          </div>

          {contextMessage && (
            <div className="mb-6 rounded-xl border border-[#2d2d31] bg-[#18181b] p-4 text-sm text-gray-400 dark:border-gray-200 dark:bg-white dark:text-gray-600">
              {contextMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 rounded-xl border border-[#ff4444]/40 bg-[#ff4444]/10 p-4 text-sm text-[#ff8080] dark:text-[#b42318]">
              {errorMessage}
            </div>
          )}

          {/* Charts and Activity */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Engagement Chart */}
            <div className="lg:col-span-2 bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-6">
              <div className="mb-6">
                <h2 className="text-lg sm:text-xl text-white dark:text-gray-900 mb-1">
                  {t('dashboard.chart.title')}
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-600">
                  {t('dashboard.chart.description')}
                </p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={engagementData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#2d2d31"
                    className="dark:stroke-gray-200"
                  />
                  <XAxis dataKey="day" stroke="#666" className="dark:stroke-gray-900" />
                  <YAxis stroke="#666" className="dark:stroke-gray-900" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #2d2d31',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="unlocks"
                    stroke="#9146FF"
                    strokeWidth={3}
                    dot={{ fill: '#9146FF', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-6">
              <div className="mb-6">
                <h2 className="text-lg sm:text-xl text-white dark:text-gray-900 mb-1">
                  {t('dashboard.activity.title')}
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-600">
                  {t('dashboard.activity.description')}
                </p>
              </div>
              {recentActivity.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#2d2d31] bg-[#0e0e10] p-6 text-sm text-gray-400 dark:border-gray-200 dark:bg-gray-50 dark:text-gray-600">
                  {t('dashboard.activity.empty')}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#9146FF] to-[#772ce8] rounded-full flex items-center justify-center flex-shrink-0">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white dark:text-gray-900 truncate">
                          {activity.user}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-600 truncate">
                          {activity.achievement}
                        </div>
                        <div className="text-xs text-gray-500">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 sm:mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <button
              onClick={() => onNavigate('creator')}
              data-testid="quick-create-btn"
              className="w-full flex items-center justify-between p-4 bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl hover:border-[#9146FF] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#9146FF]/10 rounded-lg text-[#9146FF] group-hover:bg-[#9146FF] group-hover:text-white transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-white dark:text-gray-900 font-medium">
                    {t('dashboard.quick.create.title')}
                  </div>
                  <div className="text-sm text-gray-400 dark:text-gray-600">
                    {t('dashboard.quick.create.description')}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-600" />
            </button>

            <button
              onClick={() => onNavigate('marketplace')}
              data-testid="quick-marketplace-btn"
              className="w-full flex items-center justify-between p-4 bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl hover:border-[#9146FF] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#00f593]/10 rounded-lg text-[#00f593] group-hover:bg-[#00f593] group-hover:text-white transition-colors">
                  <Store className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-white dark:text-gray-900 font-medium">
                    {t('dashboard.quick.marketplace.title')}
                  </div>
                  <div className="text-sm text-gray-400 dark:text-gray-600">
                    {t('dashboard.quick.marketplace.description')}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-600" />
            </button>

            <button
              onClick={() => onNavigate('management')}
              data-testid="quick-manage-btn"
              className="w-full flex items-center justify-between p-4 bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl hover:border-[#9146FF] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#ffd700]/10 rounded-lg text-[#ffd700] group-hover:bg-[#ffd700] group-hover:text-white transition-colors">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-white dark:text-gray-900 font-medium">
                    {t('dashboard.quick.management.title')}
                  </div>
                  <div className="text-sm text-gray-400 dark:text-gray-600">
                    {t('dashboard.quick.management.description')}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
