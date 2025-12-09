import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ChannelSelector } from './ChannelSelector';
import { Search, Download, Star, Filter, Menu, X, Plus } from 'lucide-react';

interface MarketplaceProps {
  onNavigate: (page: any) => void;
}

const communityAchievements = [
  {
    id: 1,
    title: 'Speed Runner',
    description: 'Complete a game in under 2 hours',
    category: 'Watch time',
    difficulty: 'Hard',
    xp: 1000,
    icon: '⚡',
    downloads: 234,
    rating: 4.8,
  },
  {
    id: 2,
    title: 'Hype Train Conductor',
    description: 'Participate in 5 hype trains',
    category: 'Chat interaction',
    difficulty: 'Medium',
    xp: 500,
    icon: '🚂',
    downloads: 567,
    rating: 4.9,
  },
  {
    id: 3,
    title: 'Generous Supporter',
    description: 'Donate bits 10 times',
    category: 'Donations',
    difficulty: 'Medium',
    xp: 750,
    icon: '💝',
    downloads: 892,
    rating: 4.7,
  },
  {
    id: 4,
    title: 'Emote Master',
    description: 'Use 50 different emotes',
    category: 'Chat interaction',
    difficulty: 'Easy',
    xp: 200,
    icon: '😎',
    downloads: 1234,
    rating: 4.6,
  },
  {
    id: 5,
    title: 'Marathon Viewer',
    description: 'Watch for 8 hours straight',
    category: 'Watch time',
    difficulty: 'Hard',
    xp: 1500,
    icon: '🏃',
    downloads: 445,
    rating: 4.5,
  },
  {
    id: 6,
    title: 'Raid Leader',
    description: 'Join 20 channel raids',
    category: 'Points',
    difficulty: 'Medium',
    xp: 600,
    icon: '⚔️',
    downloads: 678,
    rating: 4.8,
  },
  {
    id: 7,
    title: 'Clip Creator',
    description: 'Create 10 clips',
    category: 'Chat interaction',
    difficulty: 'Easy',
    xp: 300,
    icon: '🎬',
    downloads: 923,
    rating: 4.7,
  },
  {
    id: 8,
    title: 'Prime Member',
    description: 'Use Prime Gaming sub',
    category: 'Donations',
    difficulty: 'Easy',
    xp: 400,
    icon: '👑',
    downloads: 1567,
    rating: 4.9,
  },
];

const categories = ['All', 'Chat interaction', 'Watch time', 'Donations', 'Points'];

export function Marketplace({ onNavigate }: MarketplaceProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <Sidebar 
        currentPage="marketplace" 
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
                <h1 className="text-2xl sm:text-3xl text-white dark:text-gray-900 mb-2">Community Marketplace</h1>
                <p className="text-gray-400 dark:text-gray-600 text-sm sm:text-base">Discover and add achievements created by the community</p>
              </div>
            </div>
            
            {/* Channel Selector */}
            <div className="relative hidden sm:block flex-shrink-0">
              <ChannelSelector />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-[#18181b] dark:bg-white border-b border-[#2d2d31] dark:border-gray-200 px-4 sm:px-8 py-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Find new quests for your community..."
                className="w-full pl-10 pr-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none placeholder:text-gray-500"
              />
            </div>
            <button 
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="lg:hidden px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 hover:bg-[#3d3d41] dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg transition-colors"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar Filters */}
          <div className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[#18181b] dark:bg-white border-r border-[#2d2d31] dark:border-gray-200 p-6 overflow-y-auto transition-transform duration-300 ${
            filtersOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}>
            {/* Mobile close button */}
            <div className="lg:hidden flex justify-end mb-4">
              <button onClick={() => setFiltersOpen(false)} className="text-gray-400 dark:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <h3 className="text-white dark:text-gray-900 mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${
                    category === 'All'
                      ? 'bg-[#9146FF] text-white'
                      : 'text-gray-400 dark:text-gray-600 hover:bg-[#2d2d31] dark:hover:bg-gray-100 hover:text-white dark:hover:text-gray-900'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-white dark:text-gray-900 mb-4">Difficulty</h3>
              <div className="space-y-2">
                {['All Levels', 'Easy', 'Medium', 'Hard'].map((level) => (
                  <label key={level} className="flex items-center gap-3 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      defaultChecked={level === 'All Levels'}
                      className="w-4 h-4 rounded border-[#4d4d51] dark:border-gray-300 bg-[#2d2d31] dark:bg-gray-100 text-[#9146FF] focus:ring-[#9146FF]"
                    />
                    <span className="text-gray-400 dark:text-gray-600">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-white dark:text-gray-900 mb-4">Sort By</h3>
              <select className="w-full px-4 py-2 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none text-sm">
                <option>Most Popular</option>
                <option>Highest Rated</option>
                <option>Newest</option>
                <option>Most Downloads</option>
              </select>
            </div>
          </div>

          {/* Overlay for mobile filters */}
          {filtersOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-20 lg:hidden"
              onClick={() => setFiltersOpen(false)}
            />
          )}

          {/* Achievement Grid */}
          <div className="flex-1 p-4 sm:p-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {communityAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl overflow-hidden hover:border-[#9146FF] transition-colors"
                >
                  {/* Card Header */}
                  <div className="p-4 sm:p-6 border-b border-[#2d2d31] dark:border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#9146FF] to-[#772ce8] rounded-xl flex items-center justify-center text-3xl">
                        {achievement.icon}
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs ${
                          achievement.difficulty === 'Easy'
                            ? 'bg-[#00f593]/20 text-[#00f593]'
                            : achievement.difficulty === 'Medium'
                            ? 'bg-[#ffd700]/20 text-[#ffd700]'
                            : 'bg-[#ff4444]/20 text-[#ff4444]'
                        }`}
                      >
                        {achievement.difficulty}
                      </div>
                    </div>
                    <h3 className="text-lg sm:text-xl text-white dark:text-gray-900 mb-2">{achievement.title}</h3>
                    <p className="text-gray-400 dark:text-gray-600 text-sm mb-4">{achievement.description}</p>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-[#ffd700] fill-[#ffd700]" />
                        <span className="text-white dark:text-gray-900">{achievement.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 dark:text-gray-600">
                        <Download className="w-4 h-4" />
                        <span>{achievement.downloads}</span>
                      </div>
                      <div className="text-[#ffd700]">{achievement.xp} XP</div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-4 bg-[#1a1a1d] dark:bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-400 dark:text-gray-600">{achievement.category}</span>
                    </div>
                    <button className="w-full px-4 py-2 bg-[#9146FF] hover:bg-[#772ce8] text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add to Channel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}