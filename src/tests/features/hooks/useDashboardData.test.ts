import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '../../utils/test-utils'
import { useDashboardData } from '../../../features/dashboard/hooks/useDashboardData'

const authUser = {
  userId: 'user-1',
  username: 'streamer',
  channel: {
    id: 'channel-1',
    name: 'MyChannel',
    description: 'desc',
    profileImageUrl: '',
  },
  channelsWhichIsMod: [],
}

const mockChannelAchievements = [
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
    type: {
      label: 'message',
      data: null,
    },
  },
  {
    id: 'achievement-2',
    title: 'Chat Master',
    description: 'Send 100 messages',
    goal: 100,
    reward: 250,
    label: '',
    public: false,
    downloads: 0,
    visits: 0,
    active: false,
    secret: false,
    image: null,
    channelId: 'channel-1',
    type: {
      label: 'message',
      data: null,
    },
  },
]

const mockUserAchievements = [
  {
    ...mockChannelAchievements[0],
    userState: {
      progressCount: 1,
      finished: true,
      acquiredDate: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  },
  {
    ...mockChannelAchievements[1],
    userState: {
      progressCount: 35,
      finished: false,
      acquiredDate: null,
    },
  },
]

describe('useDashboardData', () => {
  beforeEach(() => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)

        if (url.includes('/achievements/channel/channel-1')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockChannelAchievements),
          })
        }

        if (url.includes('/achievements/user/user-1/channel/channel-1')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockUserAchievements),
          })
        }

        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ message: `Unhandled request: ${url}` }),
          text: () => Promise.resolve(`Unhandled request: ${url}`),
        })
      })
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('should return initial loading state', () => {
    const { result } = renderHook(() => useDashboardData())

    expect(result.current.loading).toBe(true)
    expect(result.current.engagementData).toEqual([])
    expect(result.current.recentActivity).toEqual([])
    expect(result.current.stats).toEqual({
      activeAchievements: 0,
      totalAchievements: 0,
      publicTemplates: 0,
      completedAchievements: 0,
      totalXpEarned: 0,
    })
  })

  it('should load dashboard achievement data from the backend routes', async () => {
    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.stats).toEqual({
      activeAchievements: 1,
      totalAchievements: 2,
      publicTemplates: 1,
      completedAchievements: 1,
      totalXpEarned: 50,
    })
    expect(result.current.errorMessage).toBeNull()
    expect(result.current.contextMessage).toBeNull()
  })

  it('should expose unlock activity over the last seven days', async () => {
    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.engagementData).toHaveLength(7)
    result.current.engagementData.forEach(data => {
      expect(data).toHaveProperty('day')
      expect(data).toHaveProperty('unlocks')
      expect(typeof data.day).toBe('string')
      expect(typeof data.unlocks).toBe('number')
    })
    expect(result.current.engagementData.some(data => data.unlocks === 1)).toBe(true)
  })

  it('should expose recent activity from completed achievements', async () => {
    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.recentActivity).toHaveLength(1)
    expect(result.current.recentActivity[0]).toMatchObject({
      id: 'achievement-1',
      user: 'You',
      achievement: 'First Steps',
    })
  })

  it('should show an upstream error when dashboard requests fail', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 502,
          json: () => Promise.resolve({ message: 'bad gateway' }),
          text: () => Promise.resolve('bad gateway'),
        })
      )
    )

    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('The achievement service is currently unavailable.')
    expect(result.current.stats.totalAchievements).toBe(0)
  })
})
