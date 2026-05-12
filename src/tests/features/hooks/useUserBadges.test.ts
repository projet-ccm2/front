import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '../../utils/test-utils'
import { useUserBadges } from '../../../features/badges/hooks/useUserBadges'

const mockBadges = [
  {
    id: 'badge-1',
    title: 'Top Fan',
    image: 'https://example.com/badge.png',
  },
]

describe('useUserBadges', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should expose a sign-in message when no user id is provided', async () => {
    const { result } = renderHook(() => useUserBadges(null))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.badges).toEqual([])
    expect(result.current.errorMessage).toBe('Connecte-toi pour charger les badges du compte.')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('should load user badges', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockBadges),
    } as Response)

    const { result } = renderHook(() => useUserBadges('user-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.badges).toEqual(mockBadges)
    expect(result.current.errorMessage).toBeNull()
  })

  it('should expose a 404 error when no badges are found', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'not found' }),
      text: () => Promise.resolve('not found'),
    } as Response)

    const { result } = renderHook(() => useUserBadges('user-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.badges).toEqual([])
    expect(result.current.errorMessage).toBe('Aucun badge n’a été trouvé pour ce compte.')
  })

  it('should expose a 502 upstream error', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.resolve({ message: 'bad gateway' }),
      text: () => Promise.resolve('bad gateway'),
    } as Response)

    const { result } = renderHook(() => useUserBadges('user-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('Le service des badges est actuellement indisponible.')
  })
})
