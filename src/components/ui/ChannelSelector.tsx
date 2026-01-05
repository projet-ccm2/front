import { useState } from 'react'
import { ChevronDown, Check, Plus } from 'lucide-react'
import { useChannel } from '../../context/ChannelContext'

export function ChannelSelector() {
  const { selectedChannel, setSelectedChannel, availableChannels } = useChannel()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 hover:bg-[#3d3d41] dark:hover:bg-gray-200 rounded-lg text-white dark:text-gray-900 transition-colors"
      >
        <div className="w-8 h-8 bg-[#9146FF] rounded-full flex items-center justify-center flex-shrink-0">
          <span>{selectedChannel.avatar}</span>
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-sm">{selectedChannel.name}</div>
          <div className="text-xs text-gray-400 dark:text-gray-600">{selectedChannel.role}</div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 w-full h-full cursor-default"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-[#2d2d31] dark:border-gray-200">
            <div className="text-xs text-gray-400 dark:text-gray-600 px-2">MANAGE CHANNELS</div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {availableChannels.map(channel => (
              <button
                key={channel.id}
                onClick={() => {
                  setSelectedChannel(channel)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2d2d31] dark:hover:bg-gray-50 transition-colors ${
                  selectedChannel.id === channel.id ? 'bg-[#9146FF]/20' : ''
                }`}
              >
                <div className="w-12 h-12 bg-[#9146FF] rounded-full flex items-center justify-center text-lg flex-shrink-0">
                  {channel.avatar}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="text-sm text-white dark:text-gray-900 truncate">
                    {channel.name}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-600">
                    {channel.role} • {channel.followers.toLocaleString()} followers
                  </div>
                </div>
                {selectedChannel.id === channel.id && (
                  <Check className="w-5 h-5 text-[#9146FF] flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          <div className="p-2 border-t border-[#2d2d31] dark:border-gray-200">
            <button className="w-full px-4 py-3 text-sm text-[#9146FF] hover:bg-[#2d2d31] dark:hover:bg-gray-50 rounded-lg transition-colors text-left flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Channel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
