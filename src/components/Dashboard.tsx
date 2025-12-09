import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ChannelSelector } from './ChannelSelector';
import { TrendingUp, Users, Award, Activity, Menu } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  onNavigate: (page: any) => void;
}

const engagementData = [
  { day: 'Mon', users: 145 },
  { day: 'Tue', users: 189 },
  { day: 'Wed', users: 234 },
  { day: 'Thu', users: 298 },
  { day: 'Fri', users: 356 },
  { day: 'Sat', users: 421 },
  { day: 'Sun', users: 389 },
];

const recentActivity = [
  { user: 'xXGamerXx', achievement: 'First Steps', time: '2 minutes ago' },
  { user: 'StreamFan42', achievement: 'Chat Master', time: '5 minutes ago' },
  { user: 'NightOwl', achievement: 'Loyal Viewer', time: '12 minutes ago' },
  { user: 'ProGamer99', achievement: 'Week Warrior', time: '18 minutes ago' },
  { user: 'CasualVibes', achievement: 'First Steps', time: '23 minutes ago' },
];

export function Dashboard({ onNavigate }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <Sidebar 
        currentPage="dashboard" 
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 overflow-auto bg-[#0e0e10] dark:bg-gray-50">
        {/* Header */}
        <div className="bg-[#18181b] dark:bg-white border-b border-[#2d2d31] dark:border-gray-200 px-4 sm:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-white dark:text-gray-900 flex-shrink-0"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl text-white dark:text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-400 dark:text-gray-600 text-sm sm:text-base">Welcome back, manage your gamification system</p>
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
                <span className="text-xs text-[#00f593]">+12%</span>
              </div>
              <div className="text-2xl sm:text-3xl text-white dark:text-gray-900 mb-1">24</div>
              <div className="text-xs sm:text-sm text-gray-400 dark:text-gray-600">Active Achievements</div>
            </div>

            <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#00f593]/20 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#00f593]" />
                </div>
                <span className="text-xs text-[#00f593]">+24%</span>
              </div>
              <div className="text-2xl sm:text-3xl text-white dark:text-gray-900 mb-1">1,284</div>
              <div className="text-xs sm:text-sm text-gray-400 dark:text-gray-600">Active Users</div>
            </div>

            <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#ffd700]/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#ffd700]" />
                </div>
                <span className="text-xs text-[#00f593]">+8%</span>
              </div>
              <div className="text-2xl sm:text-3xl text-white dark:text-gray-900 mb-1">3,942</div>
              <div className="text-xs sm:text-sm text-gray-400 dark:text-gray-600">Total Unlocks</div>
            </div>

            <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#ff4444]/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff4444]" />
                </div>
                <span className="text-xs text-[#00f593]">+32%</span>
              </div>
              <div className="text-2xl sm:text-3xl text-white dark:text-gray-900 mb-1">67%</div>
              <div className="text-xs sm:text-sm text-gray-400 dark:text-gray-600">Engagement Rate</div>
            </div>
          </div>

          {/* Charts and Activity */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Engagement Chart */}
            <div className="lg:col-span-2 bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-6">
              <div className="mb-6">
                <h2 className="text-lg sm:text-xl text-white dark:text-gray-900 mb-1">User Engagement</h2>
                <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-600">Active users over the last 7 days</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d2d31" className="dark:stroke-gray-200" />
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
                    dataKey="users"
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
                <h2 className="text-lg sm:text-xl text-white dark:text-gray-900 mb-1">Recent Activity</h2>
                <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-600">Latest achievement unlocks</p>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#9146FF] to-[#772ce8] rounded-full flex items-center justify-center flex-shrink-0">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white dark:text-gray-900 truncate">{activity.user}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-600 truncate">{activity.achievement}</div>
                      <div className="text-xs text-gray-500">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 sm:mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <button
              onClick={() => onNavigate('creator')}
              className="bg-gradient-to-br from-[#9146FF] to-[#772ce8] rounded-xl p-6 text-left hover:from-[#772ce8] hover:to-[#9146FF] transition-all transform hover:scale-105"
            >
              <div className="text-white text-lg sm:text-xl mb-2">Create Achievement</div>
              <div className="text-gray-200 text-sm">Design a new quest for your viewers</div>
            </button>

            <button
              onClick={() => onNavigate('marketplace')}
              className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 hover:border-[#9146FF] dark:hover:border-[#9146FF] hover:bg-[#1f1f23] dark:hover:bg-gray-50 rounded-xl p-6 text-left transition-colors"
            >
              <div className="text-white dark:text-gray-900 text-lg sm:text-xl mb-2">Browse Marketplace</div>
              <div className="text-gray-400 dark:text-gray-600 text-sm">Discover community achievements</div>
            </button>

            <button
              onClick={() => onNavigate('management')}
              className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 hover:border-[#9146FF] dark:hover:border-[#9146FF] hover:bg-[#1f1f23] dark:hover:bg-gray-50 rounded-xl p-6 text-left transition-colors sm:col-span-2 lg:col-span-1"
            >
              <div className="text-white dark:text-gray-900 text-lg sm:text-xl mb-2">Manage Achievements</div>
              <div className="text-gray-400 dark:text-gray-600 text-sm">Edit and toggle your quests</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}