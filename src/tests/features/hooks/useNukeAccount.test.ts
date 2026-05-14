import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from '@testing-library/react'
import { renderHook } from '../../utils/test-utils'
import { useNukeAccount } from '../../../features/settings/hooks/useNukeAccount'

vi.mock('../../../features/settings/api/userManagementClient', () => ({
  userManagementClient: {
    deleteAccount: vi.fn(),
  },
}))

import { userManagementClient } from '../../../features/settings/api/userManagementClient'

describe('useNukeAccount', () => {
  const onSuccess = vi.fn()

  const fullUser = {
    userId: '1',
    username: 'testuser',
    channel: { id: '1', name: 'testuser', description: '', profileImageUrl: '' },
    channelsWhichIsMod: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('stream-quest_language', 'en')
    localStorage.setItem(
      'twitch_tokens',
      JSON.stringify({
        accessToken: 'test-token',
        idToken: 'id',
        tokenType: 'bearer',
        expiresIn: 3600,
        scope: [],
      })
    )
    localStorage.setItem('twitch_user', JSON.stringify(fullUser))
    vi.spyOn(sessionStorage, 'clear')
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('starts with isDeleting false and error null', () => {
    const { result } = renderHook(() => useNukeAccount())
    expect(result.current.isDeleting).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('is not deleting after a successful nuke call', async () => {
    vi.mocked(userManagementClient.deleteAccount).mockResolvedValue(undefined)

    const { result } = renderHook(() => useNukeAccount())

    await act(async () => {
      await result.current.nuke('test-token', onSuccess)
    })

    expect(result.current.isDeleting).toBe(false)
  })

  it('calls onSuccess on success', async () => {
    vi.mocked(userManagementClient.deleteAccount).mockResolvedValue(undefined)

    const { result } = renderHook(() => useNukeAccount())

    await act(async () => {
      await result.current.nuke('test-token', onSuccess)
    })

    expect(onSuccess).toHaveBeenCalledOnce()
  })

  it('removes twitch_user from localStorage on success (via logout)', async () => {
    vi.mocked(userManagementClient.deleteAccount).mockResolvedValue(undefined)

    const { result } = renderHook(() => useNukeAccount())

    await act(async () => {
      await result.current.nuke('test-token', onSuccess)
    })

    expect(localStorage.getItem('twitch_user')).toBeNull()
    expect(localStorage.getItem('twitch_tokens')).toBeNull()
  })

  it('sets error and re-throws on API failure, does not call onSuccess', async () => {
    const apiError = new Error('Server error')
    vi.mocked(userManagementClient.deleteAccount).mockRejectedValue(apiError)

    const { result } = renderHook(() => useNukeAccount())

    await act(async () => {
      await result.current.nuke('bad-token', onSuccess).catch(() => {})
    })

    expect(result.current.error).toBe('Server error')
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('resetError clears the error state', async () => {
    const apiError = new Error('Oops')
    vi.mocked(userManagementClient.deleteAccount).mockRejectedValue(apiError)

    const { result } = renderHook(() => useNukeAccount())

    await act(async () => {
      await result.current.nuke('bad-token', onSuccess).catch(() => {})
    })

    expect(result.current.error).toBe('Oops')

    act(() => {
      result.current.resetError()
    })

    expect(result.current.error).toBeNull()
  })
})
