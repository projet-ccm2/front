import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '../../utils/test-utils'
import { useChannelLeaderboard } from '../../../features/profile/hooks/useChannelLeaderboard'

const mockEntries = [
  { username: 'streamer', userId: 'user-1', xp: 500 },
  { username: 'viewer1', userId: 'user-2', xp: 350 },
]

describe('useChannelLeaderboard', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should return empty state when no channel id is provided', async () => {
    const { result } = renderHook(() => useChannelLeaderboard(null))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.entries).toEqual([])
    expect(result.current.errorMessage).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('should load leaderboard entries', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockEntries),
    } as Response)

    const { result } = renderHook(() => useChannelLeaderboard('channel-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.entries).toEqual(mockEntries)
    expect(result.current.errorMessage).toBeNull()
  })

  it('should treat 404 as an empty leaderboard without error', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'not found' }),
      text: () => Promise.resolve('not found'),
    } as Response)

    const { result } = renderHook(() => useChannelLeaderboard('channel-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.entries).toEqual([])
    expect(result.current.errorMessage).toBeNull()
  })

  it('should expose a 400 error message', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'bad request' }),
      text: () => Promise.resolve('bad request'),
    } as Response)

    const { result } = renderHook(() => useChannelLeaderboard('channel-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.entries).toEqual([])
    expect(result.current.errorMessage).toBe('La requête du classement est invalide.')
  })

  it('should expose a 502 upstream error', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.resolve({ message: 'bad gateway' }),
      text: () => Promise.resolve('bad gateway'),
    } as Response)

    const { result } = renderHook(() => useChannelLeaderboard('channel-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.entries).toEqual([])
    expect(result.current.errorMessage).toBe(
      'Le service de classement est actuellement indisponible.'
    )
  })

  it('should expose a generic error message for unexpected errors', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network failure'))

    const { result } = renderHook(() => useChannelLeaderboard('channel-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.entries).toEqual([])
    expect(result.current.errorMessage).toBe('Impossible de charger le classement.')
  })

  it('should not update state when unmounted before fetch resolves', async () => {
    let resolver!: (value: Response) => void
    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise<Response>(r => {
          resolver = r
        })
    )

    const { unmount } = renderHook(() => useChannelLeaderboard('channel-1'))

    unmount()

    await act(async () => {
      resolver({ ok: true, status: 200, json: () => Promise.resolve([]) } as Response)
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

    const { unmount } = renderHook(() => useChannelLeaderboard('channel-1'))

    unmount()

    await act(async () => {
      rejecter(new Error('Network failure'))
    })
  })
})
