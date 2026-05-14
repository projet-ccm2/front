import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '../../utils/test-utils'
import { useTwitchChannelRewards } from '../../../features/achievements/hooks/useTwitchChannelRewards'

vi.mock('../../../config/environment', () => ({
  TWITCH_CLIENT_ID: 'test-client-id',
  ACHIEVEMENT_MANAGEMENT_SERVICE_URL: 'http://localhost:3001',
  AUTH_SERVICE_URL: 'http://localhost:3000',
  API_SERVICE_URL: 'http://localhost:3000',
  FRONT_URL: '',
  MOBILE_REDIRECT_URI: '/mobile-callback.html',
}))

const mockRewards = [
  { id: 'reward-1', title: 'Test Reward', cost: 100, broadcaster_id: 'channel-1' },
]

describe('useTwitchChannelRewards', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    localStorage.setItem('twitch_tokens', JSON.stringify({ accessToken: 'valid-token' }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('should return empty state when no channelId is provided', async () => {
    const { result } = renderHook(() => useTwitchChannelRewards(null))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.rewards).toEqual([])
    expect(result.current.error).toBe(false)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('should return empty state for a moderator channel (non-owner)', async () => {
    const { result } = renderHook(() => useTwitchChannelRewards('mod-channel-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.rewards).toEqual([])
    expect(result.current.error).toBe(false)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('should load channel rewards successfully', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: mockRewards }),
    } as Response)

    const { result } = renderHook(() => useTwitchChannelRewards('channel-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.rewards).toEqual(mockRewards)
    expect(result.current.error).toBe(false)
  })

  it('should set error when no Twitch token is stored in localStorage', async () => {
    localStorage.removeItem('twitch_tokens')

    const { result } = renderHook(() => useTwitchChannelRewards('channel-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.rewards).toEqual([])
    expect(result.current.error).toBe(true)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('should set error when stored token is invalid JSON', async () => {
    localStorage.setItem('twitch_tokens', 'not-valid-json{')

    const { result } = renderHook(() => useTwitchChannelRewards('channel-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.rewards).toEqual([])
    expect(result.current.error).toBe(true)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('should set error when the Twitch API returns a non-ok response', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ message: 'Forbidden' }),
    } as Response)

    const { result } = renderHook(() => useTwitchChannelRewards('channel-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.rewards).toEqual([])
    expect(result.current.error).toBe(true)
  })

  it('should set error when the fetch call throws a network error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network failure'))

    const { result } = renderHook(() => useTwitchChannelRewards('channel-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.rewards).toEqual([])
    expect(result.current.error).toBe(true)
  })

  it('should not update state when unmounted before fetch resolves', async () => {
    let resolver!: (value: Response) => void
    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise<Response>(r => {
          resolver = r
        })
    )

    const { result, unmount } = renderHook(() => useTwitchChannelRewards('channel-1'))
    expect(result.current).toBeDefined()
    unmount()

    await act(async () => {
      resolver({ ok: true, status: 200, json: () => Promise.resolve({ data: [] }) } as Response)
    })
  })

  it('should not update state when unmounted before fetch rejects', async () => {
    let rejecter!: (err: Error) => void
    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise<Response>((_, r) => {
          rejecter = r
        })
    )

    const { result, unmount } = renderHook(() => useTwitchChannelRewards('channel-1'))
    expect(result.current).toBeDefined()
    unmount()

    await act(async () => {
      rejecter(new Error('Network failure'))
    })
  })
})
