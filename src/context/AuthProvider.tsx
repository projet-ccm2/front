import { useState, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { TwitchUser } from '../types/twitch'
import { AuthContext } from './AuthContext'

const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:3000'
const TWITCH_CLIENT_ID = import.meta.env.VITE_TWITCH_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_TWITCH_REDIRECT_URI || globalThis.location.origin

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
    const state = Math.random().toString(36).substring(7)
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
        console.log('Successfully authenticated. Twitch User ID:', data.userId)
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

  return <AuthContext value={value}>{children}</AuthContext>
}
