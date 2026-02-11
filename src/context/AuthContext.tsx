/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { TwitchUser, AuthContextType } from '../types/twitch'

// @ts-expect-error - _env_ is injected at runtime
const AUTH_SERVICE_URL =
  window._env_?.AUTH_SERVICE_URL || import.meta.env.AUTH_SERVICE_URL || 'http://localhost:3000'
// @ts-expect-error - _env_ is injected at runtime
const TWITCH_CLIENT_ID = window._env_?.TWITCH_CLIENT_ID || import.meta.env.TWITCH_CLIENT_ID
// @ts-expect-error - _env_ is injected at runtime
const REDIRECT_URI =
  window._env_?.FRONT_URL || import.meta.env.FRONT_URL || globalThis.location.origin

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
  const [isLoading, setIsLoading] = useState(!user)

  const isAuthenticated = !!user

  useEffect(() => {
    setIsLoading(false)
  }, [])

  const login = () => {
    const scope = encodeURIComponent('openid user:read:email')
    const responseType = 'token id_token'
    const state = crypto.randomUUID()
    sessionStorage.setItem('twitch_auth_state', state)
    const twitchUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=${responseType}&scope=${scope}&state=${state}`
    globalThis.location.href = twitchUrl
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('twitch_user')
    localStorage.removeItem('twitch_tokens')
  }

  const completeAuth = async (tokens: {
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
      } else {
        throw new Error(data.error || 'Authentication failed')
      }
    } catch (error) {
      console.error('Auth error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      completeAuth,
    }),
    [user, isAuthenticated, isLoading]
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
