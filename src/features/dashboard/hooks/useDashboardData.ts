import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useChannel } from '../../../context/ChannelContext'
import {
  achievementManagementClient,
  AchievementManagementError,
} from '../../achievements/api/achievementManagementClient'
import type {
  Achievement,
  UserAchievement,
} from '../../achievements/api/achievementManagement.types'
import {
  getOwnerOnlyAchievementMessage,
  isOwnerAchievementChannelId,
} from '../../achievements/utils/achievementManagementChannel'

export interface EngagementData {
  day: string
  unlocks: number
}

export interface RecentActivity {
  id: string
  user: string
  achievement: string
  time: string
}

export interface DashboardStats {
  activeAchievements: number
  totalAchievements: number
  publicTemplates: number
  completedAchievements: number
  totalXpEarned: number
}

interface DashboardDataResult {
  engagementData: EngagementData[]
  recentActivity: RecentActivity[]
  stats: DashboardStats
  loading: boolean
  errorMessage: string | null
  contextMessage: string | null
}

const EMPTY_STATS: DashboardStats = {
  activeAchievements: 0,
  totalAchievements: 0,
  publicTemplates: 0,
  completedAchievements: 0,
  totalXpEarned: 0,
}

function getErrorMessage(error: unknown) {
  if (error instanceof AchievementManagementError) {
    switch (error.status) {
      case 400:
        return 'The dashboard request is invalid.'
      case 404:
        return 'No achievement data was found for this dashboard.'
      case 502:
        return 'The achievement service is currently unavailable.'
      default:
        return 'Unable to load dashboard achievements.'
    }
  }

  return 'Unable to load dashboard achievements.'
}

function buildEngagementData(achievements: UserAchievement[]): EngagementData[] {
  const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' })
  const today = new Date()
  const countsByDay = new Map<string, number>()

  achievements.forEach(achievement => {
    const acquiredDate = achievement.userState.acquiredDate

    if (!achievement.userState.finished || !acquiredDate) {
      return
    }

    const acquiredAt = new Date(acquiredDate)
    const diffInDays = Math.floor((today.getTime() - acquiredAt.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays < 0 || diffInDays > 6) {
      return
    }

    const key = acquiredAt.toDateString()
    countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1)
  })

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))

    return {
      day: formatter.format(date),
      unlocks: countsByDay.get(date.toDateString()) ?? 0,
    }
  })
}

function formatRelativeTime(value: string | null) {
  if (!value) {
    return 'Not unlocked yet'
  }

  const timestamp = new Date(value).getTime()

  if (Number.isNaN(timestamp)) {
    return 'Recently'
  }

  const diffInMinutes = Math.max(1, Math.floor((Date.now() - timestamp) / (1000 * 60)))

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)

  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
}

function buildRecentActivity(achievements: UserAchievement[]): RecentActivity[] {
  return achievements
    .filter(achievement => achievement.userState.finished)
    .sort((left, right) => {
      const leftDate = left.userState.acquiredDate
        ? new Date(left.userState.acquiredDate).getTime()
        : 0
      const rightDate = right.userState.acquiredDate
        ? new Date(right.userState.acquiredDate).getTime()
        : 0

      return rightDate - leftDate
    })
    .slice(0, 5)
    .map(achievement => ({
      id: achievement.id,
      user: 'You',
      achievement: achievement.title,
      time: formatRelativeTime(achievement.userState.acquiredDate),
    }))
}

function buildStats(
  channelAchievements: Achievement[],
  userAchievements: UserAchievement[]
): DashboardStats {
  const completedAchievements = userAchievements.filter(
    achievement => achievement.userState.finished
  )

  return {
    activeAchievements: channelAchievements.filter(achievement => achievement.active).length,
    totalAchievements: channelAchievements.length,
    publicTemplates: channelAchievements.filter(achievement => achievement.public).length,
    completedAchievements: completedAchievements.length,
    totalXpEarned: completedAchievements.reduce(
      (total, achievement) => total + achievement.reward,
      0
    ),
  }
}

export function useDashboardData(): DashboardDataResult {
  const { user } = useAuth()
  const { selectedChannel } = useChannel()
  const [engagementData, setEngagementData] = useState<EngagementData[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS)
  const [loading, setLoading] = useState(Boolean(user))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [contextMessage, setContextMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setEngagementData([])
      setRecentActivity([])
      setStats(EMPTY_STATS)
      setErrorMessage('Sign in to load dashboard achievements.')
      setContextMessage(null)
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)

    const loadDashboardData = async () => {
      try {
        const userAchievementsPromise =
          selectedChannel && isOwnerAchievementChannelId(selectedChannel.id)
            ? achievementManagementClient.getUserChannelAchievements(
                user.userId,
                selectedChannel.id
              )
            : achievementManagementClient.getUserAchievements(user.userId)

        const channelAchievementsPromise =
          selectedChannel && isOwnerAchievementChannelId(selectedChannel.id)
            ? achievementManagementClient.getChannelAchievements(selectedChannel.id)
            : Promise.resolve<Achievement[]>([])

        const [channelAchievements, userAchievements] = await Promise.all([
          channelAchievementsPromise,
          userAchievementsPromise,
        ])

        if (!isMounted) {
          return
        }

        setStats(buildStats(channelAchievements, userAchievements))
        setEngagementData(buildEngagementData(userAchievements))
        setRecentActivity(buildRecentActivity(userAchievements))
        setErrorMessage(null)
        setContextMessage(
          selectedChannel && !isOwnerAchievementChannelId(selectedChannel.id)
            ? getOwnerOnlyAchievementMessage('dashboard')
            : null
        )
      } catch (error) {
        if (!isMounted) {
          return
        }

        setEngagementData([])
        setRecentActivity([])
        setStats(EMPTY_STATS)
        setErrorMessage(getErrorMessage(error))
        setContextMessage(null)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadDashboardData()

    return () => {
      isMounted = false
    }
  }, [selectedChannel, user])

  return {
    engagementData,
    recentActivity,
    stats,
    loading,
    errorMessage,
    contextMessage,
  }
}
