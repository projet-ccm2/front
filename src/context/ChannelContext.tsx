/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export interface Channel {
  id: string
  name: string
  avatar: string
  role: 'Owner' | 'Moderator' | 'Editor'
  followers: number
}

interface ChannelContextType {
  selectedChannel: Channel
  setSelectedChannel: (channel: Channel) => void
  availableChannels: Channel[]
}

const ChannelContext = createContext<ChannelContextType | undefined>(undefined)

const defaultChannels: Channel[] = [
  {
    id: '1',
    name: 'MyTwitchChannel',
    avatar: 'M',
    role: 'Moderator',
    followers: 15420,
  },
  {
    id: '2',
    name: 'ProGamingHub',
    avatar: 'P',
    role: 'Owner',
    followers: 28350,
  },
  {
    id: '3',
    name: 'CasualStreams',
    avatar: 'C',
    role: 'Editor',
    followers: 8230,
  },
]

export function ChannelProvider({ children }: { children: ReactNode }) {
  const [availableChannels] = useState<Channel[]>(defaultChannels)
  const [selectedChannel, setSelectedChannel] = useState<Channel>(defaultChannels[0])

  return (
    <ChannelContext.Provider value={{ selectedChannel, setSelectedChannel, availableChannels }}>
      {children}
    </ChannelContext.Provider>
  )
}

export function useChannel() {
  const context = useContext(ChannelContext)
  if (context === undefined) {
    throw new Error('useChannel must be used within a ChannelProvider')
  }
  return context
}
