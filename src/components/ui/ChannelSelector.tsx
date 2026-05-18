import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useChannel } from '../../context/ChannelContext'
import { useLanguage } from '../../context/LanguageContext'

export function ChannelSelector() {
  const { selectedChannel, setSelectedChannel, availableChannels } = useChannel()
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  if (!selectedChannel) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-[#2d2d31] px-4 py-3 animate-pulse dark:bg-gray-100">
        <div className="h-8 w-8 rounded-full bg-gray-600" />
        <div className="h-4 w-24 rounded bg-gray-600" />
      </div>
    )
  }

  const isUrl = (str: string) => str.startsWith('http')
  const resolveRoleLabel = (role: string) => {
    if (role === 'Owner') {
      return t('channel.owner')
    }

    if (role === 'Moderator') {
      return t('channel.moderator')
    }

    return role
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-lg bg-[#2d2d31] px-4 py-3 text-white transition-colors hover:bg-[#3d3d41] dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
      >
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#9146FF]">
          {isUrl(selectedChannel.avatar) ? (
            <img src={selectedChannel.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <span>{selectedChannel.avatar}</span>
          )}
        </div>
        <div className="hidden text-left sm:block">
          <div className="text-sm">{selectedChannel.name}</div>
          <div className="text-xs text-gray-400 dark:text-gray-600">
            {resolveRoleLabel(selectedChannel.role)}
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 h-full w-full cursor-default"
          onClick={() => setIsOpen(false)}
          aria-label={t('channel.closeMenu')}
        />
      )}

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-[#2d2d31] bg-[#18181b] shadow-2xl dark:border-gray-200 dark:bg-white">
          <div className="border-b border-[#2d2d31] p-3 dark:border-gray-200">
            <div className="px-2 text-xs text-gray-400 dark:text-gray-600">
              {t('channel.manageChannels')}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {availableChannels.map(channel => (
              <button
                key={channel.id}
                onClick={() => {
                  setSelectedChannel(channel)
                  setIsOpen(false)
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-[#2d2d31] dark:hover:bg-gray-50 ${
                  selectedChannel.id === channel.id ? 'bg-[#9146FF]/20' : ''
                }`}
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#9146FF] text-lg">
                  {isUrl(channel.avatar) ? (
                    <img src={channel.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    channel.avatar
                  )}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="truncate text-sm text-white dark:text-gray-900">
                    {channel.name}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-600">
                    {resolveRoleLabel(channel.role)}
                    {channel.followers > 0 &&
                      ` • ${t('channel.followers', { count: channel.followers.toLocaleString() })}`}
                  </div>
                </div>
                {selectedChannel.id === channel.id && (
                  <Check className="h-5 w-5 flex-shrink-0 text-[#9146FF]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
