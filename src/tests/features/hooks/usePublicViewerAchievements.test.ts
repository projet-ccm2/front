import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../features/achievements/api/achievementManagementClient', async importOriginal => {
  const actual =
    await importOriginal<
      typeof import('../../../features/achievements/api/achievementManagementClient')
    >()

  return {
    ...actual,
    achievementManagementClient: {
      getUserChannelAchievements: vi.fn(),
    },
  }
})

import { renderHook, waitFor } from '../../utils/test-utils'
import {
  AchievementManagementError,
  achievementManagementClient,
} from '../../../features/achievements/api/achievementManagementClient'
import { usePublicViewerAchievements } from '../../../features/overlay/hooks/usePublicViewerAchievements'

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
    channelId: 'channel-1',
    type: { label: 'message', data: null },
    userState: { progressCount: 1, finished: true, acquiredDate: new Date().toISOString() },
  },
]

describe('usePublicViewerAchievements', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('clears state when no viewer is provided', async () => {
    const { result } = renderHook(() => usePublicViewerAchievements('channel-1', null))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.achievements).toEqual([])
    expect(result.current.errorMessage).toBeNull()
    expect(achievementManagementClient.getUserChannelAchievements).not.toHaveBeenCalled()
  })

  it('loads viewer achievements when a viewer is provided', async () => {
    vi.mocked(achievementManagementClient.getUserChannelAchievements).mockResolvedValue(
      mockAchievements as never
    )

    const { result } = renderHook(() => usePublicViewerAchievements('channel-1', 'viewer-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.achievements).toEqual(mockAchievements)
    expect(result.current.errorMessage).toBeNull()
  })

  it('ignores a late response after unmounting', async () => {
    let resolveAchievements!: (value: typeof mockAchievements) => void
    const pending = new Promise<typeof mockAchievements>(resolve => {
      resolveAchievements = resolve
    })

    vi.mocked(achievementManagementClient.getUserChannelAchievements).mockReturnValue(
      pending as never
    )

    const { result, unmount } = renderHook(() => usePublicViewerAchievements('channel-1', 'viewer-1'))
    unmount()

    resolveAchievements(mockAchievements)
    await pending

    expect(result.current.achievements).toEqual([])
    expect(result.current.errorMessage).toBeNull()
  })

  it('maps a 400 error to the invalid viewer request message', async () => {
    vi.mocked(achievementManagementClient.getUserChannelAchievements).mockRejectedValue(
      new AchievementManagementError('bad request', 400)
    )

    const { result } = renderHook(() => usePublicViewerAchievements('channel-1', 'viewer-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('La requête du viewer est invalide.')
  })

  it('maps a 404 error to the not found message', async () => {
    vi.mocked(achievementManagementClient.getUserChannelAchievements).mockRejectedValue(
      new AchievementManagementError('not found', 404)
    )

    const { result } = renderHook(() => usePublicViewerAchievements('channel-1', 'viewer-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe(
      'Aucune progression de succès n’a été trouvée pour ce viewer.'
    )
  })

  it('maps a 502 error to the upstream message', async () => {
    vi.mocked(achievementManagementClient.getUserChannelAchievements).mockRejectedValue(
      new AchievementManagementError('bad gateway', 502)
    )

    const { result } = renderHook(() => usePublicViewerAchievements('channel-1', 'viewer-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('Le service de succès est actuellement indisponible.')
  })

  it('falls back to the generic error message for unknown statuses', async () => {
    vi.mocked(achievementManagementClient.getUserChannelAchievements).mockRejectedValue(
      new AchievementManagementError('unavailable', 503)
    )

    const { result } = renderHook(() => usePublicViewerAchievements('channel-1', 'viewer-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('Impossible de charger les succès du viewer.')
  })

  it('falls back to the generic error message for non-http errors', async () => {
    vi.mocked(achievementManagementClient.getUserChannelAchievements).mockRejectedValue(
      new Error('network down')
    )

    const { result } = renderHook(() => usePublicViewerAchievements('channel-1', 'viewer-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('Impossible de charger les succès du viewer.')
  })
})
