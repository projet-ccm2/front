import { useState, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { ChannelContext } from './ChannelContext'
import type { Channel } from '../types/twitch'

export function ChannelProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { user } = useAuth()
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)

  const availableChannels = useMemo(() => {
    if (!user) return []

    const userChannel: Channel = {
      id: user.channel.id,
      name: user.channel.name,
      avatar: user.channel.profileImageUrl || user.channel.name.charAt(0).toUpperCase(),
      role: 'Owner',
      followers: 0,
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

  return <ChannelContext value={value}>{children}</ChannelContext>
}
