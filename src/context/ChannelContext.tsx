/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { useLanguage } from './LanguageContext'
import type { Channel } from '../types/twitch'

export interface ChannelContextType {
  selectedChannel: Channel | null
  setSelectedChannel: (channel: Channel) => void
  availableChannels: Channel[]
}

export const ChannelContext = createContext<ChannelContextType | undefined>(undefined)

export function ChannelProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)

  const availableChannels = useMemo(() => {
    if (!user) return []

    const userChannel: Channel = {
      id: user.channel.id,
      name: user.channel.name,
      avatar: user.channel.profileImageUrl || user.channel.name.charAt(0).toUpperCase(),
      role: t('channel.owner'),
      followers: 0,
    }

    const modChannels: Channel[] = user.channelsWhichIsMod.map((channelName, index) => ({
      id: `mod-${index}`,
      name: channelName,
      avatar: channelName.charAt(0).toUpperCase(),
      role: t('channel.moderator'),
      followers: 0,
    }))

    return [userChannel, ...modChannels]
  }, [user, t])

  const selectedChannel = useMemo(() => {
    if (selectedChannelId) {
      const found = availableChannels.find(c => c.id === selectedChannelId)
      if (found) return found
    }
    return availableChannels[0] || null
  }, [availableChannels, selectedChannelId])

  const value = useMemo(
    () => ({
      selectedChannel,
      setSelectedChannel: (channel: Channel) => setSelectedChannelId(channel.id),
      availableChannels,
    }),
    [selectedChannel, availableChannels]
  )

  return <ChannelContext.Provider value={value}>{children}</ChannelContext.Provider>
}

export function useChannel() {
  const context = useContext(ChannelContext)
  if (context === undefined) {
    throw new Error('useChannel must be used within a ChannelProvider')
  }
  return context
}
