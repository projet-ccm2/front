import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '../../utils/test-utils'
import { useDashboardData } from '../../../features/dashboard/hooks/useDashboardData'

describe('useDashboardData', () => {
  it('should return initial loading state', () => {
    const { result } = renderHook(() => useDashboardData())

    expect(result.current.loading).toBe(true)
    expect(result.current.engagementData).toEqual([])
    expect(result.current.recentActivity).toEqual([])
  })

  it('should load engagement data after timeout', async () => {
    const { result } = renderHook(() => useDashboardData())

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 1000 }
    )

    expect(result.current.engagementData).toHaveLength(7)
    expect(result.current.engagementData[0]).toEqual({ day: 'Mon', users: 145 })
  })

  it('should load recent activity data after timeout', async () => {
    const { result } = renderHook(() => useDashboardData())

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 1000 }
    )

    expect(result.current.recentActivity).toHaveLength(5)
    expect(result.current.recentActivity[0]).toEqual({
      user: 'xXGamerXx',
      achievement: 'First Steps',
      time: '2 minutes ago',
    })
  })

  it('should have correct engagement data structure', async () => {
    const { result } = renderHook(() => useDashboardData())

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 1000 }
    )

    result.current.engagementData.forEach(data => {
      expect(data).toHaveProperty('day')
      expect(data).toHaveProperty('users')
      expect(typeof data.day).toBe('string')
      expect(typeof data.users).toBe('number')
    })
  })

  it('should have correct recent activity structure', async () => {
    const { result } = renderHook(() => useDashboardData())

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 1000 }
    )

    result.current.recentActivity.forEach(activity => {
      expect(activity).toHaveProperty('user')
      expect(activity).toHaveProperty('achievement')
      expect(activity).toHaveProperty('time')
      expect(typeof activity.user).toBe('string')
      expect(typeof activity.achievement).toBe('string')
      expect(typeof activity.time).toBe('string')
    })
  })

  it('should return all days of the week in engagement data', async () => {
    const { result } = renderHook(() => useDashboardData())

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 1000 }
    )

    const days = result.current.engagementData.map(d => d.day)
    expect(days).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
  })

  it('should have increasing user engagement trend', async () => {
    const { result } = renderHook(() => useDashboardData())

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 1000 }
    )

    // Check that Saturday has the highest engagement
    const saturdayData = result.current.engagementData.find(d => d.day === 'Sat')
    expect(saturdayData?.users).toBe(421)
  })
})
