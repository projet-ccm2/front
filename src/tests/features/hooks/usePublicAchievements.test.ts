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
    type: {
      label: 'message',
      data: null,
    },
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

  it('should expose a marketplace-specific error on upstream failure', async () => {
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
    expect(result.current.errorMessage).toBe('The achievement service is currently unavailable.')
  })
})
