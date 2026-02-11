export interface TwitchUser {
  userId: string
  username: string
  channel: {
    id: string
    name: string
    description: string
    profileImageUrl: string
  }
  channelsWhichIsMod: string[]
}

export interface Channel {
  id: string
  name: string
  avatar: string
  role: 'Owner' | 'Moderator' | 'Editor'
  followers: number
}

export interface AuthContextType {
  user: TwitchUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: () => void
  logout: () => void
  completeAuth: (tokens: {
    accessToken: string
    idToken: string
    tokenType: string
    expiresIn: number
    scope: string[]
    state: string
  }) => Promise<void>
}

export interface ChannelContextType {
  selectedChannel: Channel | null
  setSelectedChannel: (channel: Channel) => void
  availableChannels: Channel[]
}
