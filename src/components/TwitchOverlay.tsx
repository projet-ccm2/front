import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ChannelSelector } from './ChannelSelector';
import { Trophy, Eye, Menu } from 'lucide-react';

interface TwitchOverlayProps {
  onNavigate: (page: any) => void;
}

const activeQuests = [
  {
    id: 1,
    title: 'Chat Master',
    description: 'Send 100 messages',
    progress: 75,
    max: 100,
    completed: false,
    icon: '💬',
  },
  {
    id: 2,
    title: 'Loyal Viewer',
    description: 'Watch 10 streams',
    progress: 10,
    max: 10,
    completed: true,
    icon: '👑',
  },
  {
    id: 3,
    title: 'Night Owl',
    description: 'Watch past midnight',
    progress: 1,
    max: 1,
    completed: true,
    icon: '🦉',
  },
  {
    id: 4,
    title: 'Week Warrior',
    description: 'Watch daily for 7 days',
    progress: 5,
    max: 7,
    completed: false,
    icon: '⚔️',
  },
  {
    id: 5,
    title: 'Emote Master',
    description: 'Use 50 different emotes',
    progress: 32,
    max: 50,
    completed: false,
    icon: '😎',
  },
];

export function TwitchOverlay({ onNavigate }: TwitchOverlayProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <Sidebar 
        currentPage="overlay" 
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
                <h1 className="text-2xl sm:text-3xl text-white dark:text-gray-900 mb-2">Twitch Extension Overlay</h1>
                <p className="text-gray-400 dark:text-gray-600 text-sm sm:text-base">Preview of the viewer-facing overlay panel</p>
              </div>
            </div>
            
            {/* Channel Selector */}
            <div className="relative hidden sm:block flex-shrink-0">
              <ChannelSelector />
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="p-4 sm:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-8 mb-6">
              <h2 className="text-lg sm:text-xl text-white dark:text-gray-900 mb-4">Extension Preview</h2>
              <p className="text-gray-400 dark:text-gray-600 text-sm sm:text-base mb-6">
                This is how the achievement overlay will appear to viewers on your Twitch stream. 
                The panel is designed to be compact and non-intrusive.
              </p>
              
              <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
                {/* Mock Stream Preview */}
                <div className="w-full lg:flex-1 bg-[#2d2d31] dark:bg-gray-200 rounded-xl aspect-video flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-600">
                    <div className="text-4xl sm:text-6xl mb-4">🎮</div>
                    <div className="text-sm sm:text-base">Stream Preview Area</div>
                  </div>
                </div>

                {/* Overlay Panel */}
                <div className="w-full lg:w-80 flex-shrink-0">
                  <div className="bg-black/90 backdrop-blur-sm border border-[#9146FF]/50 rounded-xl overflow-hidden shadow-2xl shadow-[#9146FF]/20">
                    {/* Panel Header */}
                    <div className="bg-gradient-to-r from-[#9146FF] to-[#772ce8] px-4 py-3 border-b border-[#9146FF]/30">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-white" />
                        <span className="text-white">Active Quests</span>
                      </div>
                    </div>

                    {/* Scrollable Quest List */}
                    <div className="max-h-[400px] sm:max-h-[500px] overflow-y-auto">
                      <div className="p-3 space-y-2">
                        {activeQuests.map((quest) => (
                          <div
                            key={quest.id}
                            className={`p-3 rounded-lg transition-all cursor-pointer ${
                              quest.completed
                                ? 'bg-gradient-to-r from-[#ffd700]/20 to-[#ffa500]/20 border border-[#ffd700]/50 shadow-lg shadow-[#ffd700]/20'
                                : 'bg-[#18181b]/80 border border-[#2d2d31] hover:border-[#9146FF]/50'
                            }`}
                          >
                            <div className="flex items-start gap-3 mb-2">
                              <div className={`text-2xl flex-shrink-0 ${quest.completed && 'animate-pulse'}`}>
                                {quest.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="text-white text-sm truncate">{quest.title}</div>
                                  {quest.completed && (
                                    <div className="px-2 py-0.5 bg-[#ffd700] text-black text-xs rounded-full flex-shrink-0">
                                      DONE
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400 truncate">{quest.description}</div>
                              </div>
                              <Eye className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">Progress</span>
                                <span className={quest.completed ? 'text-[#ffd700]' : 'text-gray-400'}>
                                  {quest.progress}/{quest.max}
                                </span>
                              </div>
                              <div className="h-1.5 bg-[#2d2d31] rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${
                                    quest.completed
                                      ? 'bg-gradient-to-r from-[#ffd700] to-[#ffa500]'
                                      : 'bg-gradient-to-r from-[#9146FF] to-[#772ce8]'
                                  }`}
                                  style={{ width: `${(quest.progress / quest.max) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Panel Footer */}
                    <div className="bg-[#18181b]/90 backdrop-blur-sm px-4 py-3 border-t border-[#2d2d31]">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-white">Level 42</span>
                        <span className="text-white">9,830 / 10,000 XP</span>
                      </div>
                      <div className="h-2 bg-[#1a1a1d] rounded-full overflow-hidden border border-[#2d2d31]">
                        <div
                          className="h-full bg-gradient-to-r from-[#9146FF] via-[#b366ff] to-[#772ce8] shadow-lg shadow-[#9146FF]/30"
                          style={{ width: '83%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Specs */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl text-white dark:text-gray-900 mb-4">Technical Specifications</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 dark:text-gray-600">Width:</span>
                    <span className="text-white dark:text-gray-900">320px</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 dark:text-gray-600">Background:</span>
                    <span className="text-white dark:text-gray-900">Semi-transparent black</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 dark:text-gray-600">Position:</span>
                    <span className="text-white dark:text-gray-900">Right sidebar</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 dark:text-gray-600">Update Rate:</span>
                    <span className="text-white dark:text-gray-900">Real-time</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl text-white dark:text-gray-900 mb-4">Features</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-gray-300 dark:text-gray-700">
                    <div className="w-1.5 h-1.5 bg-[#9146FF] rounded-full" />
                    Real-time progress tracking
                  </li>
                  <li className="flex items-center gap-2 text-gray-300 dark:text-gray-700">
                    <div className="w-1.5 h-1.5 bg-[#9146FF] rounded-full" />
                    Visual feedback on completion
                  </li>
                  <li className="flex items-center gap-2 text-gray-300 dark:text-gray-700">
                    <div className="w-1.5 h-1.5 bg-[#9146FF] rounded-full" />
                    Scrollable quest list
                  </li>
                  <li className="flex items-center gap-2 text-gray-300 dark:text-gray-700">
                    <div className="w-1.5 h-1.5 bg-[#9146FF] rounded-full" />
                    Level and XP display
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}