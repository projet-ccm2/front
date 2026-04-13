import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useChannel } from '../../../context/ChannelContext'
import {
  achievementManagementClient,
  AchievementManagementError,
} from '../../achievements/api/achievementManagementClient'
import type { UserAchievement } from '../../achievements/api/achievementManagement.types'
import { isOwnerAchievementChannelId } from '../../achievements/utils/achievementManagementChannel'

interface UseUserAchievementsResult {
  achievements: UserAchievement[]
  isLoading: boolean
  errorMessage: string | null
}

function getErrorMessage(error: unknown) {
  if (error instanceof AchievementManagementError) {
    switch (error.status) {
      case 400:
        return 'The current profile request is invalid.'
      case 404:
        return 'No achievement progress was found for this profile.'
      case 502:
        return 'The achievement service is currently unavailable.'
      default:
        return 'Unable to load profile achievements.'
    }
  }

  return 'Unable to load profile achievements.'
}

export function useUserAchievements(): UseUserAchievementsResult {
  const { user } = useAuth()
  const { selectedChannel } = useChannel()
  const [achievements, setAchievements] = useState<UserAchievement[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(user))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setAchievements([])
      setErrorMessage('Sign in to load profile achievements.')
      setIsLoading(false)
      return
    }

    let isMounted = true
    setIsLoading(true)

    const loadAchievements = async () => {
      try {
        const data =
          selectedChannel && isOwnerAchievementChannelId(selectedChannel.id)
            ? await achievementManagementClient.getUserChannelAchievements(
                user.userId,
                selectedChannel.id
              )
            : await achievementManagementClient.getUserAchievements(user.userId)

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
  }, [selectedChannel, user])

  return {
    achievements,
    isLoading,
    errorMessage,
  }
}
