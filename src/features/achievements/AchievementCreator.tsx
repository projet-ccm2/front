import { useState } from 'react'
import { Sidebar } from '../../components/layout/Sidebar'
import { ChannelSelector } from '../../components/ui/ChannelSelector'
import { Sparkles, Upload, Plus, Save, Send, Menu, Trash2 } from 'lucide-react'

interface AchievementCreatorProps {
  onNavigate: (page: string) => void
}

export function AchievementCreator({ onNavigate }: Readonly<AchievementCreatorProps>) {
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple')
  const [isHidden, setIsHidden] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [xpValue, setXpValue] = useState('100')
  const [conditions, setConditions] = useState<{ id: string; value: string }[]>([
    { id: '1', value: 'Watch time > 1 hour' },
  ])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleAIGenerate = () => {
    // Mock AI generation
    setTitle('Chat Warrior')
    setDescription('Send 100 messages in chat to prove your dedication to the community')
    setXpValue('250')
    setConditions([{ id: crypto.randomUUID(), value: 'Chat messages sent >= 100' }])
  }

  const addCondition = () => {
    setConditions([...conditions, { id: crypto.randomUUID(), value: 'New condition' }])
  }

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index))
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        currentPage="creator"
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
                data-testid="mobile-menu-btn"
                className="lg:hidden text-white dark:text-gray-900 flex-shrink-0"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl text-white dark:text-gray-900 mb-2">
                  Create Achievement
                </h1>
                <p className="text-gray-400 dark:text-gray-600 text-sm sm:text-base">
                  Design a new quest for your community
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
        <div className="max-w-4xl mx-auto p-4 sm:p-8">
          <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl overflow-hidden">
            {/* AI Generate Banner */}
            <div className="bg-gradient-to-r from-[#9146FF]/20 to-[#772ce8]/20 border-b border-[#2d2d31] dark:border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#9146FF] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white dark:text-gray-900">AI-Powered Generation</div>
                    <div className="text-sm text-gray-400 dark:text-gray-600">
                      Let AI create an achievement based on your channel context
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleAIGenerate}
                  className="w-full sm:w-auto px-6 py-3 bg-[#9146FF] hover:bg-[#772ce8] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate with AI
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-4 sm:p-8">
              {/* Badge Upload */}
              <div className="mb-8">
                <div className="block text-white dark:text-gray-900 mb-3 font-medium">
                  Achievement Icon
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-32 h-32 bg-[#2d2d31] dark:bg-gray-100 rounded-xl border-2 border-dashed border-[#4d4d51] dark:border-gray-300 flex items-center justify-center hover:border-[#9146FF] transition-colors cursor-pointer flex-shrink-0">
                    <Upload className="w-8 h-8 text-gray-500" />
                  </div>
                  <div className="flex-1 w-full text-center sm:text-left">
                    <button className="px-4 py-2 bg-[#2d2d31] dark:bg-gray-100 hover:bg-[#3d3d41] dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg transition-colors">
                      Upload Image
                    </button>
                    <p className="text-sm text-gray-400 dark:text-gray-600 mt-2">
                      Recommended: 512x512px PNG or JPG
                    </p>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="mb-6">
                <label
                  htmlFor="achievement-title"
                  className="block text-white dark:text-gray-900 mb-3"
                >
                  Achievement Title
                </label>
                <input
                  id="achievement-title"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter achievement name..."
                  className="w-full px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none transition-colors placeholder:text-gray-500"
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label
                  htmlFor="achievement-description"
                  className="block text-white dark:text-gray-900 mb-3"
                >
                  Description
                </label>
                <textarea
                  id="achievement-description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe how to unlock this achievement..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none transition-colors resize-none placeholder:text-gray-500"
                />
              </div>

              {/* XP Value */}
              <div className="mb-6">
                <label
                  htmlFor="achievement-xp"
                  className="block text-white dark:text-gray-900 mb-3"
                >
                  XP / Points Value
                </label>
                <div className="flex items-center gap-4">
                  <input
                    id="achievement-xp"
                    type="number"
                    value={xpValue}
                    onChange={e => setXpValue(e.target.value)}
                    className="w-32 px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none transition-colors"
                  />
                  <span className="text-gray-400 dark:text-gray-600">XP awarded on completion</span>
                </div>
              </div>

              {/* Toggle Options */}
              <div className="mb-8 space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#2d2d31] dark:bg-gray-100 rounded-lg">
                  <div>
                    <div className="text-white dark:text-gray-900">Hidden Achievement</div>
                    <div className="text-sm text-gray-400 dark:text-gray-600">
                      Hide this achievement until unlocked
                    </div>
                  </div>
                  <button
                    onClick={() => setIsHidden(!isHidden)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      isHidden ? 'bg-[#9146FF]' : 'bg-[#4d4d51] dark:bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        isHidden ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setMode('simple')}
                    className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                      mode === 'simple'
                        ? 'bg-[#9146FF] text-white'
                        : 'bg-[#2d2d31] dark:bg-gray-100 text-gray-400 dark:text-gray-600 hover:bg-[#3d3d41] dark:hover:bg-gray-200'
                    }`}
                  >
                    Simple Mode
                  </button>
                  <button
                    onClick={() => setMode('advanced')}
                    className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                      mode === 'advanced'
                        ? 'bg-[#9146FF] text-white'
                        : 'bg-[#2d2d31] dark:bg-gray-100 text-gray-400 dark:text-gray-600 hover:bg-[#3d3d41] dark:hover:bg-gray-200'
                    }`}
                  >
                    Advanced Mode
                  </button>
                </div>
              </div>

              {/* Trigger Conditions */}
              {mode === 'advanced' && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <div className="block text-white dark:text-gray-900 font-medium">
                      Trigger Conditions
                    </div>
                    <button
                      onClick={addCondition}
                      className="flex items-center gap-2 px-3 py-2 bg-[#2d2d31] dark:bg-gray-100 hover:bg-[#3d3d41] dark:hover:bg-gray-200 text-gray-300 dark:text-gray-700 rounded-lg transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add Condition</span>
                    </button>
                  </div>
                  <div className="space-y-3">
                    {conditions.map((condition, index) => (
                      <div
                        key={condition.id}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                      >
                        <select className="flex-1 px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none">
                          <option>Watch time</option>
                          <option>Chat messages</option>
                          <option>Stream attendance</option>
                          <option>Points earned</option>
                        </select>
                        <select className="px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none">
                          <option>&gt;=</option>
                          <option>&gt;</option>
                          <option>=</option>
                          <option>&lt;</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Value"
                          className="w-full sm:w-32 px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none placeholder:text-gray-500"
                        />
                        <button
                          onClick={() => removeCondition(index)}
                          data-testid={`remove-condition-${index}`}
                          className="p-2 hover:bg-[#2d2d31] rounded-lg text-gray-400 hover:text-[#ff4444]"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Version Update */}
              <div className="mb-8 p-4 bg-[#2d2d31] dark:bg-gray-100 rounded-lg border-l-4 border-[#00f593]">
                <div className="flex items-center gap-2 text-[#00f593] mb-1">
                  <div className="w-2 h-2 bg-[#00f593] rounded-full" />
                  <span>Version 1.0</span>
                </div>
                <div className="text-sm text-gray-400 dark:text-gray-600">
                  This is a new achievement
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4">
                <button className="px-6 py-3 bg-[#2d2d31] dark:bg-gray-100 hover:bg-[#3d3d41] dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Draft
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-[#9146FF] to-[#772ce8] hover:from-[#772ce8] hover:to-[#9146FF] text-white rounded-lg transition-all flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  Publish Achievement
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
