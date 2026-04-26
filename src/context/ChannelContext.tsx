/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import type { Channel } from '../types/twitch'

const TWITCH_CLIENT_ID = globalThis._env_?.TWITCH_CLIENT_ID || import.meta.env.TWITCH_CLIENT_ID
const AUTH_SERVICE_URL =
  globalThis._env_?.AUTH_SERVICE_URL ||
  import.meta.env.VITE_AUTH_SERVICE_URL ||
  'http://localhost:3000'

interface TwitchHelixUser {
  id: string
  display_name: string
  profile_image_url: string
}

async function fetchTwitchUsers(
  ids: string[],
  accessToken: string,
  clientId: string
): Promise<TwitchHelixUser[]> {
  if (!ids.length || !accessToken || !clientId) return []
  const query = ids.map(id => `id=${encodeURIComponent(id)}`).join('&')
  const res = await fetch(`https://api.twitch.tv/helix/users?${query}`, {
    headers: { Authorization: `Bearer ${accessToken}`, 'Client-Id': clientId },
  })
  if (!res.ok) return []
  return ((await res.json()) as { data: TwitchHelixUser[] }).data
}

async function fetchModeratedChannels(accessToken: string, userId: string): Promise<string[]> {
  try {
    const res = await fetch(
      `${AUTH_SERVICE_URL}/channels/me/moderated?userId=${encodeURIComponent(userId)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )
    if (!res.ok) return []
    const data = (await res.json()) as { moderatedChannels: string[] }
    return data.moderatedChannels ?? []
  } catch {
    return []
  }
}

function buildInitialChannels(
  user: ReturnType<typeof useAuth>['user'],
  moderatedIds: string[]
): Channel[] {
  if (!user) return []

  const userChannel: Channel = {
    id: user.channel.id,
    name: user.channel.name,
    avatar: user.channel.profileImageUrl || user.channel.name.charAt(0).toUpperCase(),
    role: 'Owner',
    followers: 0,
  }

  const modChannels: Channel[] = moderatedIds.map(channelId => ({
    id: `mod-${channelId}`,
    name: channelId,
    avatar: channelId.charAt(0).toUpperCase(),
    role: 'Moderator' as const,
    followers: 0,
  }))

  return [userChannel, ...modChannels]
}

export interface ChannelContextType {
  selectedChannel: Channel | null
  setSelectedChannel: (channel: Channel) => void
  availableChannels: Channel[]
}

export const ChannelContext = createContext<ChannelContextType | undefined>(undefined)

export function ChannelProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { user } = useAuth()
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)
  const [moderatorInfoByUserId, setModeratorInfoByUserId] = useState<
    Record<string, Record<string, TwitchHelixUser>>
  >({})
  const [moderatedChannelIdsByUserId, setModeratedChannelIdsByUserId] = useState<
    Record<string, string[]>
  >({})

  const baseChannels = useMemo(() => {
    if (!user) {
      return []
    }

    const moderatedIds = moderatedChannelIdsByUserId[user.userId] ?? user.channelsWhichIsMod
    return buildInitialChannels(user, moderatedIds)
  }, [moderatedChannelIdsByUserId, user])

  const availableChannels = useMemo(() => {
    const moderatorInfoById = user ? (moderatorInfoByUserId[user.userId] ?? {}) : {}

    return baseChannels.map(channel => {
      if (channel.role !== 'Moderator') return channel

      const realId = channel.id.slice('mod-'.length)
      const info = moderatorInfoById[realId]
      if (!info) return channel

      return { ...channel, name: info.display_name, avatar: info.profile_image_url }
    })
  }, [baseChannels, moderatorInfoByUserId, user])

  useEffect(() => {
    if (!user) return
    let cancelled = false

    const fetchAndEnrichModChannels = async () => {
      const stored = localStorage.getItem('twitch_tokens')
      if (!stored || !TWITCH_CLIENT_ID) return
      let accessToken: string
      try {
        accessToken = (JSON.parse(stored) as { accessToken: string }).accessToken
      } catch {
        return
      }

      const moderatedChannelIds = await fetchModeratedChannels(accessToken, user.userId)
      const channelIds = moderatedChannelIds.length ? moderatedChannelIds : user.channelsWhichIsMod

      if (cancelled || !channelIds.length) return

      setModeratedChannelIdsByUserId(prev => ({
        ...prev,
        [user.userId]: channelIds,
      }))

      const helixUsers = await fetchTwitchUsers(channelIds, accessToken, TWITCH_CLIENT_ID)
      if (cancelled || !helixUsers.length) return

      setModeratorInfoByUserId(prev => ({
        ...prev,
        [user.userId]: Object.fromEntries(helixUsers.map(u => [u.id, u])),
      }))
    }

    void fetchAndEnrichModChannels()
    return () => {
      cancelled = true
    }
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

  return <ChannelContext.Provider value={value}>{children}</ChannelContext.Provider>
}

export function useChannel() {
  const context = useContext(ChannelContext)
  if (context === undefined) {
    throw new Error('useChannel must be used within a ChannelProvider')
  }
  return context
}
