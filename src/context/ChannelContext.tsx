import { createContext, useContext, useState, useMemo, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'

export interface Channel {
  id: string
  name: string
  avatar: string
  role: 'Owner' | 'Moderator' | 'Editor'
  followers: number
}

interface ChannelContextType {
  selectedChannel: Channel | null
  setSelectedChannel: (channel: Channel) => void
  availableChannels: Channel[]
}

const ChannelContext = createContext<ChannelContextType | undefined>(undefined)

export function ChannelProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { user } = useAuth()
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)

  const availableChannels = useMemo(() => {
    if (!user) return []

    const userChannel: Channel = {
      id: user.channel.id,
      name: user.channel.name,
      avatar: user.channel.profileImageUrl || user.channel.name.charAt(0).toUpperCase(),
      role: 'Owner',
      followers: 0, // We might not have this info from /auth/callback yet
    }

    const modChannels: Channel[] = user.channelsWhichIsMod.map((channelName, index) => ({
      id: `mod-${index}`,
      name: channelName,
      avatar: channelName.charAt(0).toUpperCase(),
      role: 'Moderator',
      followers: 0,
    }))

    return [userChannel, ...modChannels]
  }, [user])

  useEffect(() => {
    if (availableChannels.length > 0 && !selectedChannel) {
      setSelectedChannel(availableChannels[0])
    }
  }, [availableChannels, selectedChannel])

  const value = useMemo(
    () => ({ selectedChannel, setSelectedChannel, availableChannels }),
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
