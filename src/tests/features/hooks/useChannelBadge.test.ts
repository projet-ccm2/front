import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '../../utils/test-utils'
import { useChannelBadge } from '../../../features/badges/hooks/useChannelBadge'

const mockBadge = {
  id: 'badge-1',
  title: 'Top Fan',
  image: 'https://example.com/badge.png',
}

describe('useChannelBadge', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should expose a null state when no channel id is provided', async () => {
    const { result } = renderHook(() => useChannelBadge(null))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.badge).toBeNull()
    expect(result.current.errorMessage).toBeNull()
    expect(result.current.isNotFound).toBe(false)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('should load the current channel badge', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockBadge),
    } as Response)

    const { result } = renderHook(() => useChannelBadge('channel-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.badge).toEqual(mockBadge)
    expect(result.current.errorMessage).toBeNull()
    expect(result.current.isNotFound).toBe(false)
  })

  it('should treat 404 as a missing badge state', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'not found' }),
      text: () => Promise.resolve('not found'),
    } as Response)

    const { result } = renderHook(() => useChannelBadge('channel-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.badge).toBeNull()
    expect(result.current.errorMessage).toBeNull()
    expect(result.current.isNotFound).toBe(true)
  })

  it('should expose a 502 upstream error', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.resolve({ message: 'bad gateway' }),
      text: () => Promise.resolve('bad gateway'),
    } as Response)

    const { result } = renderHook(() => useChannelBadge('channel-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.badge).toBeNull()
    expect(result.current.errorMessage).toBe('Le service des badges est actuellement indisponible.')
    expect(result.current.isNotFound).toBe(false)
  })

  it('should expose a 400 error message', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'bad request' }),
      text: () => Promise.resolve('bad request'),
    } as Response)

    const { result } = renderHook(() => useChannelBadge('channel-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.badge).toBeNull()
    expect(result.current.errorMessage).toBe('La requête du badge de chaîne est invalide.')
    expect(result.current.isNotFound).toBe(false)
  })

  it('should expose a generic error message for unexpected errors', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network failure'))

    const { result } = renderHook(() => useChannelBadge('channel-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.badge).toBeNull()
    expect(result.current.errorMessage).toBe('Impossible de charger le badge de la chaîne.')
    expect(result.current.isNotFound).toBe(false)
  })

  it('should not update state when unmounted before fetch resolves', async () => {
    let resolver!: (value: Response) => void
    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise<Response>(r => {
          resolver = r
        })
    )

    const { unmount } = renderHook(() => useChannelBadge('channel-1'))

    unmount()

    await act(async () => {
      resolver({ ok: true, status: 200, json: () => Promise.resolve(mockBadge) } as Response)
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

    const { unmount } = renderHook(() => useChannelBadge('channel-1'))

    unmount()

    await act(async () => {
      rejecter(new Error('Network failure'))
    })
  })
})
