import { useEffect, useState } from 'react'
import {
  achievementManagementClient,
  AchievementManagementError,
} from '../api/achievementManagementClient'
import type { Achievement } from '../api/achievementManagement.types'
import {
  getOwnerOnlyAchievementMessage,
  isOwnerAchievementChannelId,
} from '../utils/achievementManagementChannel'

interface UseChannelAchievementsResult {
  achievements: Achievement[]
  isLoading: boolean
  errorMessage: string | null
}

function getErrorMessage(error: unknown) {
  if (error instanceof AchievementManagementError) {
    switch (error.status) {
      case 400:
        return 'The selected channel cannot be queried with the current request.'
      case 404:
        return 'No achievements were found for this channel.'
      case 502:
        return 'The achievement service is currently unavailable.'
      default:
        return 'Unable to load channel achievements.'
    }
  }

  return 'Unable to load channel achievements.'
}

export function useChannelAchievements(channelId: string | null): UseChannelAchievementsResult {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(channelId))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!channelId) {
      setAchievements([])
      setErrorMessage('Select a channel to load achievements.')
      setIsLoading(false)
      return
    }

    if (!isOwnerAchievementChannelId(channelId)) {
      setAchievements([])
      setErrorMessage(getOwnerOnlyAchievementMessage('channel'))
      setIsLoading(false)
      return
    }

    let isMounted = true
    setIsLoading(true)

    const loadAchievements = async () => {
      try {
        const data = await achievementManagementClient.getChannelAchievements(channelId)

        if (!isMounted) {
          return
        }

        setAchievements(data)
        setErrorMessage(null)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setAchievements([])
        setErrorMessage(getErrorMessage(error))
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadAchievements()

    return () => {
      isMounted = false
    }
  }, [channelId])

  return {
    achievements,
    isLoading,
    errorMessage,
  }
}
