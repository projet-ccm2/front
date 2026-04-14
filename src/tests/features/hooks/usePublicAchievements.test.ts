import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '../../utils/test-utils'
import { usePublicAchievements } from '../../../features/marketplace/hooks/usePublicAchievements'

const mockAchievements = [
  {
    id: 'achievement-1',
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
    channelId: null,
    type: { label: 'message', data: null },
  },
]

describe('usePublicAchievements', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should return a loading state before the request resolves', () => {
    vi.mocked(fetch).mockImplementation(() => new Promise(() => undefined))

    const { result } = renderHook(() => usePublicAchievements())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.achievements).toEqual([])
    expect(result.current.errorMessage).toBeNull()
  })

  it('should expose public achievements after a successful request', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockAchievements),
    } as Response)

    const { result } = renderHook(() => usePublicAchievements())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.achievements).toEqual(mockAchievements)
    expect(result.current.errorMessage).toBeNull()
  })

  it('should expose a 502 upstream error', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.resolve({ message: 'bad gateway' }),
      text: () => Promise.resolve('bad gateway'),
    } as Response)

    const { result } = renderHook(() => usePublicAchievements())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.achievements).toEqual([])
    expect(result.current.errorMessage).toBe('Le service de succès est actuellement indisponible.')
  })

  it('should expose a 400 bad request error', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'bad request' }),
      text: () => Promise.resolve('bad request'),
    } as Response)

    const { result } = renderHook(() => usePublicAchievements())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('La requête de marketplace est invalide.')
  })

  it('should expose a 404 not found error', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'not found' }),
      text: () => Promise.resolve('not found'),
    } as Response)

    const { result } = renderHook(() => usePublicAchievements())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('Aucune route de succès publics n’a été trouvée.')
  })

  it('should expose a generic error for unknown status codes', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 503,
      json: () => Promise.resolve({ message: 'unavailable' }),
      text: () => Promise.resolve('unavailable'),
    } as Response)

    const { result } = renderHook(() => usePublicAchievements())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('Impossible de charger les succès de la marketplace.')
  })

  it('should expose a generic error when fetch throws a non-HTTP error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network failure'))

    const { result } = renderHook(() => usePublicAchievements())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.achievements).toEqual([])
    expect(result.current.errorMessage).toBe('Impossible de charger les succès de la marketplace.')
  })
})
