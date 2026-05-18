import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useChannel } from '../../../context/ChannelContext'
import { useLanguage } from '../../../context/LanguageContext'
import type { Language } from '../../../i18n/translations'
import {
  achievementManagementClient,
  AchievementManagementError,
} from '../../achievements/api/achievementManagementClient'
import type {
  Achievement,
  UserAchievement,
} from '../../achievements/api/achievementManagement.types'
import {
  getRealChannelId,
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

function getErrorMessage(error: unknown, language: Language) {
  if (error instanceof AchievementManagementError) {
    switch (error.status) {
      case 400:
        return language === 'fr'
          ? 'La requête du tableau de bord est invalide.'
          : 'The dashboard request is invalid.'
      case 404:
        return language === 'fr'
          ? 'Aucune donnée de succès n’a été trouvée pour ce tableau de bord.'
          : 'No achievement data was found for this dashboard.'
      case 502:
        return language === 'fr'
          ? 'Le service de succès est actuellement indisponible.'
          : 'The achievement service is currently unavailable.'
      default:
        return language === 'fr'
          ? 'Impossible de charger les succès du tableau de bord.'
          : 'Unable to load dashboard achievements.'
    }
  }

  return language === 'fr'
    ? 'Impossible de charger les succès du tableau de bord.'
    : 'Unable to load dashboard achievements.'
}

function buildEngagementData(
  achievements: UserAchievement[],
  language: Language
): EngagementData[] {
  const formatter = new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
    weekday: 'short',
  })
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

function formatRelativeTime(value: string | null, language: Language) {
  if (!value) {
    return language === 'fr' ? 'Pas encore débloqué' : 'Not unlocked yet'
  }

  const timestamp = new Date(value).getTime()

  if (Number.isNaN(timestamp)) {
    return language === 'fr' ? 'Récemment' : 'Recently'
  }

  const diffInMinutes = Math.max(1, Math.floor((Date.now() - timestamp) / (1000 * 60)))

  const formatWithRelativeTime = (unit: Intl.RelativeTimeFormatUnit, amount: number) => {
    const formatter = new Intl.RelativeTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
      numeric: 'auto',
    })

    return formatter.format(-amount, unit)
  }

  if (diffInMinutes < 60) {
    return formatWithRelativeTime('minute', diffInMinutes)
  }

  const diffInHours = Math.floor(diffInMinutes / 60)

  if (diffInHours < 24) {
    return formatWithRelativeTime('hour', diffInHours)
  }

  const diffInDays = Math.floor(diffInHours / 24)
  return formatWithRelativeTime('day', diffInDays)
}

function buildRecentActivity(
  achievements: UserAchievement[],
  language: ReturnType<typeof useLanguage>['language']
): RecentActivity[] {
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
      user: language === 'fr' ? 'Vous' : 'You',
      achievement: achievement.title,
      time: formatRelativeTime(achievement.userState.acquiredDate, language),
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
  const { language } = useLanguage()
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
      setErrorMessage(
        language === 'fr'
          ? 'Connecte-toi pour charger les succès du tableau de bord.'
          : 'Sign in to load dashboard achievements.'
      )
      setContextMessage(null)
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)

    const loadDashboardData = async () => {
      try {
        const userAchievementsPromise = selectedChannel
          ? achievementManagementClient.getUserChannelAchievements(
              user.userId,
              getRealChannelId(selectedChannel.id)
            )
          : achievementManagementClient.getUserAchievements(user.userId)

        const channelAchievementsPromise = selectedChannel
          ? achievementManagementClient.getChannelAchievements(getRealChannelId(selectedChannel.id))
          : Promise.resolve<Achievement[]>([])

        const [channelAchievements, userAchievements] = await Promise.all([
          channelAchievementsPromise,
          userAchievementsPromise,
        ])

        if (!isMounted) {
          return
        }

        setStats(buildStats(channelAchievements, userAchievements))
        setEngagementData(buildEngagementData(userAchievements, language))
        setRecentActivity(buildRecentActivity(userAchievements, language))
        setErrorMessage(null)
        setContextMessage(
          selectedChannel && !isOwnerAchievementChannelId(selectedChannel.id)
            ? getOwnerOnlyAchievementMessage(language, 'dashboard')
            : null
        )
      } catch (error) {
        if (!isMounted) {
          return
        }

        setEngagementData([])
        setRecentActivity([])
        setStats(EMPTY_STATS)
        setErrorMessage(getErrorMessage(error, language))
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
  }, [selectedChannel, user, language])

  return {
    engagementData,
    recentActivity,
    stats,
    loading,
    errorMessage,
    contextMessage,
  }
}
