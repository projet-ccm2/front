import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '../../utils/test-utils'
import { useUserAchievements } from '../../../features/profile/hooks/useUserAchievements'

const authUser = {
  userId: 'user-1',
  username: 'streamer',
  channel: {
    id: 'channel-1',
    name: 'MyChannel',
    description: 'desc',
    profileImageUrl: '',
  },
  channelsWhichIsMod: [],
}

const mockAchievements = [
  {
    id: 'ach-1',
    title: 'First Steps',
    description: 'Send your first message',
    goal: 1,
    reward: 50,
    label: '',
    public: true,
    downloads: 0,
    visits: 0,
    active: true,
    secret: false,
    image: null,
    channelId: 'channel-1',
    type: { label: 'message', data: null },
    userState: { progressCount: 1, finished: true, acquiredDate: new Date().toISOString() },
  },
]

describe('useUserAchievements', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('should show sign-in message when user is not authenticated', async () => {
    const { result } = renderHook(() => useUserAchievements())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.achievements).toEqual([])
    expect(result.current.errorMessage).toBe('Sign in to load profile achievements.')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('should load user achievements for an owner channel', async () => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockAchievements),
    } as Response)

    const { result } = renderHook(() => useUserAchievements())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.achievements).toEqual(mockAchievements)
    expect(result.current.errorMessage).toBeNull()
  })

  it('should expose a 400 error for an invalid profile request', async () => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'bad request' }),
      text: () => Promise.resolve('bad request'),
    } as Response)

    const { result } = renderHook(() => useUserAchievements())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('The current profile request is invalid.')
  })

  it('should expose a 404 error when no profile achievements found', async () => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'not found' }),
      text: () => Promise.resolve('not found'),
    } as Response)

    const { result } = renderHook(() => useUserAchievements())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('No achievement progress was found for this profile.')
  })

  it('should expose a 502 upstream error', async () => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.resolve({ message: 'bad gateway' }),
      text: () => Promise.resolve('bad gateway'),
    } as Response)

    const { result } = renderHook(() => useUserAchievements())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('The achievement service is currently unavailable.')
  })

  it('should expose a generic error for unknown server error codes', async () => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 503,
      json: () => Promise.resolve({ message: 'unavailable' }),
      text: () => Promise.resolve('unavailable'),
    } as Response)

    const { result } = renderHook(() => useUserAchievements())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('Unable to load profile achievements.')
  })

  it('should expose a generic error when fetch throws a non-HTTP error', async () => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))

    vi.mocked(fetch).mockRejectedValue(new Error('Network failure'))

    const { result } = renderHook(() => useUserAchievements())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.achievements).toEqual([])
    expect(result.current.errorMessage).toBe('Unable to load profile achievements.')
  })
})
