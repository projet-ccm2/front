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
    type: { label: 'message', data: null },
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
    type: { label: 'message', data: null },
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

function makeFetch(channelStatus: number, userStatus: number) {
  return vi.fn((input: RequestInfo | URL) => {
    const url = String(input)

    if (url.includes('/achievements/channel/channel-1')) {
      if (channelStatus === 200) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockChannelAchievements),
        })
      }
      return Promise.resolve({
        ok: false,
        status: channelStatus,
        json: () => Promise.resolve({ message: 'error' }),
        text: () => Promise.resolve('error'),
      })
    }

    if (url.includes('/achievements/user/user-1/channel/channel-1')) {
      if (userStatus === 200) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockUserAchievements),
        })
      }
      return Promise.resolve({
        ok: false,
        status: userStatus,
        json: () => Promise.resolve({ message: 'error' }),
        text: () => Promise.resolve('error'),
      })
    }

    if (url.includes('/achievements/user/user-1') && userStatus === 200) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUserAchievements),
      })
    }

    return Promise.resolve({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: `Unhandled: ${url}` }),
      text: () => Promise.resolve(`Unhandled: ${url}`),
    })
  })
}

describe('useDashboardData', () => {
  beforeEach(() => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))
    vi.stubGlobal('fetch', makeFetch(200, 200))
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
      user: 'Vous',
      achievement: 'First Steps',
    })
  })

  it('should show an upstream error when dashboard requests fail (502)', async () => {
    vi.stubGlobal('fetch', makeFetch(502, 502))

    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('Le service de succès est actuellement indisponible.')
    expect(result.current.stats.totalAchievements).toBe(0)
  })

  it('should show a 400 error message when dashboard request is invalid', async () => {
    vi.stubGlobal('fetch', makeFetch(400, 400))

    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('La requête du tableau de bord est invalide.')
  })

  it('should show a 404 error message when dashboard data is not found', async () => {
    vi.stubGlobal('fetch', makeFetch(404, 404))

    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.errorMessage).toBe(
      'Aucune donnée de succès n’a été trouvée pour ce tableau de bord.'
    )
  })

  it('should show a generic error for unknown server error codes', async () => {
    vi.stubGlobal('fetch', makeFetch(503, 503))

    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('Impossible de charger les succès du tableau de bord.')
  })

  it('should show a generic error when fetch throws a non-HTTP error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('Network failure')))
    )

    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('Impossible de charger les succès du tableau de bord.')
  })

  it('should show sign-in message when user is not authenticated', async () => {
    localStorage.clear()

    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.errorMessage).toBe(
      'Connecte-toi pour charger les succès du tableau de bord.'
    )
    expect(result.current.stats.totalAchievements).toBe(0)
  })

  it('should handle achievements with null acquiredDate in engagement data', async () => {
    const achievementsWithNullDate = mockUserAchievements.map(a => ({
      ...a,
      userState: { ...a.userState, finished: true, acquiredDate: null },
    }))

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
            json: () => Promise.resolve(achievementsWithNullDate),
          })
        }
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({}),
          text: () => Promise.resolve(''),
        })
      })
    )

    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.engagementData.every(d => d.unlocks === 0)).toBe(true)
  })

  it('should not count achievements acquired more than 7 days ago in engagement data', async () => {
    const oldAchievements = [
      {
        ...mockUserAchievements[0],
        userState: {
          progressCount: 1,
          finished: true,
          acquiredDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
      },
    ]

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
            json: () => Promise.resolve(oldAchievements),
          })
        }
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({}),
          text: () => Promise.resolve(''),
        })
      })
    )

    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.engagementData.every(d => d.unlocks === 0)).toBe(true)
  })

  it('should show recent activity time as hours ago for achievements unlocked hours ago', async () => {
    const hoursAgoAchievements = [
      {
        ...mockUserAchievements[0],
        userState: {
          progressCount: 1,
          finished: true,
          acquiredDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        },
      },
    ]

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
            json: () => Promise.resolve(hoursAgoAchievements),
          })
        }
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({}),
          text: () => Promise.resolve(''),
        })
      })
    )

    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.recentActivity[0].time).toMatch(/il y a/i)
  })

  it('should show recent activity time as days ago for old achievements', async () => {
    const daysAgoAchievements = [
      {
        ...mockUserAchievements[0],
        userState: {
          progressCount: 1,
          finished: true,
          acquiredDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        },
      },
    ]

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
            json: () => Promise.resolve(daysAgoAchievements),
          })
        }
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({}),
          text: () => Promise.resolve(''),
        })
      })
    )

    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.recentActivity[0].time).toMatch(/il y a/i)
  })

  it('should handle a single completed achievement (singular time units)', async () => {
    const oneHourAgoAchievements = [
      {
        ...mockUserAchievements[0],
        userState: {
          progressCount: 1,
          finished: true,
          acquiredDate: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // exactly 1 hour ago
        },
      },
    ]

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
            json: () => Promise.resolve(oneHourAgoAchievements),
          })
        }
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({}),
          text: () => Promise.resolve(''),
        })
      })
    )

    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.recentActivity[0].time).toMatch(/il y a/i)
  })
})
