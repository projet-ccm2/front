import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from './utils/test-utils'
import { AuthProvider, useAuth } from '../context/AuthContext'
import React from 'react'

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should initialize with user from localStorage', () => {
    const mockUser = { userId: '1', username: 'test' }
    localStorage.setItem('twitch_user', JSON.stringify(mockUser))

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should handle invalid JSON in localStorage', () => {
    localStorage.setItem('twitch_user', 'invalid-json')
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('twitch_user')).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('should clear storage on logout', () => {
    const mockUser = { userId: '1', username: 'test' }
    localStorage.setItem('twitch_user', JSON.stringify(mockUser))
    localStorage.setItem('twitch_tokens', 'some-tokens')

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    act(() => {
      result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('twitch_user')).toBeNull()
    expect(localStorage.getItem('twitch_tokens')).toBeNull()
  })

  it('should handle successful completeAuth', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          user: { username: 'test' },
          userId: '123',
        }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    const tokens = {
      accessToken: 'at',
      idToken: 'it',
      tokenType: 'bearer',
      expiresIn: 3600,
      scope: ['s'],
      state: 'st',
    }

    await act(async () => {
      await result.current.completeAuth(tokens)
    })

    expect(result.current.user).toEqual({ username: 'test', userId: '123' })
    expect(localStorage.getItem('twitch_user')).toContain('test')
    vi.unstubAllGlobals()
  })

  it('should handle failed completeAuth (backend error)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
    })
    vi.stubGlobal('fetch', mockFetch)

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(result.current.completeAuth({} as any)).rejects.toThrow(
      'Failed to authenticate with backend'
    )
    vi.unstubAllGlobals()
  })

  it('should handle failed completeAuth (success: false)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: false, error: 'Custom Error' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(result.current.completeAuth({} as any)).rejects.toThrow('Custom Error')
    vi.unstubAllGlobals()
  })

  it('should handle completeAuth exceptions', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network Error'))
    vi.stubGlobal('fetch', mockFetch)

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(result.current.completeAuth({} as any)).rejects.toThrow('Network Error')
    vi.unstubAllGlobals()
  })
})
