import { useState, useEffect } from 'react'

export interface EngagementData {
  day: string
  users: number
}

export interface RecentActivity {
  id: string
  user: string
  achievement: string
  time: string
}

const MOCK_ENGAGEMENT_DATA: EngagementData[] = [
  { day: 'Mon', users: 145 },
  { day: 'Tue', users: 189 },
  { day: 'Wed', users: 234 },
  { day: 'Thu', users: 298 },
  { day: 'Fri', users: 356 },
  { day: 'Sat', users: 421 },
  { day: 'Sun', users: 389 },
]

const MOCK_RECENT_ACTIVITY: RecentActivity[] = [
  { id: '1', user: 'xXGamerXx', achievement: 'First Steps', time: '2 minutes ago' },
  { id: '2', user: 'StreamFan42', achievement: 'Chat Master', time: '5 minutes ago' },
  { id: '3', user: 'NightOwl', achievement: 'Loyal Viewer', time: '12 minutes ago' },
  { id: '4', user: 'ProGamer99', achievement: 'Week Warrior', time: '18 minutes ago' },
  { id: '5', user: 'CasualVibes', achievement: 'First Steps', time: '23 minutes ago' },
]

export function useDashboardData() {
  const [engagementData, setEngagementData] = useState<EngagementData[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setEngagementData(MOCK_ENGAGEMENT_DATA)
      setRecentActivity(MOCK_RECENT_ACTIVITY)
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return {
    engagementData,
    recentActivity,
    loading,
  }
}
