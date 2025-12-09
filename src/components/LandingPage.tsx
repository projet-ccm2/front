import { Trophy, Users, Smartphone, TrendingUp, Zap, Award, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface LandingPageProps {
  onConnect: () => void;
}

export function LandingPage({ onConnect }: LandingPageProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#0e0e10] dark:bg-gray-50 text-white dark:text-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#9146FF]/20 via-transparent to-transparent" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#9146FF]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#00f593]/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12 sm:mb-20 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#9146FF] to-[#772ce8] rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <span className="text-xl sm:text-2xl">Stream Quest</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-3 bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 hover:bg-[#2d2d31] dark:hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                )}
              </button>
              <button
                onClick={onConnect}
                className="w-full sm:w-auto px-6 py-3 bg-[#9146FF] hover:bg-[#772ce8] rounded-lg transition-colors text-white"
              >
                Connect with Twitch
              </button>
            </div>
          </div>

          {/* Hero Content */}
          <div className="text-center mb-12 sm:mb-20">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-white dark:from-gray-900 via-[#9146FF] to-[#00f593] bg-clip-text text-transparent">
              Gamify Your Stream
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 dark:text-gray-600 max-w-2xl mx-auto mb-8 px-4">
              Transform viewer engagement with achievements, quests, and rewards. Keep your community active and invested with Stream Quest.
            </p>
            <button
              onClick={onConnect}
              className="px-8 py-4 bg-gradient-to-r from-[#9146FF] to-[#772ce8] hover:from-[#772ce8] hover:to-[#9146FF] rounded-lg transition-all transform hover:scale-105 text-white"
            >
              Get Started Free
            </button>
          </div>

          {/* Feature Highlights */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-20">
            <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-6 sm:p-8 hover:border-[#9146FF] transition-colors">
              <div className="w-12 h-12 bg-[#9146FF]/20 rounded-lg flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-[#9146FF]" />
              </div>
              <h3 className="text-lg sm:text-xl mb-3">Achievement System</h3>
              <p className="text-gray-400 dark:text-gray-600 text-sm sm:text-base">Create custom achievements for your viewers. Reward chat participation, watch time, and more.</p>
            </div>

            <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-6 sm:p-8 hover:border-[#00f593] transition-colors">
              <div className="w-12 h-12 bg-[#00f593]/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-[#00f593]" />
              </div>
              <h3 className="text-lg sm:text-xl mb-3">Boost Retention</h3>
              <p className="text-gray-400 dark:text-gray-600 text-sm sm:text-base">Keep viewers engaged longer with progression systems and exclusive rewards for loyal fans.</p>
            </div>

            <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-6 sm:p-8 hover:border-[#ff4444] transition-colors sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 bg-[#ff4444]/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-[#ff4444]" />
              </div>
              <h3 className="text-lg sm:text-xl mb-3">Analytics Dashboard</h3>
              <p className="text-gray-400 dark:text-gray-600 text-sm sm:text-base">Track engagement metrics and see how gamification impacts your community growth.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="bg-[#18181b] dark:bg-white py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl text-center mb-4">Complete Ecosystem</h2>
          <p className="text-center text-gray-400 dark:text-gray-600 mb-8 sm:mb-12">Everything you need to gamify your stream</p>
          
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Extension */}
            <div className="bg-[#0e0e10] dark:bg-gray-50 border border-[#2d2d31] dark:border-gray-200 rounded-xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#9146FF]/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#9146FF]" />
                </div>
                <h3 className="text-xl sm:text-2xl">Twitch Extension</h3>
              </div>
              <p className="text-gray-400 dark:text-gray-600 text-sm sm:text-base mb-4">
                Real-time overlay that displays active quests and achievements directly on your stream. Viewers can track their progress without leaving the video.
              </p>
              <ul className="space-y-2 text-sm sm:text-base text-gray-300 dark:text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#9146FF] rounded-full" />
                  Live progress tracking
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#9146FF] rounded-full" />
                  Instant notifications
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#9146FF] rounded-full" />
                  Customizable appearance
                </li>
              </ul>
            </div>

            {/* Mobile App */}
            <div className="bg-[#0e0e10] dark:bg-gray-50 border border-[#2d2d31] dark:border-gray-200 rounded-xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#00f593]/20 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-[#00f593]" />
                </div>
                <h3 className="text-xl sm:text-2xl">Web Dashboard</h3>
              </div>
              <p className="text-gray-400 dark:text-gray-600 text-sm sm:text-base mb-4">
                Powerful creator dashboard to design achievements, manage your community, and analyze engagement metrics from anywhere.
              </p>
              <ul className="space-y-2 text-sm sm:text-base text-gray-300 dark:text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#00f593] rounded-full" />
                  AI-powered achievement generator
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#00f593] rounded-full" />
                  Community marketplace
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#00f593] rounded-full" />
                  Advanced analytics
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Award className="w-12 h-12 sm:w-16 sm:h-16 text-[#9146FF] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl mb-4">Ready to Level Up?</h2>
          <p className="text-lg sm:text-xl text-gray-400 dark:text-gray-600 mb-8">
            Join thousands of streamers using Stream Quest to build stronger communities
          </p>
          <button
            onClick={onConnect}
            className="px-8 py-4 bg-[#9146FF] hover:bg-[#772ce8] rounded-lg transition-colors text-white"
          >
            Connect with Twitch
          </button>
        </div>
      </div>
    </div>
  );
}