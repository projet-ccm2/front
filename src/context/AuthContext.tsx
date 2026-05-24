/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { TwitchUser, AuthContextType } from '../types/twitch'
import { addBotAsModerator } from '../features/chat/api/chatClient'
import {
  AUTH_SERVICE_URL,
  TWITCH_CLIENT_ID,
  FRONT_URL,
  MOBILE_REDIRECT_URI,
} from '../config/environment'
import { Capacitor } from '@capacitor/core'
import { openExternalUrl } from '../utils/browserRuntime'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<TwitchUser | null>(() => {
    const savedUser = localStorage.getItem('twitch_user')
    if (savedUser) {
      try {
        return JSON.parse(savedUser)
      } catch (e) {
        console.error('Failed to parse saved user', e)
        localStorage.removeItem('twitch_user')
      }
    }
    return null
  })
  const [isLoading, setIsLoading] = useState(false)

  const isAuthenticated = !!user

  const login = useCallback(async () => {
    const scope = encodeURIComponent(
      'openid user:read:email moderator:read:followers channel:read:subscriptions bits:read channel:read:redemptions channel:read:hype_train channel:read:polls channel:read:predictions channel:read:charity chat:read user:read:moderated_channels moderation:read channel:manage:moderators'
    )
    const responseType = 'token id_token'
    const state = crypto.randomUUID()
    if (Capacitor.isNativePlatform()) {
      localStorage.setItem('twitch_auth_state', state)
    } else {
      sessionStorage.setItem('twitch_auth_state', state)
    }
    const redirectUri = Capacitor.isNativePlatform()
      ? MOBILE_REDIRECT_URI
      : globalThis.location?.origin || FRONT_URL
    const twitchUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${scope}&state=${state}`
    await openExternalUrl(twitchUrl)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('twitch_user')
    localStorage.removeItem('twitch_tokens')
  }, [])

  const completeAuth = useCallback(
    async (tokens: {
      accessToken: string
      idToken: string
      tokenType: string
      expiresIn: number
      scope: string[]
      state: string
    }) => {
      setIsLoading(true)
      try {
        const response = await fetch(`${AUTH_SERVICE_URL}/auth/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tokens),
        })

        if (!response.ok) {
          throw new Error('Failed to authenticate with backend')
        }

        const data = await response.json()
        if (data.success) {
          const fullUser = { ...data.user, userId: data.userId }
          setUser(fullUser)
          localStorage.setItem('twitch_user', JSON.stringify(fullUser))
          localStorage.setItem('twitch_tokens', JSON.stringify(tokens))

          // Automatically add the IRC bot as moderator — silent, non-blocking
          addBotAsModerator(data.userId, tokens.accessToken).catch(err => {
            console.warn('Could not add bot as moderator:', err)
          })
        } else {
          throw new Error(data.error || 'Authentication failed')
        }
      } catch (error) {
        console.error('Auth error:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      completeAuth,
    }),
    [user, isAuthenticated, isLoading, login, logout, completeAuth]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
