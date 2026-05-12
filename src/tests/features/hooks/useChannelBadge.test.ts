import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '../../utils/test-utils'
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

  it('should expose a channel selection message when no channel id is provided', async () => {
    const { result } = renderHook(() => useChannelBadge(null))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.badge).toBeNull()
    expect(result.current.errorMessage).toBe('Sélectionne une chaîne pour charger son badge.')
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
})
