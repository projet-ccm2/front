import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '../../utils/test-utils'
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

  it('should expose a null state when no user id is provided', async () => {
    const { result } = renderHook(() => useUserBadges(null))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.badges).toEqual([])
    expect(result.current.errorMessage).toBeNull()
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

  it('should expose a 400 error message', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'bad request' }),
      text: () => Promise.resolve('bad request'),
    } as Response)

    const { result } = renderHook(() => useUserBadges('user-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.badges).toEqual([])
    expect(result.current.errorMessage).toBe('La requête des badges utilisateur est invalide.')
  })

  it('should expose a generic error message for unexpected errors', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network failure'))

    const { result } = renderHook(() => useUserBadges('user-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.badges).toEqual([])
    expect(result.current.errorMessage).toBe('Impossible de charger les badges du compte.')
  })

  it('should expose a generic error message for an unexpected status code', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'server error' }),
      text: () => Promise.resolve('server error'),
    } as Response)

    const { result } = renderHook(() => useUserBadges('user-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.badges).toEqual([])
    expect(result.current.errorMessage).toBe('Impossible de charger les badges du compte.')
  })

  it('should not update state when unmounted before fetch resolves (success path)', async () => {
    let resolver!: (value: Response) => void
    vi.mocked(fetch).mockImplementation(() => new Promise<Response>(r => { resolver = r }))

    const { unmount } = renderHook(() => useUserBadges('user-1'))

    unmount()

    await act(async () => {
      resolver({ ok: true, status: 200, json: () => Promise.resolve([]) } as Response)
    })
    // no error should be thrown
  })

  it('should not update state when unmounted before fetch rejects (error path)', async () => {
    let rejecter!: (err: Error) => void
    vi.mocked(fetch).mockImplementation(() => new Promise<Response>((_, r) => { rejecter = r }))

    const { unmount } = renderHook(() => useUserBadges('user-1'))

    unmount()

    await act(async () => {
      rejecter(new Error('Network failure'))
    })
    // no error should be thrown
  })
})
