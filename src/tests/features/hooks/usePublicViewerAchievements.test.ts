import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '../../utils/test-utils'
import { usePublicViewerAchievements } from '../../../features/overlay/hooks/usePublicViewerAchievements'

const mockViewerAchievements = [
  {
    id: 'viewer-ach-1',
    title: 'Chat Master',
    description: 'Send 100 messages',
    goal: 100,
    reward: 250,
    label: 'CM',
    public: true,
    downloads: 0,
    visits: 0,
    active: true,
    secret: false,
    image: null,
    channelId: 'channel-1',
    type: { label: 'message', data: null },
    userState: { progressCount: 25, finished: false, acquiredDate: null },
  },
]

describe('usePublicViewerAchievements', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns the idle state when there is no viewer id', async () => {
    const { result } = renderHook(() => usePublicViewerAchievements('channel-1', null))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.achievements).toEqual([])
    expect(result.current.errorMessage).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('loads viewer achievements successfully', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockViewerAchievements),
    } as Response)

    const { result } = renderHook(() => usePublicViewerAchievements('channel-1', 'viewer-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.achievements).toEqual(mockViewerAchievements)
    expect(result.current.errorMessage).toBeNull()
  })

  it('maps a 400 error to a viewer-specific message', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'bad request' }),
      text: () => Promise.resolve('bad request'),
    } as Response)

    const { result } = renderHook(() => usePublicViewerAchievements('channel-1', 'viewer-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('La requête du viewer est invalide.')
  })

  it('maps a 404 error to a viewer-specific message', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'not found' }),
      text: () => Promise.resolve('not found'),
    } as Response)

    const { result } = renderHook(() => usePublicViewerAchievements('channel-1', 'viewer-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe(
      'Aucune progression de succès n’a été trouvée pour ce viewer.'
    )
  })

  it('maps a 502 error to a viewer-specific message', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.resolve({ message: 'bad gateway' }),
      text: () => Promise.resolve('bad gateway'),
    } as Response)

    const { result } = renderHook(() => usePublicViewerAchievements('channel-1', 'viewer-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('Le service de succès est actuellement indisponible.')
  })

  it('maps a generic error when the backend returns another code', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 503,
      json: () => Promise.resolve({ message: 'unavailable' }),
      text: () => Promise.resolve('unavailable'),
    } as Response)

    const { result } = renderHook(() => usePublicViewerAchievements('channel-1', 'viewer-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('Impossible de charger les succès du viewer.')
  })

  it('falls back to a generic message when fetch rejects unexpectedly', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network down'))

    const { result } = renderHook(() => usePublicViewerAchievements('channel-1', 'viewer-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('Impossible de charger les succès du viewer.')
  })
})
