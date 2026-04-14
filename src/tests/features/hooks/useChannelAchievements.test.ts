import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '../../utils/test-utils'
import { useChannelAchievements } from '../../../features/achievements/hooks/useChannelAchievements'

const mockAchievements = [
  {
    id: 'achievement-1',
    title: 'First Steps',
    description: 'Send your first message',
    goal: 1,
    reward: 50,
    label: '',
    public: false,
    downloads: 0,
    visits: 0,
    active: true,
    secret: false,
    image: null,
    channelId: 'channel-1',
    type: { label: 'message', data: null },
  },
]

describe('useChannelAchievements', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should require a selected channel before loading achievements', async () => {
    const { result } = renderHook(() => useChannelAchievements(null))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.achievements).toEqual([])
    expect(result.current.errorMessage).toBe('Sélectionne une chaîne pour charger les succès.')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('should block synthetic moderator channel ids before issuing a request', async () => {
    const { result } = renderHook(() => useChannelAchievements('mod-0'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.achievements).toEqual([])
    expect(result.current.errorMessage).toBe(
      'La gestion des succès ne prend actuellement en charge que la chaîne du compte connecté. Les chaînes modératrices ne sont pas encore gérées.'
    )
    expect(fetch).not.toHaveBeenCalled()
  })

  it('should load channel achievements when the channel id is valid', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockAchievements),
    } as Response)

    const { result } = renderHook(() => useChannelAchievements('channel-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.achievements).toEqual(mockAchievements)
    expect(result.current.errorMessage).toBeNull()
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/achievements/channel/channel-1'),
      expect.any(Object)
    )
  })

  it('should expose a channel-specific not found error (404)', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'not found' }),
      text: () => Promise.resolve('not found'),
    } as Response)

    const { result } = renderHook(() => useChannelAchievements('channel-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.achievements).toEqual([])
    expect(result.current.errorMessage).toBe('Aucun succès n’a été trouvé pour cette chaîne.')
  })

  it('should expose a 400 bad request error', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'bad request' }),
      text: () => Promise.resolve('bad request'),
    } as Response)

    const { result } = renderHook(() => useChannelAchievements('channel-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe(
      'La chaîne sélectionnée ne peut pas être interrogée avec cette requête.'
    )
  })

  it('should expose a 502 upstream service error', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.resolve({ message: 'bad gateway' }),
      text: () => Promise.resolve('bad gateway'),
    } as Response)

    const { result } = renderHook(() => useChannelAchievements('channel-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('Le service de succès est actuellement indisponible.')
  })

  it('should expose a generic error for unknown status codes', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 503,
      json: () => Promise.resolve({ message: 'unavailable' }),
      text: () => Promise.resolve('unavailable'),
    } as Response)

    const { result } = renderHook(() => useChannelAchievements('channel-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('Impossible de charger les succès de la chaîne.')
  })

  it('should expose a generic error when fetch throws a non-HTTP error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network failure'))

    const { result } = renderHook(() => useChannelAchievements('channel-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.achievements).toEqual([])
    expect(result.current.errorMessage).toBe('Impossible de charger les succès de la chaîne.')
  })
})
